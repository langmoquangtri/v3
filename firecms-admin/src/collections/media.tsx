import { buildCollection } from "@firecms/core";

export type Media = {
  fileName: string;
  path: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  created_at: Date;
};

export const mediaCollection = buildCollection<Media>({
  name: "Thư viện ảnh",
  singularName: "Ảnh",
  id: "media",
  path: "media",
  group: "Nội dung website",

  permissions: () => ({
    read: true,
    edit: true,
    create: true,
    delete: true,
  }),

  properties: {
    fileName: {
      name: "Tên file",
      dataType: "string",
      columnWidth: 280,
    },

    url: {
      name: "Ảnh",
      dataType: "string",
      url: "image",
      columnWidth: 200,
    },

    path: {
      name: "Đường dẫn R2",
      dataType: "string",
      readOnly: true,
      columnWidth: 260,
    },

    mimeType: {
      name: "Loại file",
      dataType: "string",
      readOnly: true,
      columnWidth: 140,
    },

    size: {
      name: "Kích thước (bytes)",
      dataType: "number",
      readOnly: true,
      columnWidth: 140,
    },

    uploadedBy: {
      name: "Người tải lên",
      dataType: "string",
      readOnly: true,
      columnWidth: 220,
    },

    created_at: {
      name: "Ngày tải lên",
      dataType: "date",
      autoValue: "on_create",
    },
  },

  callbacks: {
    onPreDelete: async ({ entity, context }) => {
      const path = entity.values.path;
      if (!path) return;
      try {
        await context.storageSource.deleteFile(path);
      } catch (error) {
        console.error("Không xoá được file R2 khi xoá media:", error);
      }
    },
  },
});
