interface Env {
  IMAGES: R2Bucket;
  PUBLIC_BASE_URL: string;
  FIREBASE_API_KEY: string;
  ALLOWED_EMAILS?: string;
  ALLOWED_ORIGINS?: string;
}

type FirebaseUser = {
  localId?: string;
  email?: string;
  emailVerified?: boolean;
};

const MAX_FILE_SIZE = 15 * 1024 * 1024;

function json(
  data: unknown,
  status = 200,
  extraHeaders: HeadersInit = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

function parseCsv(value?: string): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getCorsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get("Origin") ?? "";
  const allowedOrigins = parseCsv(env.ALLOWED_ORIGINS);

  let allowOrigin = "*";

  if (allowedOrigins.length > 0 && !allowedOrigins.includes("*")) {
    allowOrigin = allowedOrigins.includes(origin) ? origin : "";
  }

  return {
    ...(allowOrigin
      ? {
          "Access-Control-Allow-Origin": allowOrigin,
          Vary: "Origin",
        }
      : {}),
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function sanitizePath(input: string): string {
  return input
    .replace(/\\/g, "/")
    .split("/")
    .filter((part) => part && part !== "." && part !== "..")
    .map((part) => part.replace(/[^a-zA-Z0-9._-]/g, "-"))
    .join("/");
}

function sanitizeFileName(input: string): string {
  const cleaned = input
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned || "image";
}

function encodeObjectPath(path: string): string {
  return path
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function publicUrl(env: Env, key: string): string {
  return `${env.PUBLIC_BASE_URL.replace(/\/+$/, "")}/${encodeObjectPath(key)}`;
}

async function verifyFirebaseUser(
  request: Request,
  env: Env
): Promise<FirebaseUser | null> {
  const authHeader = request.headers.get("Authorization") ?? "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);

  if (!match) return null;

  const idToken = match[1];

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(
      env.FIREBASE_API_KEY
    )}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    }
  );

  if (!response.ok) return null;

  const payload = (await response.json()) as { users?: FirebaseUser[] };
  const user = payload.users?.[0];

  if (!user?.email) return null;

  const allowedEmails = parseCsv(env.ALLOWED_EMAILS).map((email) =>
    email.toLowerCase()
  );

  if (
    allowedEmails.length > 0 &&
    !allowedEmails.includes(user.email.toLowerCase())
  ) {
    return null;
  }

  return user;
}

async function requireUser(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<FirebaseUser | Response> {
  const user = await verifyFirebaseUser(request, env);

  if (!user) {
    return json(
      { error: "Không có quyền truy cập hoặc phiên đăng nhập không hợp lệ." },
      401,
      corsHeaders
    );
  }

  return user;
}

async function handleUpload(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const userOrResponse = await requireUser(request, env, corsHeaders);
  if (userOrResponse instanceof Response) return userOrResponse;

  const formData = await request.formData();
  const file = formData.get("file");
  const requestedPath = String(formData.get("path") ?? "uploads");

  if (!(file instanceof File)) {
    return json({ error: "Thiếu file upload." }, 400, corsHeaders);
  }

  if (!file.type.startsWith("image/")) {
    return json(
      { error: "Chỉ cho phép upload file hình ảnh." },
      415,
      corsHeaders
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return json(
      { error: "Ảnh vượt quá giới hạn 15 MB." },
      413,
      corsHeaders
    );
  }

  const safePath = sanitizePath(requestedPath) || "uploads";
  const safeName = sanitizeFileName(file.name);
  const uniqueName = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const key = `${safePath}/${uniqueName}`;

  await env.IMAGES.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type || "application/octet-stream",
      cacheControl: "public, max-age=31536000, immutable",
    },
    customMetadata: {
      uploadedBy: userOrResponse.email ?? "",
    },
  });

  return json(
    {
      path: key,
      publicUrl: publicUrl(env, key),
    },
    201,
    corsHeaders
  );
}

async function handleGetFile(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const userOrResponse = await requireUser(request, env, corsHeaders);
  if (userOrResponse instanceof Response) return userOrResponse;

  const url = new URL(request.url);
  const path = url.searchParams.get("path");

  if (!path) {
    return json({ error: "Thiếu query path." }, 400, corsHeaders);
  }

  const object = await env.IMAGES.get(path);

  if (!object) {
    return json({ error: "Không tìm thấy file." }, 404, corsHeaders);
  }

  const headers = new Headers(corsHeaders);
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);

  return new Response(object.body, {
    status: 200,
    headers,
  });
}

async function handleDeleteFile(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const userOrResponse = await requireUser(request, env, corsHeaders);
  if (userOrResponse instanceof Response) return userOrResponse;

  const url = new URL(request.url);
  const path = url.searchParams.get("path");

  if (!path) {
    return json({ error: "Thiếu query path." }, 400, corsHeaders);
  }

  await env.IMAGES.delete(path);

  return json({ ok: true }, 200, corsHeaders);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = getCorsHeaders(request, env);

    if (request.method === "OPTIONS") {
      if (!corsHeaders["Access-Control-Allow-Origin"]) {
        return new Response(null, { status: 403 });
      }

      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (!corsHeaders["Access-Control-Allow-Origin"]) {
      return json({ error: "Origin không được phép." }, 403);
    }

    const url = new URL(request.url);

    try {
      if (request.method === "GET" && url.pathname === "/health") {
        return json({ ok: true }, 200, corsHeaders);
      }

      if (request.method === "POST" && url.pathname === "/upload") {
        return await handleUpload(request, env, corsHeaders);
      }

      if (request.method === "GET" && url.pathname === "/file") {
        return await handleGetFile(request, env, corsHeaders);
      }

      if (request.method === "DELETE" && url.pathname === "/file") {
        return await handleDeleteFile(request, env, corsHeaders);
      }

      return json({ error: "Not found" }, 404, corsHeaders);
    } catch (error) {
      console.error(error);

      return json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Lỗi không xác định trong R2 upload Worker.",
        },
        500,
        corsHeaders
      );
    }
  },
} satisfies ExportedHandler<Env>;
