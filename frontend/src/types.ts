export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  badge?: string;
  ctaText: string;
  ctaLink: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  iconName: string;
  highlight?: boolean;
  seo_title?: string;
  meta_description?: string;
  og_image?: string;
  canonical_url?: string;
  no_index?: boolean;
}

export interface Specification {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  price: number;
  priceStr: string;
  imageUrl: string;
  images?: string[];
  shortDescription: string;
  description: string;
  specifications: Specification[];
  features: string[];
  commitments?: string[];
  fengshuiTip?: string;
  isFeatured: boolean;
  rating: number;
  inStock: boolean;
  videoUrl?: string;
  seo_title?: string;
  meta_description?: string;
  og_image?: string;
  canonical_url?: string;
  no_index?: boolean;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  location: string;
  year: string;
  material: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  images?: string[];
  scope: string[];
  seo_title?: string;
  meta_description?: string;
  og_image?: string;
  canonical_url?: string;
  no_index?: boolean;
}

export interface Post {
  id: string;
  name: string;
  slug: string;
  date: string;
  author: string;
  readTime: string;
  shortDescription: string;
  content: string;
  imageUrl: string;
  category?: string;
  seo_title?: string;
  meta_description?: string;
  og_image?: string;
  canonical_url?: string;
  no_index?: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  active: boolean;
  sort_order: number;
}

export interface CtaSlide {
  id: string;
  title?: string;
  subtitle?: string;
  image: string;
  link?: string;
  button_text?: string;
  active: boolean;
  sort_order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  active: boolean;
  sort_order: number;
}

export interface CoreValue {
  id: string;
  title: string;
  description: string;
  iconName: string;
  sort_order: number;
}

export interface BrandIntroduction {
  id: string;
  title: string;
  content: string;
  image?: string;
  sort_order: number;
}

export interface WorkProcess {
  id: string;
  step: string;
  title: string;
  description: string;
  active: boolean;
  sort_order: number;
}

export interface SiteSetting {
  id: string;
  key: string;
  hotline_title: string;
  hotline_subtitle: string;
  hotline_phone: string;
  hotline_secondary_phone?: string;
  footer_brand_description: string;
  footer_address: string;
  facebook_url: string;
  tiktok_url: string;
  youtube_url: string;
  zalo_url?: string;
  zalo_phone?: string;
  google_maps_embed_url?: string;
}

export interface SeoSetting {
  id: string;
  website_name: string;
  default_seo_title: string;
  default_meta_description: string;
  default_og_image: string;
  website_url: string;
  canonical_url: string;
  no_index: boolean;
}

export type ViewType =
  | { type: "home" }
  | { type: "products"; categorySlug?: string }
  | { type: "product-detail"; slug: string }
  | { type: "projects" }
  | { type: "project-detail"; slug: string }
  | { type: "posts"; categorySlug?: string }
  | { type: "post-detail"; slug: string }
  | { type: "contact"; productSlug?: string };
