import { buildCollection } from "@firecms/core";

export type BrandIntroduction = {
  title: string;
  content: string;
  image?: string;
  sort_order: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
};

export const brandIntroductionsCollection = buildCollection<BrandIntroduction>({
  name: "Giới thiệu thương hiệu",
  singularName: "Mục giới thiệu",
  id: "brand_introductions",
  path: "brand_introductions",
  group: "Nội dung website",

  permissions: () => ({
    read: true,
    edit: true,
    create: true,
    delete: true,
  }),

  properties: {
    title: {
      name: "Tiêu đề mục",
      dataType: "string",
      validation: { required: true },
      columnWidth: 260,
    },

    content: {
      name: "Nội dung chi tiết",
      dataType: "string",
      multiline: true,
      validation: { required: true },
      columnWidth: 450,
    },

    image: {
      name: "Ảnh minh họa bên phải",
      dataType: "string",
      description: "Có thể tải lên một ảnh đại diện cho phần giới thiệu này",
      storage: {
        storagePath: "brand_introductions",
        acceptedFiles: ["image/*"],
        storeUrl: true,
      },
    },

    sort_order: {
      name: "Thứ tự hiển thị",
      dataType: "number",
      defaultValue: 0,
      validation: { min: 0 },
    },

    active: {
      name: "Hiển thị",
      dataType: "boolean",
      defaultValue: true,
    },

    created_at: {
      name: "Ngày tạo",
      dataType: "date",
      autoValue: "on_create",
    },

    updated_at: {
      name: "Cập nhật lần cuối",
      dataType: "date",
      autoValue: "on_update",
    },
  },
});
