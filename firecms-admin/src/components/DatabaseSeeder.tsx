import React, { useState } from "react";
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc, writeBatch, collection } from "firebase/firestore";
import { firebaseConfig } from "../firebase_config";

// Self-contained fallback data matching exactly what's on the homepage
const fallbackBanners = [
  {
    title: "Chế Tác Bia Mộ Đá Granite Cao Cấp",
    subtitle: "Tinh hoa khắc chữ sâu, sắc nét, trường tồn vĩnh cửu theo năm tháng",
    image: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=1200&auto=format&fit=crop",
    mobile_image: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=1200&auto=format&fit=crop",
    button_text: "Khám Phá Bộ Sưu Tập",
    link: "/san-pham",
    position: "home_hero",
    active: true,
    sort_order: 1
  }
];

const fallbackCategories = [
  {
    name: "Bia Mộ Đá Granite (Hoa Cương)",
    slug: "bia-mo-da-granite",
    description: "Chất liệu đá granite nhập khẩu cao cấp, độ bóng gương vĩnh cửu, không bị phai màu chữ hay rêu mốc trước thời tiết.",
    image: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=600&auto=format&fit=crop",
    active: true,
    highlight: true,
    sort_order: 1
  },
  {
    name: "Bia Mộ Đá Xanh Thanh Hóa",
    slug: "bia-mo-da-xanh-thanh-hoa",
    description: "Đá xanh tự nhiên nguyên khối, thớ mịn, dẻo dai giúp các nét chạm trổ cổ kính rồng phượng vô cùng sắc nét tinh xảo.",
    image: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=600&auto=format&fit=crop",
    active: true,
    highlight: true,
    sort_order: 2
  },
  {
    name: "Mộ Đá Mỹ Nghệ Nguyên Khối",
    slug: "mo-da-my-nghe",
    description: "Các mẫu mộ bành, mộ tam sơn, mộ có mái bằng đá xanh tự nhiên được lắp đặt trọn gói chuẩn kích thước phong thủy thước Lỗ Ban.",
    image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=600&auto=format&fit=crop",
    active: true,
    highlight: false,
    sort_order: 3
  },
  {
    name: "Bia Di Tích & Bia Ghi Danh",
    slug: "bia-di-tich-bia-ghi-danh",
    description: "Sản phẩm phục vụ đền chùa, từ đường dòng họ, bia di tích lịch sử chạm nổi hoa văn tinh tế thể hiện sự tôn nghiêm.",
    image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=600&auto=format&fit=crop",
    active: true,
    highlight: false,
    sort_order: 4
  }
];

const fallbackFAQs = [
  {
    question: "Chất liệu đá nào tốt nhất để làm bia mộ và lăng mộ?",
    answer: "Chúng tôi sử dụng Đá Granite (Hoa Cương) nhập khẩu nguyên tấm có độ bóng gương vĩnh cửu và Đá Xanh tự nhiên nguyên khối từ Thanh Hóa, Ninh Bình. Cả hai loại đá đều chống rêu mốc, không phai màu chữ và bền bỉ trọn đời dưới thời tiết khắc nghiệt.",
    active: true,
    sort_order: 1
  },
  {
    question: "Thời gian hoàn thành một sản phẩm bia mộ mất bao lâu?",
    answer: "Thông thường, quy trình chế tác và hoàn thiện một sản phẩm bia mộ chuẩn chất lượng cao tại xưởng Đá Tâm An mất từ 3 đến 5 ngày kể từ khi thống nhất bản vẽ thiết kế 2D.",
    active: true,
    sort_order: 2
  },
  {
    question: "Xưởng có hỗ trợ khảo sát và thiết kế theo kích thước phong thủy không?",
    answer: "Có, Đá Tâm An hỗ trợ đo đạc khảo sát thực tế và thiết kế phác thảo bản vẽ 2D/3D theo cung số đỏ của thước Lỗ Ban âm phần hoàn toàn miễn phí.",
    active: true,
    sort_order: 3
  },
  {
    question: "Làm thế nào để tôi đặt hàng từ xa khi không ở gần xưởng?",
    answer: "Quý khách chỉ cần liên hệ hotline hoặc gửi thông tin qua form liên hệ. Chúng tôi sẽ tư vấn, phác thảo thiết kế và gửi duyệt qua Zalo/Email. Sau khi duyệt mẫu, chúng tôi chế tác và vận chuyển, lắp đặt toàn quốc.",
    active: true,
    sort_order: 4
  },
  {
    question: "Sản phẩm của Đá Tâm An có được bảo hành không?",
    answer: "Tất cả các sản phẩm lăng mộ đá và bia mộ đá của xưởng Đá Tâm An đều được cam kết bảo hành nứt vỡ trọn đời đối với phôi đá tự nhiên và bảo hành lớp sơn mạ chữ trong vòng 5 năm.",
    active: true,
    sort_order: 5
  }
];

const fallbackCtaSlides = [
  {
    title: "Chế Tác Tinh Hoa",
    subtitle: "Nghệ nhân Đá Tâm An thổi hồn vào từng thớ đá tự nhiên trường tồn.",
    image: "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?q=80&w=600&auto=format&fit=crop",
    link: "",
    button_text: "Liên Hệ Ngay",
    active: true,
    sort_order: 1
  },
  {
    title: "Đá Nguyên Khối",
    subtitle: "Cam kết 100% phôi đá Granite, đá xanh tuyển chọn không nứt vỡ.",
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=600&auto=format&fit=crop",
    link: "",
    button_text: "Nhận Báo Giá",
    active: true,
    sort_order: 2
  },
  {
    title: "Chuẩn Phong Thủy Lỗ Ban",
    subtitle: "Đo đạc tận nơi, lên bản vẽ mô phỏng 2D/3D chuẩn phong thủy âm phần.",
    image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop",
    link: "",
    button_text: "Khảo Sát Miễn Phí",
    active: true,
    sort_order: 3
  }
];

const fallbackTestimonials = [
  {
    name: "Nguyễn Văn Hoà",
    role: "Gia chủ - Thanh Hoá",
    content: "Tôi rất hài lòng với công trình lăng mộ gia tộc mà Đá Tâm An chế tác. Các nét chạm khắc tinh xảo, chất đá xanh tự nhiên nguyên khối rất đẹp. Nghệ nhân tư vấn kích thước chuẩn phong thủy Lỗ Ban vô cùng tận tình.",
    rating: 5,
    active: true,
    sort_order: 1
  },
  {
    name: "Phạm Thị Tuyết",
    role: "Khách hàng - Hà Nội",
    content: "Đơn đặt hàng bia mộ granite từ xa nhưng xưởng làm rất chuyên nghiệp. Chữ khắc sâu, sắc nét, mạ vàng 24K cực kỳ sang trọng. Giao hàng nhanh và đóng gói kỹ lưỡng. Sẽ ủng hộ xưởng lâu dài.",
    rating: 5,
    active: true,
    sort_order: 2
  },
  {
    name: "Lê Minh Tuấn",
    role: "Đại diện dòng họ Lê - Ninh Bình",
    content: "Chân thành cảm ơn tập thể nghệ nhân Đá Tâm An. Việc trùng tu khuôn viên lăng mộ tổ dòng họ được hoàn thành đúng tiến độ, chất lượng đá đồng đều và hoa văn rồng phượng uy nghiêm, chuẩn cổ kính.",
    rating: 5,
    active: true,
    sort_order: 3
  },
  {
    name: "Trần Thanh Bình",
    role: "Gia chủ - Quảng Trị",
    content: "Xưởng tư vấn thiết kế phối cảnh 3D rất trực quan, giúp gia đình dễ dàng hình dung trước khi thi công. Quá trình lắp đặt chuyên nghiệp, cẩn thận từng khớp nối mạch hồ. Rất uy tín!",
    rating: 5,
    active: true,
    sort_order: 4
  }
];

const fallbackCoreValues = [
  {
    title: "Nghệ Nhân Làng Nghề Cổ",
    description: "Chế tác trực tiếp từ phôi đá chuẩn bởi nghệ nhân điêu khắc gia tộc giàu kinh nghiệm Ninh Bình.",
    icon_name: "Award",
    sort_order: 1,
    active: true
  },
  {
    title: "Đá Tự Nhiên Nguyên Khối 100%",
    description: "Sử dụng phôi đá hoa cương nhập khẩu, đá xanh Thanh Hóa nguyên khối tốt nhất, bảo hành nứt vỡ trọn đời.",
    icon_name: "ShieldCheck",
    sort_order: 2,
    active: true
  },
  {
    title: "Thiết Kế Thước Lỗ Ban",
    description: "Hỗ trợ phác thảo bản vẽ 2D hoàn chỉnh chuẩn cung cát Lỗ Ban âm phần, hoàn thiện chuẩn hẹn 3-5 ngày.",
    icon_name: "Clock",
    sort_order: 3,
    active: true
  }
];

const fallbackBrandIntroductions = [
  {
    title: "Chế tác bằng tâm huyết",
    content: "Lăng Mộ Đá Quảng Trị chuyên thiết kế và thi công các công trình tâm linh bằng đá tự nhiên nguyên khối, được chế tác tỉ mỉ bởi những nghệ nhân giàu kinh nghiệm.",
    image: "https://images.langmodaquangtri.com/tra%CC%A3m.webp",
    sort_order: 1,
    active: true
  },
  {
    title: "Thiết kế chuẩn phong thủy",
    content: "Mỗi công trình đều được nghiên cứu kỹ về kích thước, hướng đặt, bố cục và hoa văn, bảo đảm sự hài hòa giữa kiến trúc truyền thống và yếu tố phong thủy.",
    image: "https://images.langmodaquangtri.com/tra%CC%A3m.webp",
    sort_order: 2,
    active: true
  },
  {
    title: "Bền vững cùng thời gian",
    content: "Nguồn đá chất lượng cao được tuyển chọn kỹ lưỡng, có độ bền vượt trội trước thời tiết, giúp công trình giữ được vẻ trang nghiêm qua nhiều thế hệ.",
    image: "https://images.langmodaquangtri.com/tra%CC%A3m.webp",
    sort_order: 3,
    active: true
  },
  {
    title: "Gìn giữ giá trị gia tộc",
    content: "Không chỉ kiến tạo nơi an nghỉ, Lăng Mộ Đá Quảng Trị còn mong muốn gìn giữ lòng hiếu kính, niềm tự hào và những giá trị tinh thần của mỗi gia đình Việt.",
    image: "https://images.langmodaquangtri.com/tra%CC%A3m.webp",
    sort_order: 4,
    active: true
  }
];

const fallbackWorkProcesses = [
  {
    step: "01",
    title: "Tiếp nhận yêu cầu",
    description: "Ghi nhận mẫu mã, kích thước, vị trí thi công và ngân sách.",
    active: true,
    sort_order: 1
  },
  {
    step: "02",
    title: "Tư vấn phương án",
    description: "Đề xuất loại đá, kiểu dáng và thiết kế phù hợp với công trình.",
    active: true,
    sort_order: 2
  },
  {
    step: "03",
    title: "Báo giá chi tiết",
    description: "Cung cấp báo giá lăng mộ đá minh bạch theo từng hạng mục.",
    active: true,
    sort_order: 3
  },
  {
    step: "04",
    title: "Điều chỉnh thiết kế",
    description: "Chỉnh sửa mẫu mã, kích thước và vật liệu theo yêu cầu.",
    active: true,
    sort_order: 4
  },
  {
    step: "05",
    title: "Chốt phương án",
    description: "Ký hợp đồng và tiến hành sản xuất, vận chuyển, lắp đặt.",
    active: true,
    sort_order: 5
  }
];

const fallbackSiteSettings = {
  key: "main_settings",
  hotline_title: "Quý Khách Cần Tư Vấn Thiết Kế Mẫu Bia Mộ Đá?",
  hotline_subtitle: "Đội ngũ thiết kế hỗ trợ tư vấn phong thủy Lỗ Ban, chạm hoa sen, rồng chầu, mạ vàng 24K miễn phí. Cung cấp báo giá xưởng tối ưu nhất, vận chuyển toàn quốc.",
  hotline_phone: "0987.654.321",
  hotline_secondary_phone: "0987.654.321",
  footer_brand_description: "Chúng tôi tự hào kế thừa nét tinh hoa chạm khắc đá độc bản hàng trăm năm từ Ninh Bình. Cam kết cung cấp các sản phẩm bia mộ đá Granite, bia đá xanh tự nhiên trường tồn vĩnh cửu.",
  footer_address: "Địa chỉ: Làng nghề đá mỹ nghệ xã Ninh Vân, huyện Hoa Lư, tỉnh Ninh Bình.\nHotline chăm sóc khách hàng: 0987.654.321\nEmail: lienhe@dataman.vn",
  facebook_url: "https://facebook.com",
  tiktok_url: "https://tiktok.com",
  youtube_url: "https://youtube.com",
  zalo_phone: "0987.654.321",
  zalo_url: "https://zalo.me/0987654321",
  active: true
};

const fallbackSeoSettings = {
  website_name: "Đá Mỹ Nghệ Tâm An",
  default_seo_title: "Chế Tác Bia Mộ Đá Granite Cao Cấp & Lăng Mộ Đá Đẹp - Đá Tâm An",
  default_meta_description: "Đá Mỹ Nghệ Tâm An chuyên thiết kế, chế tác bia mộ đá granite cao cấp, lăng mộ đá xanh tự nhiên nguyên khối chuẩn kích thước phong thủy Lỗ Ban, chạm khắc rồng phượng tinh xảo trường tồn.",
  default_og_image: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=1200&auto=format&fit=crop",
  website_url: "https://langmodaquangtri.com",
  canonical_url: "https://langmodaquangtri.com",
  no_index: false,
};

export default function DatabaseSeeder() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [progress, setProgress] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSeed = async () => {
    setStatus("loading");
    setProgress([]);
    setErrorMessage("");

    try {
      // Initialize Firebase App
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      const db = getFirestore(app);

      const collectionsToSeed = [
        { name: "site_settings", displayName: "Cấu hình chung (Site Settings)", data: [fallbackSiteSettings], isSingleDoc: true, docId: "main_settings" },
        { name: "seo_settings", displayName: "Cấu hình SEO (SEO Settings)", data: [fallbackSeoSettings], isSingleDoc: true, docId: "main_seo" },
        { name: "core_values", displayName: "Giá trị cốt lõi (Core Values)", data: fallbackCoreValues },
        { name: "brand_introductions", displayName: "Giới thiệu thương hiệu", data: fallbackBrandIntroductions },
        { name: "faqs", displayName: "FAQs (Hỏi đáp)", data: fallbackFAQs },
        { name: "cta_slides", displayName: "Ảnh slide CTA", data: fallbackCtaSlides },
        { name: "banners", displayName: "Banners (Hero)", data: fallbackBanners },
        { name: "categories", displayName: "Danh mục sản phẩm", data: fallbackCategories },
        { name: "testimonials", displayName: "Đánh giá khách hàng", data: fallbackTestimonials },
        { name: "work_process", displayName: "Quy trình làm việc", data: fallbackWorkProcesses },
      ];

      for (const col of collectionsToSeed) {
        setProgress(prev => [...prev, `Đang xử lý: ${col.displayName}...`]);
        
        if (col.isSingleDoc) {
          // Single specific document
          const docRef = doc(db, col.name, col.docId || "main_settings");
          await setDoc(docRef, {
            ...col.data[0],
            created_at: new Date(),
            updated_at: new Date()
          });
        } else {
          // Batch write for other arrays
          const batch = writeBatch(db);
          col.data.forEach((item, index) => {
            const docId = `${col.name.slice(0, -1) || col.name}-${index + 1}`;
            const docRef = doc(db, col.name, docId);
            batch.set(docRef, {
              ...item,
              created_at: new Date(),
              updated_at: new Date()
            });
          });
          await batch.commit();
        }

        setProgress(prev => {
          const next = [...prev];
          next[next.length - 1] = `✅ Đã nhập xong: ${col.displayName}`;
          return next;
        });
      }

      setStatus("success");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Đã xảy ra lỗi không xác định.");
    }
  };

  return (
    <>
      {/* Floating Action Button placed in the Navbar area */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-2.5 right-48 z-[9999] flex items-center gap-1.5 bg-[#cc785c] hover:bg-[#b86348] text-white px-3.5 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-102 text-xs md:text-sm font-semibold cursor-pointer"
        id="db-seeder-button"
      >
        <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <span> </span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" id="db-seeder-modal">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="bg-[#cc785c] text-white p-6">
              <h3 className="text-xl font-bold font-serif uppercase tracking-wide">Nhập dữ liệu mẫu từ trang chủ</h3>
              <p className="text-sm text-white/95 mt-1 font-sans">
                Công cụ này sẽ giúp đồng bộ dữ liệu mẫu mặc định của Website vào cơ sở dữ liệu Firestore của bạn để sửa trực tiếp trên FireCMS.
              </p>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-grow space-y-4 font-sans text-sm text-stone-700">
              {status === "idle" && (
                <div className="space-y-3">
                  <p className="font-semibold text-stone-800">Cơ sở dữ liệu của các mục sau sẽ được đồng bộ và làm mới:</p>
                  <ul className="grid grid-cols-2 gap-2 text-stone-600 bg-stone-50 p-4 border border-stone-200/60 rounded-md">
                    <li className="flex items-center gap-2">🔹 Cấu hình chung (Site Settings)</li>
                    <li className="flex items-center gap-2">🔹 Cấu hình SEO (SEO Settings)</li>
                    <li className="flex items-center gap-2">🔹 Giá trị cốt lõi (Core Values)</li>
                    <li className="flex items-center gap-2">🔹 Giới thiệu thương hiệu</li>
                    <li className="flex items-center gap-2">🔹 FAQs (Hỏi đáp)</li>
                    <li className="flex items-center gap-2">🔹 Slide ảnh CTA</li>
                    <li className="flex items-center gap-2">🔹 Banners (Hero)</li>
                    <li className="flex items-center gap-2">🔹 Danh mục sản phẩm</li>
                    <li className="flex items-center gap-2">🔹 Đánh giá khách hàng</li>
                    <li className="flex items-center gap-2">🔹 Quy trình làm việc</li>
                  </ul>
                  <p className="text-xs text-red-500 font-medium">
                    ⚠️ Lưu ý: Thao tác này sẽ ghi đè dữ liệu mẫu mặc định lên các bản ghi cũ của các bảng trên. Các bảng Sản phẩm, Công trình và Bài viết sẽ KHÔNG bị ảnh hưởng.
                  </p>
                </div>
              )}

              {status === "loading" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center py-6">
                    <div className="w-12 h-12 border-4 border-[#cc785c] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="bg-stone-50 p-4 rounded border border-stone-200 font-mono text-xs max-h-48 overflow-y-auto space-y-1">
                    {progress.map((p, idx) => (
                      <div key={idx}>{p}</div>
                    ))}
                  </div>
                </div>
              )}

              {status === "success" && (
                <div className="text-center py-6 space-y-3">
                  <div className="w-16 h-16 bg-green-100 text-green-600 flex items-center justify-center rounded-full mx-auto text-3xl font-bold">
                    ✓
                  </div>
                  <h4 className="text-lg font-bold text-green-700">Đã Khởi Tạo Thành Công!</h4>
                  <p className="text-stone-600">
                    Toàn bộ dữ liệu mẫu từ Trang Chủ đã được lưu thành công vào Firestore của bạn. Hãy tải lại trang quản trị này để xem dữ liệu xuất hiện.
                  </p>
                </div>
              )}

              {status === "error" && (
                <div className="text-center py-6 space-y-3">
                  <div className="w-16 h-16 bg-red-100 text-red-600 flex items-center justify-center rounded-full mx-auto text-3xl font-bold">
                    ✕
                  </div>
                  <h4 className="text-lg font-bold text-red-700">Đã xảy ra lỗi</h4>
                  <p className="text-red-500 font-medium bg-red-50 p-3 rounded border border-red-100 text-xs text-left max-h-32 overflow-y-auto">
                    {errorMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-stone-50 px-6 py-4 border-t border-stone-100 flex justify-end gap-3">
              {status !== "loading" && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 font-medium rounded transition-all cursor-pointer"
                >
                  {status === "success" ? "Đóng" : "Bỏ qua"}
                </button>
              )}

              {status === "idle" && (
                <button
                  onClick={handleSeed}
                  className="px-5 py-2 bg-[#cc785c] hover:bg-[#b86348] text-white font-medium rounded transition-all cursor-pointer"
                >
                  Nhập dữ liệu mẫu
                </button>
              )}

              {status === "success" && (
                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-all cursor-pointer"
                >
                  Tải lại trang (F5)
                </button>
              )}

              {status === "error" && (
                <button
                  onClick={handleSeed}
                  className="px-5 py-2 bg-[#cc785c] hover:bg-[#b86348] text-white font-medium rounded transition-all cursor-pointer"
                >
                  Thử lại
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
