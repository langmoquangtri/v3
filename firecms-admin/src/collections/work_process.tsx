import { buildCollection } from "@firecms/core";

export type WorkProcess = {
  step: string;
  title: string;
  description: string;
  active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
};

export const workProcessCollection = buildCollection<WorkProcess>({
  name: "Quy trình làm việc",
  singularName: "Quy trình làm việc",
  id: "work_process",
  path: "work_process",
  group: "Quy trình",

  permissions: () => ({
    read: true,
    edit: true,
    create: true,
    delete: true,
  }),

  properties: {
    step: {
      name: "Bước (Ví dụ: 01)",
      dataType: "string",
      validation: { required: true },
      columnWidth: 120,
    },

    title: {
      name: "Tiêu đề bước",
      dataType: "string",
      validation: { required: true },
      columnWidth: 250,
    },

    description: {
      name: "Mô tả chi tiết",
      dataType: "string",
      multiline: true,
      validation: { required: true },
      columnWidth: 400,
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
