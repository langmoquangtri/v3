import { buildCollection } from "@firecms/core";
import { projectPreviewView } from "./previews/LivePreview";

export type Project = {
  name: string;
  slug: string;
  location: string;
  customer_name: string;
  main_image: string;
  images: string[];
  material?: string;
  year?: string;
  scope?: string[];
  short_description: string;
  content: string;
  completed_date?: Date;
  status: "draft" | "published" | "hidden";
  featured: boolean;
  sort_order: number;
  seo_title?: string;
  seo_description?: string;
  meta_description?: string;
  og_image?: string;
  canonical_url?: string;
  no_index?: boolean;
  created_at: Date;
  updated_at: Date;
};

export const projectsCollection = buildCollection<Project>({
  name: "Công trình",
  singularName: "Công trình",
  id: "projects",
  path: "projects",
  group: "Nội dung website",

  permissions: () => ({
    read: true,
    edit: true,
    create: true,
    delete: true,
  }),

  properties: {
    name: {
      name: "Tên công trình",
      dataType: "string",
      validation: { required: true },
      columnWidth: 280,
    },

    slug: {
      name: "Slug",
      dataType: "string",
      description: "Ví dụ: lang-mo-da-xanh-tai-ha-noi",
      validation: { required: true },
      columnWidth: 260,
    },

    location: {
      name: "Địa điểm",
      dataType: "string",
      description: "Ví dụ: Hà Nội, Thanh Hóa, Ninh Bình...",
      columnWidth: 220,
    },

    material: {
      name: "Chất liệu đá chính",
      dataType: "string",
      description: "Ví dụ: Đá xanh rêu, Đá xanh tự nhiên, Đá hoa cương...",
    },

    year: {
      name: "Năm hoàn thành",
      dataType: "string",
      description: "Ví dụ: 2026, 2025, hoặc 'Tháng 8/2026'",
    },

    scope: {
      name: "Hạng mục triển khai",
      dataType: "array",
      description: "Các hạng mục thực hiện cho công trình này (Ấn Enter hoặc Add để thêm dòng mới)",
      of: {
        dataType: "string"
      }
    },

    customer_name: {
      name: "Tên khách hàng",
      dataType: "string",
      description: "Có thể để trống nếu không muốn công khai",
    },

    main_image: {
      name: "Ảnh đại diện",
      dataType: "string",
      storage: {
        storagePath: "projects/main",
        acceptedFiles: ["image/*"],
      storeUrl: true,
      },
    },

    images: {
      name: "Thư viện ảnh",
      dataType: "array",
      description: "Tải nhiều ảnh thực tế của công trình",
      of: {
        dataType: "string",
        storage: {
          storagePath: "projects/gallery",
          acceptedFiles: ["image/*"],
        storeUrl: true,
        },
      },
    },

    short_description: {
      name: "Mô tả ngắn",
      dataType: "string",
      multiline: true,
      columnWidth: 320,
    },

    content: {
      name: "Nội dung chi tiết",
      dataType: "string",
      markdown: true,
      description: "Nội dung chi tiết của công trình",
    },

    completed_date: {
      name: "Ngày hoàn thiện",
      dataType: "date",
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
      name: "Công trình nổi bật",
      dataType: "boolean",
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
        storagePath: "projects/seo",
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
  entityViews: [projectPreviewView],
});
