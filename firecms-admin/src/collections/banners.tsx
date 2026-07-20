import { buildCollection } from "@firecms/core";

export type Banner = {
  title: string;
  subtitle: string;
  image: string;
  mobile_image: string;
  link: string;
  button_text: string;
  position: "home_hero" | "home_middle" | "product" | "project";
  active: boolean;
  sort_order: number;
  start_at?: Date;
  end_at?: Date;
  created_at: Date;
  updated_at: Date;
};

export const bannersCollection = buildCollection<Banner>({
  name: "Banner",
  singularName: "Banner",
  id: "banners",
  path: "banners",
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
      columnWidth: 280,
    },

    subtitle: {
      name: "Mô tả phụ",
      dataType: "string",
      multiline: true,
      columnWidth: 320,
    },

    image: {
      name: "Ảnh desktop",
      dataType: "string",
      storage: {
        storagePath: "banners/desktop",
        acceptedFiles: ["image/*"],
      storeUrl: true,
      },
    },

    mobile_image: {
      name: "Ảnh mobile",
      dataType: "string",
      storage: {
        storagePath: "banners/mobile",
        acceptedFiles: ["image/*"],
      storeUrl: true,
      },
    },

    link: {
      name: "Đường dẫn",
      dataType: "string",
      description: "Ví dụ: /san-pham/lang-mo-da-xanh",
    },

    button_text: {
      name: "Nội dung nút",
      dataType: "string",
      description: "Ví dụ: Xem chi tiết",
    },

    position: {
      name: "Vị trí hiển thị",
      dataType: "string",
      validation: { required: true },
      enumValues: {
        home_hero: "Trang chủ - Hero",
        home_middle: "Trang chủ - Giữa trang",
        product: "Trang sản phẩm",
        project: "Trang công trình",
      },
      defaultValue: "home_hero",
    },

    active: {
      name: "Hiển thị",
      dataType: "boolean",
      defaultValue: true,
    },

    sort_order: {
      name: "Thứ tự hiển thị",
      dataType: "number",
      defaultValue: 0,
      validation: { min: 0 },
    },

    start_at: {
      name: "Bắt đầu hiển thị",
      dataType: "date",
    },

    end_at: {
      name: "Kết thúc hiển thị",
      dataType: "date",
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
