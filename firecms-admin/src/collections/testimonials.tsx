import { buildCollection } from "@firecms/core";

export type Testimonial = {
  name: string;
  role: string;
  content: string;
  rating: number;
  active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
};

export const testimonialsCollection = buildCollection<Testimonial>({
  name: "Đánh giá của khách hàng",
  singularName: "Đánh giá",
  id: "testimonials",
  path: "testimonials",
  group: "Nội dung website",

  permissions: () => ({
    read: true,
    edit: true,
    create: true,
    delete: true,
  }),

  properties: {
    name: {
      name: "Tên khách hàng",
      dataType: "string",
      validation: { required: true },
      columnWidth: 200,
    },

    role: {
      name: "Chức danh / Địa phương",
      dataType: "string",
      validation: { required: true },
      columnWidth: 200,
    },

    content: {
      name: "Nội dung đánh giá",
      dataType: "string",
      multiline: true,
      validation: { required: true },
      columnWidth: 400,
    },

    rating: {
      name: "Đánh giá (Số sao)",
      dataType: "number",
      defaultValue: 5,
      validation: { min: 1, max: 5 },
      columnWidth: 150,
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
