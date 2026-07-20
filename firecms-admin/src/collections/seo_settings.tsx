import { buildCollection } from "@firecms/core";

export type SeoSetting = {
  website_name: string;
  default_seo_title: string;
  default_meta_description: string;
  default_og_image: string;
  website_url: string;
  canonical_url: string;
  no_index: boolean;
};

export const seoSettingsCollection = buildCollection<SeoSetting>({
  name: "Cấu hình SEO",
  singularName: "Cấu hình SEO",
  id: "seo_settings",
  path: "seo_settings",
  group: "Cấu hình",
  permissions: () => ({
    read: true,
    edit: true,
    create: true,
    delete: true,
  }),
  properties: {
    website_name: {
      name: "Tên website",
      dataType: "string",
      validation: { required: true },
      columnWidth: 200,
    },
    default_seo_title: {
      name: "SEO Title mặc định",
      dataType: "string",
      validation: { required: true },
      columnWidth: 260,
    },
    default_meta_description: {
      name: "Meta Description mặc định",
      dataType: "string",
      multiline: true,
      validation: { required: true },
      columnWidth: 320,
    },
    default_og_image: {
      name: "Ảnh OG mặc định",
      dataType: "string",
      storage: {
        storagePath: "seo",
        acceptedFiles: ["image/*"],
        storeUrl: true,
      },
    },
    website_url: {
      name: "URL Website",
      dataType: "string",
      validation: { required: true },
      columnWidth: 240,
    },
    canonical_url: {
      name: "Canonical URL mặc định",
      dataType: "string",
      columnWidth: 240,
    },
    no_index: {
      name: "No Index (Chặn tìm kiếm Google)",
      dataType: "boolean",
      defaultValue: false,
    },
  },
});
