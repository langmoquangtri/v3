import { buildCollection } from "@firecms/core";

export type CtaSlide = {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  button_text: string;
  active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
};

export const ctaSlidesCollection = buildCollection<CtaSlide>({
  name: "Ảnh slide",
  singularName: "Slide CTA",
  id: "cta_slides",
  path: "cta_slides",
  group: "Câu hỏi thường gặp",

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
      description: "Ví dụ: Tôn Vinh Kỷ Niệm Trường Tồn Vĩnh Cửu",
      columnWidth: 280,
    },

    subtitle: {
      name: "Mô tả phụ",
      dataType: "string",
      multiline: true,
      description: "Nhập mô tả ngắn hiện trên ảnh",
      columnWidth: 320,
    },

    image: {
      name: "Ảnh Slide (Tỷ lệ khuyến nghị 4:5)",
      dataType: "string",
      validation: { required: true },
      storage: {
        storagePath: "cta_slides",
        acceptedFiles: ["image/*"],
        storeUrl: true,
      },
    },

    link: {
      name: "Đường dẫn liên kết khi click nút",
      dataType: "string",
      description: "Ví dụ: /lien-he hoặc để trống để cuộn đến form",
    },

    button_text: {
      name: "Nội dung nút hành động",
      dataType: "string",
      description: "Mặc định: Nhận Tư Vấn Ngay",
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
