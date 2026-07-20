import { buildCollection } from "@firecms/core";
import { categoryPreviewView } from "./previews/LivePreview";

export type Category = {
  name: string;
  slug: string;
  description: string;
  image: string;
  active: boolean;
  highlight?: boolean;
  sort_order: number;
  seo_title?: string;
  meta_description?: string;
  og_image?: string;
  canonical_url?: string;
  no_index?: boolean;
  created_at: Date;
  updated_at: Date;
};

export const categoriesCollection = buildCollection<Category>({
  name: "Danh mục",
  singularName: "Danh mục",
  id: "categories",
  path: "categories",
  group: "Nội dung website",

  permissions: () => ({
    read: true,
    edit: true,
    create: true,
    delete: true,
  }),

  properties: {
    name: {
      name: "Tên danh mục",
      dataType: "string",
      validation: { required: true },
      columnWidth: 260,
    },

    slug: {
      name: "Slug",
      dataType: "string",
      description: "Ví dụ: lang-mo-da",
      validation: { required: true },
      columnWidth: 240,
    },

    description: {
      name: "Mô tả",
      dataType: "string",
      multiline: true,
      columnWidth: 320,
    },

    image: {
      name: "Ảnh đại diện",
      dataType: "string",
      storage: {
        storagePath: "categories",
        acceptedFiles: ["image/*"],
      storeUrl: true,
      },
    },

    active: {
      name: "Hiển thị",
      dataType: "boolean",
      defaultValue: true,
    },

    highlight: {
      name: "Nổi bật (Highlight Dropdown)",
      dataType: "boolean",
      description: "Bật để hiển thị danh mục này trong menu thả xuống (dropdown) Sản phẩm",
      defaultValue: false,
    },

    sort_order: {
      name: "Thứ tự hiển thị",
      dataType: "number",
      defaultValue: 0,
      validation: { min: 0 },
    },

    seo_title: {
      name: "SEO Title",
      dataType: "string",
      description: "Tiêu đề hiển thị trên Google",
    },

    meta_description: {
      name: "Meta Description",
      dataType: "string",
      multiline: true,
      description: "Mô tả dành cho công cụ tìm kiếm",
    },

    og_image: {
      name: "Ảnh Open Graph (OG)",
      dataType: "string",
      storage: {
        storagePath: "categories/seo",
        acceptedFiles: ["image/*"],
        storeUrl: true,
      },
    },

    canonical_url: {
      name: "Canonical URL",
      dataType: "string",
    },

    no_index: {
      name: "Bật No Index",
      dataType: "boolean",
      defaultValue: false,
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
  entityViews: [categoryPreviewView],
});
