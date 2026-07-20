import { buildCollection } from "@firecms/core";

export type FAQ = {
  question: string;
  answer: string;
  active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
};

export const faqsCollection = buildCollection<FAQ>({
  name: "FAQs",
  singularName: "FAQ",
  id: "faqs",
  path: "faqs",
  group: "Câu hỏi thường gặp",

  permissions: () => ({
    read: true,
    edit: true,
    create: true,
    delete: true,
  }),

  properties: {
    question: {
      name: "Câu hỏi",
      dataType: "string",
      validation: { required: true },
      columnWidth: 320,
    },

    answer: {
      name: "Câu trả lời",
      dataType: "string",
      multiline: true,
      validation: { required: true },
      columnWidth: 450,
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
