import { FirebaseApp } from "firebase/app";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";
import {
  DownloadConfig,
  StorageListResult,
  StorageSource,
  UploadFileProps,
  UploadFileResult,
} from "@firecms/core";

export type R2StorageSourceProps = {
  apiBaseUrl: string;
  publicBaseUrl: string;
  getAuthToken: () => Promise<string>;
  firebaseApp: FirebaseApp | undefined;
  getCurrentUserEmail: () => string | null;
};

type UploadResponse = {
  path: string;
  publicUrl: string;
};

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, "");
}

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function encodeObjectPath(path: string): string {
  return trimSlashes(path)
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function fileNameFromPath(path: string): string {
  const clean = path.split("?")[0].split("#")[0];
  const name = clean.split("/").pop();
  return name || "file";
}

export function buildR2StorageSource({
  apiBaseUrl,
  publicBaseUrl,
  getAuthToken,
  firebaseApp,
  getCurrentUserEmail,
}: R2StorageSourceProps): StorageSource {
  const apiBase = trimTrailingSlash(apiBaseUrl);
  const publicBase = trimTrailingSlash(publicBaseUrl);

  const buildPublicUrl = (pathOrUrl: string): string => {
    if (isAbsoluteUrl(pathOrUrl)) return pathOrUrl;
    return `${publicBase}/${encodeObjectPath(pathOrUrl)}`;
  };

  const authHeaders = async (): Promise<Record<string, string>> => {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  return {
    async uploadFile({
      file,
      fileName,
      path,
      bucket,
    }: UploadFileProps): Promise<UploadFileResult> {
      const formData = new FormData();
      formData.append("file", file, fileName ?? file.name);
      formData.append("path", path || "uploads");

      const response = await fetch(`${apiBase}/upload`, {
        method: "POST",
        headers: await authHeaders(),
        body: formData,
      });

      const rawText = await response.text();

      let payload: UploadResponse | { error?: string };
      try {
        payload = rawText ? JSON.parse(rawText) : {};
      } catch {
        throw new Error(
          `R2 upload API không trả JSON hợp lệ. HTTP ${response.status}`
        );
      }

      if (!response.ok) {
        const message =
          "error" in payload && payload.error
            ? payload.error
            : `Upload R2 thất bại. HTTP ${response.status}`;
        throw new Error(message);
      }

      if (!("path" in payload) || !payload.path) {
        throw new Error("R2 upload API không trả về path hợp lệ.");
      }

      const uploadResponse = payload as UploadResponse;

      if (firebaseApp) {
        try {
          await addDoc(collection(getFirestore(firebaseApp), "media"), {
            fileName: fileName ?? file.name,
            path: uploadResponse.path,
            url:
              uploadResponse.publicUrl ?? buildPublicUrl(uploadResponse.path),
            mimeType: file.type || "application/octet-stream",
            size: file.size,
            uploadedBy: getCurrentUserEmail() ?? "",
            created_at: serverTimestamp(),
          });
        } catch (error) {
          console.error("Không ghi được metadata media vào Firestore:", error);
        }
      }

      return {
        path: payload.path,
        bucket: bucket ?? "r2",
      };
    },

    async getDownloadURL(
      pathOrUrl: string,
      _bucket?: string
    ): Promise<DownloadConfig> {
      const url = buildPublicUrl(pathOrUrl);

      return {
        url,
        metadata: {
          bucket: "r2",
          fullPath: pathOrUrl,
          name: fileNameFromPath(pathOrUrl),
          size: 0,
          contentType: "",
          customMetadata: {},
        },
      };
    },

    async getFile(path: string, _bucket?: string): Promise<File | null> {
      try {
        const response = await fetch(
          `${apiBase}/file?path=${encodeURIComponent(path)}`,
          {
            method: "GET",
            headers: await authHeaders(),
          }
        );

        if (response.status === 404) {
          return null;
        }

        if (!response.ok) {
          throw new Error(`Không đọc được file R2. HTTP ${response.status}`);
        }

        const blob = await response.blob();

        return new File([blob], fileNameFromPath(path), {
          type: blob.type || "application/octet-stream",
        });
      } catch (error) {
        console.error("R2 getFile error:", error);
        return null;
      }
    },

    async deleteFile(path: string, _bucket?: string): Promise<void> {
      const response = await fetch(
        `${apiBase}/file?path=${encodeURIComponent(path)}`,
        {
          method: "DELETE",
          headers: await authHeaders(),
        }
      );

      if (!response.ok && response.status !== 404) {
        throw new Error(`Không xoá được file R2. HTTP ${response.status}`);
      }
    },

    async list(
      _path: string,
      _options?: {
        bucket?: string;
        maxResults?: number;
        pageToken?: string;
      }
    ): Promise<StorageListResult> {
      throw new Error("Worker R2 chưa hỗ trợ liệt kê file.");
    },
  };
}
