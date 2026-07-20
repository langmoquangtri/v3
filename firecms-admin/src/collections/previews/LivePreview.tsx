import React from "react";
import { EntityCustomView, EntityCustomViewParams } from "@firecms/core";

// Interface mimicking the actual values
interface ProductValues {
  name?: string;
  slug?: string;
  sku?: string;
  main_image?: string;
  images?: string[];
  reference_price?: number;
  material?: string;
  dimensions?: string;
  short_description?: string;
  content?: string;
  status?: string;
  featured?: boolean;
}

interface ProjectValues {
  name?: string;
  slug?: string;
  location?: string;
  customer_name?: string;
  main_image?: string;
  images?: string[];
  short_description?: string;
  content?: string;
}

interface CategoryValues {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  active?: boolean;
}

export const ProductPreviewComponent: React.FC<{ values: ProductValues }> = ({ values }) => {
  const price = values.reference_price;
  const priceStr = price && price > 0 ? `${price.toLocaleString("vi-VN")} đ` : "Liên hệ báo giá";

  return (
    <div className="p-6 bg-[#faf9f5] min-h-full font-sans text-[#141413] border-l border-[#e8e0d2]">
      <div className="max-w-md mx-auto bg-white border border-[#e8e0d2] rounded-lg shadow-sm overflow-hidden">
        {/* Card Header Status */}
        <div className="px-4 py-2.5 bg-[#f5f0e8] flex justify-between items-center border-b border-[#e8e0d2]">
          <span className="text-xs uppercase font-mono tracking-wider text-[#cc785c] font-semibold">
            {values.status === "published" ? "🟢 Đang hoạt động" : "🟡 Bản nháp"}
          </span>
          {values.featured && (
            <span className="text-[10px] bg-[#cc785c] text-white uppercase font-semibold px-2 py-0.5 rounded">
              Nổi bật
            </span>
          )}
        </div>

        {/* Product Image */}
        <div className="relative aspect-[4/3] bg-stone-100 flex items-center justify-center">
          {values.main_image ? (
            <img
              src={values.main_image}
              alt={values.name || "Sản phẩm"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-6 text-stone-400">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs">Chưa tải ảnh đại diện lên</p>
            </div>
          )}
        </div>

        {/* Product Content */}
        <div className="p-5">
          <span className="text-[10px] text-stone-500 font-mono block mb-1">
            SKU: {values.sku || "Chưa thiết lập"}
          </span>
          <h3 className="font-serif font-bold text-xl text-[#141413] leading-snug mb-1">
            {values.name || "Chưa nhập tên sản phẩm"}
          </h3>
          <p className="text-[#cc785c] font-bold font-mono text-base mb-4">{priceStr}</p>

          {/* Details list */}
          <div className="space-y-2 border-t border-[#f5f0e8] pt-3 mb-4">
            <div className="flex justify-between text-xs">
              <span className="text-stone-500 font-medium">Chất liệu:</span>
              <span className="text-stone-800 font-semibold">{values.material || "Chưa nhập"}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-500 font-medium">Kích thước:</span>
              <span className="text-stone-800 font-semibold">{values.dimensions || "Chưa nhập"}</span>
            </div>
          </div>

          {/* Short Description */}
          {values.short_description ? (
            <p className="text-xs text-stone-600 bg-[#faf9f5] p-3 rounded border border-[#efe9de] italic leading-relaxed">
              {values.short_description}
            </p>
          ) : (
            <p className="text-xs text-stone-400 italic">Chưa nhập mô tả ngắn</p>
          )}

          {/* Detailed Content Preview */}
          {values.content && (
            <div className="mt-4 pt-3 border-t border-dashed border-[#efe9de]">
              <h4 className="text-[11px] uppercase font-bold text-stone-500 tracking-wider mb-1.5">Nội dung chi tiết</h4>
              <p className="text-xs text-stone-500 line-clamp-3 leading-relaxed">
                {values.content.replace(/[#*`_-]/g, "")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProjectPreviewComponent: React.FC<{ values: ProjectValues }> = ({ values }) => {
  return (
    <div className="p-6 bg-[#faf9f5] min-h-full font-sans text-[#141413] border-l border-[#e8e0d2]">
      <div className="max-w-md mx-auto bg-white border border-[#e8e0d2] rounded-lg shadow-sm overflow-hidden">
        {/* Project Image */}
        <div className="relative aspect-[16/10] bg-stone-100 flex items-center justify-center">
          {values.main_image ? (
            <img
              src={values.main_image}
              alt={values.name || "Công trình"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-6 text-stone-400">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-xs">Chưa tải ảnh đại diện lên</p>
            </div>
          )}
          <div className="absolute bottom-3 left-3 bg-[#cc785c] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow">
            📍 {values.location || "Chưa nhập địa điểm"}
          </div>
        </div>

        {/* Project Content */}
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-serif font-bold text-lg text-[#141413] leading-snug">
              {values.name || "Chưa nhập tên công trình"}
            </h3>
          </div>

          <div className="space-y-1.5 mb-4 text-xs bg-[#faf9f5] p-3 rounded border border-[#efe9de]">
            <div className="flex justify-between">
              <span className="text-stone-500">Khách hàng:</span>
              <span className="text-stone-800 font-semibold">{values.customer_name || "Gia đình / Dòng họ"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Địa điểm lắp đặt:</span>
              <span className="text-stone-800 font-semibold">{values.location || "Chưa nhập"}</span>
            </div>
          </div>

          {/* Short description */}
          {values.short_description ? (
            <p className="text-xs text-stone-600 leading-relaxed italic">
              {values.short_description}
            </p>
          ) : (
            <p className="text-xs text-stone-400 italic">Chưa nhập mô tả ngắn về công trình</p>
          )}

          {/* Secondary images */}
          {values.images && values.images.length > 0 && (
            <div className="mt-4">
              <h4 className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-2">Hình ảnh thực tế khác</h4>
              <div className="grid grid-cols-4 gap-2">
                {values.images.slice(0, 4).map((img, idx) => (
                  <div key={idx} className="aspect-square bg-stone-100 rounded overflow-hidden border border-stone-200">
                    <img src={img} alt={`Hình ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CategoryPreviewComponent: React.FC<{ values: CategoryValues }> = ({ values }) => {
  return (
    <div className="p-6 bg-[#faf9f5] min-h-full font-sans text-[#141413] border-l border-[#e8e0d2]">
      <div className="max-w-md mx-auto bg-white border border-[#e8e0d2] rounded-lg shadow-sm overflow-hidden">
        {/* Banner with background image */}
        <div className="relative aspect-[16/7] bg-[#141413] flex items-center justify-center overflow-hidden">
          {values.image ? (
            <>
              <img
                src={values.image}
                alt={values.name}
                className="w-full h-full object-cover opacity-50 absolute inset-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-stone-800 flex items-center justify-center">
              <span className="text-stone-500 text-xs font-mono">Chưa tải ảnh danh mục</span>
            </div>
          )}
          <div className="relative z-10 text-center p-4">
            <span className="text-[9px] uppercase tracking-widest font-bold text-[#cc785c] bg-white/95 px-2.5 py-0.5 rounded mb-1.5 inline-block shadow-sm">
              Dòng đá chế tác
            </span>
            <h3 className="font-serif font-bold text-lg text-white">
              {values.name || "Chưa nhập tên danh mục"}
            </h3>
            <span className="text-[10px] text-stone-300 font-mono block mt-1">
              slug: {values.slug || "chua-nhap-slug"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-stone-500">Trạng thái hiển thị:</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${values.active !== false ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-stone-100 text-stone-600"}`}>
              {values.active !== false ? "🟢 Hiển thị công khai" : "⚪ Ẩn danh mục"}
            </span>
          </div>

          <p className="text-xs text-stone-500 uppercase font-mono mb-2">Lời giới thiệu dòng đá</p>
          {values.description ? (
            <p className="text-xs text-stone-600 font-sans leading-relaxed bg-[#faf9f5] p-3 rounded border border-[#efe9de] italic">
              {values.description}
            </p>
          ) : (
            <p className="text-xs text-stone-400 italic">Chưa nhập mô tả cho danh mục này</p>
          )}
        </div>
      </div>
    </div>
  );
};

// FireCMS custom entity views configurations
export const productPreviewView: EntityCustomView<any> = {
  key: "preview",
  name: "Xem trước (Trực quan)",
  Builder: ({ modifiedValues, entity }: EntityCustomViewParams<any>) => (
    <ProductPreviewComponent values={modifiedValues ?? entity?.values ?? {}} />
  )
};

export const projectPreviewView: EntityCustomView<any> = {
  key: "preview",
  name: "Xem trước (Trực quan)",
  Builder: ({ modifiedValues, entity }: EntityCustomViewParams<any>) => (
    <ProjectPreviewComponent values={modifiedValues ?? entity?.values ?? {}} />
  )
};

export const categoryPreviewView: EntityCustomView<any> = {
  key: "preview",
  name: "Xem trước (Trực quan)",
  Builder: ({ modifiedValues, entity }: EntityCustomViewParams<any>) => (
    <CategoryPreviewComponent values={modifiedValues ?? entity?.values ?? {}} />
  )
};
