import { buildCollection } from "@firecms/core";

export type Post = {
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  content: string;
  category: "knowledge" | "consulting" | "news" | "feng_shui";
  author: string;
  status: "draft" | "published" | "hidden";
  featured: boolean;
  published_at?: Date;
  seo_title?: string;
  seo_description?: string;
  meta_description?: string;
  og_image?: string;
  canonical_url?: string;
  no_index?: boolean;
  created_at: Date;
  updated_at: Date;
};

export const postsCollection = buildCollection<Post>({
  name: "Bài viết",
  singularName: "Bài viết",
  id: "posts",
  path: "posts",
  group: "Nội dung website",

  permissions: () => ({
    read: true,
    edit: true,
    create: true,
    delete: true,
  }),

  properties: {
    title: {
      name: "Tiêu đề",
      dataType: "string",
      validation: { required: true },
      columnWidth: 320,
    },

    slug: {
      name: "Slug",
      dataType: "string",
      description: "Ví dụ: cach-chon-da-lam-lang-mo",
      validation: { required: true },
      columnWidth: 260,
    },

    excerpt: {
      name: "Mô tả ngắn",
      dataType: "string",
      multiline: true,
      columnWidth: 320,
    },

    cover_image: {
      name: "Ảnh đại diện",
      dataType: "string",
      storage: {
        storagePath: "posts/cover",
        acceptedFiles: ["image/*"],
      storeUrl: true,
      },
    },

    content: {
      name: "Nội dung bài viết",
      dataType: "string",
      markdown: true,
      validation: { required: true },
    },

    category: {
      name: "Chuyên mục",
      dataType: "string",
      validation: { required: true },
      enumValues: {
        knowledge: "Kiến thức",
        consulting: "Tư vấn",
        news: "Tin tức",
        feng_shui: "Phong thủy",
      },
      defaultValue: "knowledge",
    },

    author: {
      name: "Tác giả",
      dataType: "string",
      defaultValue: "Admin",
    },

    status: {
      name: "Trạng thái",
      dataType: "string",
      validation: { required: true },
      enumValues: {
        draft: "Bản nháp",
        published: "Đã xuất bản",
        hidden: "Đã ẩn",
      },
      defaultValue: "draft",
    },

    featured: {
      name: "Bài viết nổi bật",
      dataType: "boolean",
      defaultValue: false,
    },

    published_at: {
      name: "Ngày xuất bản",
      dataType: "date",
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

    seo_description: {
      name: "SEO Description (Cũ)",
      dataType: "string",
      multiline: true,
      description: "Mô tả cũ dành cho công cụ tìm kiếm",
    },

    og_image: {
      name: "Ảnh Open Graph (OG)",
      dataType: "string",
      storage: {
        storagePath: "posts/seo",
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
});
