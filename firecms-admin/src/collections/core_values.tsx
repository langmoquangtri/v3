import { buildCollection } from "@firecms/core";

export type CoreValue = {
  title: string;
  description: string;
  icon_name: string;
  sort_order: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
};

export const coreValuesCollection = buildCollection<CoreValue>({
  name: "Giá trị cốt lõi",
  singularName: "Giá trị cốt lõi",
  id: "core_values",
  path: "core_values",
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
      columnWidth: 240,
    },

    description: {
      name: "Mô tả ngắn",
      dataType: "string",
      multiline: true,
      validation: { required: true },
      columnWidth: 400,
    },

    icon_name: {
      name: "Tên Icon (Lucide)",
      dataType: "string",
      description: "Ví dụ: Award, ShieldCheck, Clock, Star, Heart...",
      validation: { required: true },
      columnWidth: 180,
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
