import { buildCollection, EntityReference } from "@firecms/core";
import { productPreviewView } from "./previews/LivePreview";
import { MediaPickerField } from "./fields/MediaPickerField";
import { ProductCSVImport } from "./components/ProductCSVImport";

export type ProductSpecification = {
  label: string;
  value: string;
};

export type Product = {
  name: string;
  slug: string;
  sku: string;
  category?: EntityReference;
  main_image: string;
  images: string[];
  reference_price?: number;
  material: string;
  dimensions: string;
  specifications?: ProductSpecification[];
  short_description: string;
  content: string;
  video_url?: string;
  supplementary_images?: string[];
  features?: string[];
  commitments?: string[];
  fengshui_tip?: string;
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

export const productsCollection = buildCollection<Product>({
  name: "Sản phẩm",
  singularName: "Sản phẩm",
  id: "products",
  path: "products",
  group: "Nội dung website",
  Actions: ProductCSVImport,

  permissions: () => ({
    read: true,
    edit: true,
    create: true,
    delete: true,
  }),

  properties: {
    name: {
      name: "Tên sản phẩm",
      dataType: "string",
      validation: { required: true },
      columnWidth: 280,
    },

    slug: {
      name: "Slug",
      dataType: "string",
      description: "Ví dụ: lang-mo-da-xanh-thanh-hoa",
      validation: { required: true, unique: true },
      columnWidth: 260,
    },

    sku: {
      name: "Mã sản phẩm",
      dataType: "string",
      description: "Ví dụ: LM001",
      columnWidth: 150,
    },

    category: {
      name: "Danh mục",
      dataType: "reference",
      path: "categories",
      description: "Chọn danh mục sản phẩm",
    },

    main_image: {
      name: "Ảnh đại diện",
      dataType: "string",
      storage: {
        storagePath: "products/main",
        acceptedFiles: ["image/*"],
      storeUrl: true,
      },
    },

    images: {
      name: "Thư viện ảnh",
      dataType: "array",
      description: "Tải lên nhiều ảnh của sản phẩm",
      of: {
        dataType: "string",
        storage: {
          storagePath: "products/gallery",
          acceptedFiles: ["image/*"],
        storeUrl: true,
        },
      },
    },

    reference_price: {
      name: "Giá tham khảo",
      dataType: "number",
      description: "Có thể để trống nếu báo giá theo yêu cầu",
      validation: { min: 0 },
    },

    material: {
      name: "Chất liệu đá",
      dataType: "string",
      description: "Ví dụ: Đá xanh Thanh Hóa, đá xanh rêu, granite...",
      columnWidth: 220,
    },

    dimensions: {
      name: "Kích thước",
      dataType: "string",
      description: "Ví dụ: 81 × 127 cm",
      columnWidth: 180,
    },

    specifications: {
      name: "Thông số kỹ thuật",
      dataType: "array",
      description: "Thêm các thông số kỹ thuật dạng nhãn/giá trị",
      of: {
        dataType: "map",
        properties: {
          label: {
            name: "Tên thông số",
            dataType: "string",
            validation: { required: true },
          },
          value: {
            name: "Giá trị",
            dataType: "string",
            validation: { required: true },
          },
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
      description: "Nội dung chi tiết hiển thị trên trang sản phẩm",
    },

    video_url: {
      name: "Video YouTube",
      dataType: "string",
      description: "Dán link YouTube (watch?v=... hoặc youtu.be/...)",
      validation: {
        matches: /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/,
      },
    },

    supplementary_images: {
      name: "Ảnh minh họa bổ sung",
      dataType: "array",
      description: "Chọn ảnh có sẵn từ Thư viện ảnh để minh họa thêm",
      of: {
        dataType: "string",
      },
      Field: MediaPickerField,
    },

    features: {
      name: "Đặc điểm nổi trội",
      dataType: "array",
      description: "Các đặc điểm nổi trội từ xưởng (ấn Enter để thêm dòng mới)",
      of: {
        dataType: "string",
      },
    },

    commitments: {
      name: "Cam kết chế tác",
      dataType: "array",
      description: "Các gạch đầu dòng cam kết, ưu đãi (ấn Enter để thêm dòng mới)",
      of: {
        dataType: "string",
      },
    },

    fengshui_tip: {
      name: "Mách nhỏ phong thủy",
      dataType: "string",
      multiline: true,
      description: "Lời khuyên hay ý nghĩa phong thủy hiển thị ở chân bảng thông số",
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
      name: "Sản phẩm nổi bật",
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
      columnWidth: 280,
    },

    meta_description: {
      name: "Meta Description",
      dataType: "string",
      multiline: true,
      description: "Mô tả dành cho công cụ tìm kiếm",
      columnWidth: 320,
    },

    seo_description: {
      name: "SEO Description (Cũ)",
      dataType: "string",
      multiline: true,
      description: "Mô tả cũ dành cho công cụ tìm kiếm",
      columnWidth: 320,
    },

    og_image: {
      name: "Ảnh Open Graph (OG)",
      dataType: "string",
      storage: {
        storagePath: "products/seo",
        acceptedFiles: ["image/*"],
        storeUrl: true,
      },
    },

    canonical_url: {
      name: "Canonical URL",
      dataType: "string",
      columnWidth: 240,
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
  entityViews: [productPreviewView],
});
