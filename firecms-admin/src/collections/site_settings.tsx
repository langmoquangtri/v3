import { buildCollection } from "@firecms/core";

export type SiteSetting = {
  key: string;
  name: string;
  
  // Hotline Quick Contact Section
  hotline_title: string;
  hotline_subtitle: string;
  hotline_phone: string;
  hotline_secondary_phone?: string;
  
  // Footer Section
  footer_brand_description: string;
  footer_address: string;
  
  // Social Links
  facebook_url: string;
  tiktok_url: string;
  youtube_url: string;
  zalo_phone?: string;
  zalo_url?: string;
  google_maps_embed_url?: string;
  
  active: boolean;
  updated_at: Date;
};

export const siteSettingsCollection = buildCollection<SiteSetting>({
  name: "Cấu hình Website",
  singularName: "Bản ghi cấu hình",
  id: "site_settings",
  path: "site_settings",
  group: "Nội dung website",

  permissions: () => ({
    read: true,
    edit: true,
    create: true,
    delete: true,
  }),

  properties: {
    key: {
      name: "Mã cấu hình",
      dataType: "string",
      validation: { required: true },
      description: "Ví dụ: main_settings",
      columnWidth: 160,
    },

    name: {
      name: "Tên cấu hình",
      dataType: "string",
      validation: { required: true },
      description: "Ví dụ: Cấu hình chung",
      columnWidth: 200,
    },

    hotline_title: {
      name: "Hotline - Tiêu đề",
      dataType: "string",
      validation: { required: true },
      columnWidth: 280,
    },

    hotline_subtitle: {
      name: "Hotline - Mô tả phụ",
      dataType: "string",
      multiline: true,
      validation: { required: true },
      columnWidth: 350,
    },

    hotline_phone: {
      name: "Hotline - Số điện thoại chính",
      dataType: "string",
      validation: { required: true },
      columnWidth: 180,
    },

    hotline_secondary_phone: {
      name: "Hotline - Số điện thoại phụ",
      dataType: "string",
      columnWidth: 180,
    },

    footer_brand_description: {
      name: "Footer - Mô tả thương hiệu",
      dataType: "string",
      multiline: true,
      validation: { required: true },
      columnWidth: 350,
    },

    footer_address: {
      name: "Footer - Địa chỉ / Liên hệ",
      dataType: "string",
      multiline: true,
      validation: { required: true },
      columnWidth: 350,
    },

    facebook_url: {
      name: "Facebook Link",
      dataType: "string",
      validation: { required: true },
      columnWidth: 240,
    },

    tiktok_url: {
      name: "TikTok Link",
      dataType: "string",
      validation: { required: true },
      columnWidth: 240,
    },

    youtube_url: {
      name: "YouTube Link",
      dataType: "string",
      validation: { required: true },
      columnWidth: 240,
    },

    zalo_phone: {
      name: "Số điện thoại Zalo",
      dataType: "string",
      validation: { required: false },
      description: "Ví dụ: 0987.654.321",
      columnWidth: 180,
    },

    zalo_url: {
      name: "Đường dẫn Zalo (Zalo Link)",
      dataType: "string",
      validation: { required: false },
      description: "Ví dụ: https://zalo.me/0987654321",
      columnWidth: 240,
    },

    google_maps_embed_url: {
      name: "Bản đồ Google Maps (Mã nhúng Iframe hoặc link embed)",
      dataType: "string",
      validation: { required: false },
      description: "Dán mã iframe nhúng bản đồ từ Google Maps (ví dụ: <iframe src=\"...\"></iframe>) hoặc trực tiếp đường dẫn nhúng (https://www.google.com/maps/embed?...).",
      columnWidth: 350,
      multiline: true,
    },

    active: {
      name: "Kích hoạt sử dụng bản ghi này",
      dataType: "boolean",
      defaultValue: true,
    },

    updated_at: {
      name: "Cập nhật lần cuối",
      dataType: "date",
      autoValue: "on_update",
    },
  },
});
