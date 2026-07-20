import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import { CoreValue, BrandIntroduction, SiteSetting, SeoSetting, WorkProcess } from "../types";

// Firebase configuration matching the user's FireCMS project
export const firebaseConfig = {
  apiKey: "AIzaSyAT-B3qaiggBIURgQ2KZNxyoOZF3EfDhbw",
  authDomain: "lang-mo-cms.firebaseapp.com",
  projectId: "lang-mo-cms",
  storageBucket: "lang-mo-cms.firebasestorage.app",
  messagingSenderId: "809136893303",
  appId: "1:809136893303:web:fba4babcac9f18459fc572",
  measurementId: "G-TQ2HFMVPHD",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Fallback Mock Data in case Firestore is empty or fails
export const fallbackBanners = [
  {
    id: "banner-1",
    title: "Chế Tác Bia Mộ Đá Granite Cao Cấp",
    subtitle: "Tinh hoa khắc chữ sâu, sắc nét, trường tồn vĩnh cửu theo năm tháng",
    imageUrl: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=1200&auto=format&fit=crop",
    badge: "Tinh Hoa Làng Nghề Đá Mỹ Nghệ",
    ctaText: "Khám Phá Bộ Sưu Tập",
    ctaLink: "/san-pham"
  }
];

export const fallbackCategories = [
  {
    id: "bia-mo-da-granite",
    name: "Bia Mộ Đá Granite (Hoa Cương)",
    slug: "bia-mo-da-granite",
    description: "Chất liệu đá granite nhập khẩu cao cấp, độ bóng gương vĩnh cửu, không bị phai màu chữ hay rêu mốc trước thời tiết.",
    imageUrl: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=600&auto=format&fit=crop",
    iconName: "Feather",
    highlight: true
  },
  {
    id: "bia-mo-da-xanh-thanh-hoa",
    name: "Bia Mộ Đá Xanh Thanh Hóa",
    slug: "bia-mo-da-xanh-thanh-hoa",
    description: "Đá xanh tự nhiên nguyên khối, thớ mịn, dẻo dai giúp các nét chạm trổ cổ kính rồng phượng vô cùng sắc nét tinh xảo.",
    imageUrl: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=600&auto=format&fit=crop",
    iconName: "Layers",
    highlight: true
  },
  {
    id: "mo-da-my-nghe",
    name: "Mộ Đá Mỹ Nghệ Nguyên Khối",
    slug: "mo-da-my-nghe",
    description: "Các mẫu mộ bành, mộ tam sơn, mộ có mái bằng đá xanh tự nhiên được lắp đặt trọn gói chuẩn kích thước phong thủy thước Lỗ Ban.",
    imageUrl: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=600&auto=format&fit=crop",
    iconName: "Castle",
    highlight: false
  },
  {
    id: "bia-di-tich-bia-ghi-danh",
    name: "Bia Di Tích & Bia Ghi Danh",
    slug: "bia-di-tich-bia-ghi-danh",
    description: "Sản phẩm phục vụ đền chùa, từ đường dòng họ, bia di tích lịch sử chạm nổi hoa văn tinh tế thể hiện sự tôn nghiêm.",
    imageUrl: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=600&auto=format&fit=crop",
    iconName: "Award",
    highlight: false
  }
];

// Firestore Data Fetching Mappers
export async function getBanners() {
  try {
    const querySnapshot = await getDocs(collection(db, "banners"));
    if (querySnapshot.empty) return fallbackBanners;
    const docs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "",
        subtitle: data.subtitle || "",
        imageUrl: data.image || "",
        mobileImageUrl: data.mobile_image || "",
        badge: data.position === "home_hero" ? "Tinh Hoa Làng Nghề Đá Mỹ Nghệ" : undefined,
        ctaText: data.button_text || "Khám Phá Bộ Sưu Tập",
        ctaLink: data.link || "/san-pham",
        active: data.active !== false,
        sort_order: data.sort_order || 0
      };
    });
    const activeBanners = docs.filter(b => b.active);
    activeBanners.sort((a, b) => a.sort_order - b.sort_order);
    return activeBanners.length > 0 ? activeBanners : fallbackBanners;
  } catch (error) {
    console.warn("Error fetching banners client-side (using fallback):", error);
    return fallbackBanners;
  }
}

export async function getCategories() {
  try {
    const querySnapshot = await getDocs(collection(db, "categories"));
    if (querySnapshot.empty) return fallbackCategories;
    const docs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      let iconName = "Layers";
      if (data.slug === "bia-mo-da-xanh-thanh-hoa") iconName = "Feather";
      if (data.slug === "mo-da-my-nghe") iconName = "Castle";
      if (data.slug === "bia-di-tich-bia-ghi-danh") iconName = "Award";
      return {
        id: doc.id,
        name: data.name || "",
        slug: data.slug || "",
        description: data.description || "",
        imageUrl: data.image || "",
        iconName,
        active: data.active !== false,
        highlight: data.highlight === true,
        sort_order: data.sort_order || 0,
        seo_title: data.seo_title || undefined,
        meta_description: data.meta_description || undefined,
        og_image: data.og_image || undefined,
        canonical_url: data.canonical_url || undefined,
        no_index: data.no_index === true,
      };
    });
    const activeCategories = docs.filter(c => c.active);
    activeCategories.sort((a, b) => a.sort_order - b.sort_order);
    return activeCategories.length > 0 ? activeCategories : fallbackCategories;
  } catch (error) {
    console.warn("Error fetching categories client-side (using fallback):", error);
    return fallbackCategories;
  }
}

export async function getProducts(categoriesList: any[]) {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const docs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      let catSlug = "bia-mo-da-granite";
      let catName = "Bia Mộ Đá Granite (Hoa Cương)";
      
      if (data.category && typeof data.category === "object") {
        const catId = data.category.id;
        const matchingCat = categoriesList.find(c => c.id === catId || c.slug === catId);
        if (matchingCat) {
          catSlug = matchingCat.slug;
          catName = matchingCat.name;
        }
      }

      const price = data.reference_price || 0;
      const priceStr = price > 0 ? `${price.toLocaleString("vi-VN")} đ` : "Liên hệ báo giá";

      const fallbackSpecs = [
        { key: "Kích thước phổ biến", value: data.dimensions || "Theo kích thước yêu cầu" },
        { key: "Chất liệu", value: data.material || "Đá tự nhiên nguyên khối" },
        { key: "Công nghệ khắc", value: "Khắc CNC chìm sâu kết hợp đục tay thủ công chi tiết hoa văn" },
        { key: "Chất liệu phủ chữ", value: "Sơn vàng cao cấp chịu nhiệt hoặc mạ vàng lá 24K (theo yêu cầu)" },
        { key: "Thời gian hoàn thành", value: "3 - 5 ngày" }
      ];

      const specs = Array.isArray(data.specifications) && data.specifications.length > 0
        ? data.specifications.map((spec: { label?: string; value?: string }) => ({
            key: spec.label || "",
            value: spec.value || ""
          }))
        : fallbackSpecs;

      return {
        id: doc.id,
        name: data.name || "",
        slug: data.slug || "",
        categorySlug: catSlug,
        categoryName: catName,
        price: price,
        priceStr: priceStr,
        imageUrl: data.main_image || "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=600&auto=format&fit=crop",
        images: Array.isArray(data.images) ? data.images : [],
        shortDescription: data.short_description || "",
        description: data.content || "",
        specifications: specs,
        videoUrl: data.video_url || undefined,
        features: (data.features && Array.isArray(data.features) && data.features.length > 0)
          ? data.features
          : [
              "Bề mặt phẳng tuyệt đối, độ bóng gương cực cao dễ dàng lau chùi vệ sinh.",
              "Độ cứng cao, chịu lực nén cực tốt, không nứt nẻ qua thời gian.",
              "Hoa văn viền chữ vạn, rồng chầu nguyệt hoặc hoa sen tùy chọn.",
              "Cam kết bảo hành chữ khắc lên tới 15 năm không phai màu sơn."
            ],
        commitments: (data.commitments && Array.isArray(data.commitments) && data.commitments.length > 0)
          ? data.commitments
          : [
              "Hỗ trợ khắc chân dung truyền thần kỹ nghệ Laser siêu nét",
              "Đá chất lượng cao, không rạn nứt ngầm, không bay màu sơn chữ",
              "Thi công đúng tiến độ cam kết trong hợp đồng"
            ],
        fengshuiTip: data.fengshui_tip || "",
        isFeatured: data.featured === true,
        rating: 5,
        inStock: data.status === "published",
        sort_order: data.sort_order || 0,
        seo_title: data.seo_title || undefined,
        meta_description: data.meta_description || undefined,
        og_image: data.og_image || undefined,
        canonical_url: data.canonical_url || undefined,
        no_index: data.no_index === true,
      };
    });
    
    const publishedProducts = docs.filter(p => p.inStock);
    publishedProducts.sort((a, b) => a.sort_order - b.sort_order);
    return publishedProducts;
  } catch (error) {
    console.warn("Error fetching products client-side:", error);
    return [];
  }
}

export async function getProjects() {
  try {
    const querySnapshot = await getDocs(collection(db, "projects"));
    const docs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const completedDate = data.completed_date;
      let year = "2026";
      if (completedDate) {
        if (completedDate.seconds) {
          year = new Date(completedDate.seconds * 1000).getFullYear().toString();
        } else if (completedDate instanceof Date) {
          year = completedDate.getFullYear().toString();
        } else {
          year = new Date(completedDate).getFullYear().toString();
        }
      }
      return {
        id: doc.id,
        name: data.name || "",
        slug: data.slug || "",
        location: data.location || "Toàn quốc",
        year: data.year || year,
        material: data.material || "Đá tự nhiên",
        shortDescription: data.short_description || "",
        description: data.content || "",
        imageUrl: data.main_image || "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=800&auto=format&fit=crop",
        images: data.images || [],
        scope: (data.scope && Array.isArray(data.scope) && data.scope.length > 0) ? data.scope : [
          "Khảo sát, đo đạc phác thảo bản vẽ tỷ lệ 1:1 dựa trên yêu cầu.",
          "Gia công thô cắt phôi đá tạc móng vững chắc.",
          "Chạm khắc nổi rồng phượng nguyệt hoa sen rực rỡ nghệ thuật.",
          "Điêu khắc chữ mạ vàng bảo vệ vĩnh cửu chống rêu phong thời tiết.",
          "Vận chuyển và hỗ trợ hoàn thiện lắp đặt tận nơi toàn quốc."
        ],
        status: data.status || "draft",
        sort_order: data.sort_order || 0,
        seo_title: data.seo_title || undefined,
        meta_description: data.meta_description || undefined,
        og_image: data.og_image || undefined,
        canonical_url: data.canonical_url || undefined,
        no_index: data.no_index === true,
      };
    });
    const publishedProjects = docs.filter(p => p.status === "published");
    publishedProjects.sort((a, b) => a.sort_order - b.sort_order);
    return publishedProjects;
  } catch (error) {
    console.warn("Error fetching projects client-side:", error);
    return [];
  }
}

export async function getPosts() {
  try {
    const querySnapshot = await getDocs(collection(db, "posts"));
    const docs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const content = data.content || "";
      const wordCount = content.split(/\s+/).length;
      const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} phút đọc`;
      
      const publishedDateVal = data.published_at;
      let publishedDate = "Gần đây";
      if (publishedDateVal) {
        let d: Date;
        if (publishedDateVal.seconds) {
          d = new Date(publishedDateVal.seconds * 1000);
        } else if (publishedDateVal instanceof Date) {
          d = publishedDateVal;
        } else {
          d = new Date(publishedDateVal);
        }
        publishedDate = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
      }

      return {
        id: doc.id,
        name: data.title || "",
        slug: data.slug || "",
        date: publishedDate,
        author: data.author || "Nghệ nhân LĂNG MỘ ĐÁ QUẢNG TRỊ",
        readTime: readTime,
        shortDescription: data.excerpt || "",
        content: content,
        imageUrl: data.cover_image || "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=600&auto=format&fit=crop",
        category: data.category || "knowledge",
        status: data.status || "draft",
        seo_title: data.seo_title || undefined,
        meta_description: data.meta_description || undefined,
        og_image: data.og_image || undefined,
        canonical_url: data.canonical_url || undefined,
        no_index: data.no_index === true,
      };
    });
    const publishedPosts = docs.filter(p => p.status === "published");
    return publishedPosts;
  } catch (error) {
    console.warn("Error fetching posts client-side:", error);
    return [];
  }
}

export const fallbackFAQs = [
  {
    id: "faq-1",
    question: "Chất liệu đá nào tốt nhất để làm bia mộ và lăng mộ?",
    answer: "Chúng tôi sử dụng Đá Granite (Hoa Cương) nhập khẩu nguyên tấm có độ bóng gương vĩnh cửu và Đá Xanh tự nhiên nguyên khối từ Thanh Hóa, Ninh Bình. Cả hai loại đá đều chống rêu mốc, không phai màu chữ và bền bỉ trọn đời dưới thời tiết khắc nghiệt.",
    active: true,
    sort_order: 1
  },
  {
    id: "faq-2",
    question: "Thời gian hoàn thành một sản phẩm bia mộ mất bao lâu?",
    answer: "Thông thường, quy trình chế tác và hoàn thiện một sản phẩm bia mộ chuẩn chất lượng cao tại xưởng Đá Tâm An mất từ 3 đến 5 ngày kể từ khi thống nhất bản vẽ thiết kế 2D.",
    active: true,
    sort_order: 2
  },
  {
    id: "faq-3",
    question: "Xưởng có hỗ trợ khảo sát và thiết kế theo kích thước phong thủy không?",
    answer: "Có, Đá Tâm An hỗ trợ đo đạc khảo sát thực tế và thiết kế phác thảo bản vẽ 2D/3D theo cung số đỏ của thước Lỗ Ban âm phần hoàn toàn miễn phí.",
    active: true,
    sort_order: 3
  },
  {
    id: "faq-4",
    question: "Làm thế nào để tôi đặt hàng từ xa khi không ở gần xưởng?",
    answer: "Quý khách chỉ cần liên hệ hotline hoặc gửi thông tin qua form liên hệ. Chúng tôi sẽ tư vấn, phác thảo thiết kế và gửi duyệt qua Zalo/Email. Sau khi duyệt mẫu, chúng tôi chế tác và vận chuyển, lắp đặt toàn quốc.",
    active: true,
    sort_order: 4
  },
  {
    id: "faq-5",
    question: "Sản phẩm của Đá Tâm An có được bảo hành không?",
    answer: "Tất cả các sản phẩm lăng mộ đá và bia mộ đá của xưởng Đá Tâm An đều được cam kết bảo hành nứt vỡ trọn đời đối với phôi đá tự nhiên và bảo hành lớp sơn mạ chữ trong vòng 5 năm.",
    active: true,
    sort_order: 5
  }
];

export async function getFAQs() {
  try {
    const querySnapshot = await getDocs(collection(db, "faqs"));
    if (querySnapshot.empty) return fallbackFAQs;
    const docs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        question: data.question || "",
        answer: data.answer || "",
        active: data.active !== false,
        sort_order: data.sort_order || 0
      };
    });
    const activeFAQs = docs.filter(f => f.active);
    activeFAQs.sort((a, b) => a.sort_order - b.sort_order);
    return activeFAQs.length > 0 ? activeFAQs : fallbackFAQs;
  } catch (error) {
    console.warn("Error fetching FAQs client-side (using fallback):", error);
    return fallbackFAQs;
  }
}

export const fallbackCtaSlides = [
  {
    id: "slide-1",
    title: "Chế Tác Tinh Hoa",
    subtitle: "Nghệ nhân Đá Tâm An thổi hồn vào từng thớ đá tự nhiên trường tồn.",
    image: "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?q=80&w=600&auto=format&fit=crop",
    link: "",
    button_text: "Liên Hệ Ngay",
    active: true,
    sort_order: 1
  },
  {
    id: "slide-2",
    title: "Đá Nguyên Khối",
    subtitle: "Cam kết 100% phôi đá Granite, đá xanh tuyển chọn không nứt vỡ.",
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=600&auto=format&fit=crop",
    link: "",
    button_text: "Nhận Báo Giá",
    active: true,
    sort_order: 2
  },
  {
    id: "slide-3",
    title: "Chuẩn Phong Thủy Lỗ Ban",
    subtitle: "Đo đạc tận nơi, lên bản vẽ mô phỏng 2D/3D chuẩn phong thủy âm phần.",
    image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop",
    link: "",
    button_text: "Khảo Sát Miễn Phí",
    active: true,
    sort_order: 3
  }
];

export async function getCtaSlides() {
  try {
    const querySnapshot = await getDocs(collection(db, "cta_slides"));
    if (querySnapshot.empty) return fallbackCtaSlides;
    const docs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "",
        subtitle: data.subtitle || "",
        image: data.image || "",
        link: data.link || "",
        button_text: data.button_text || "",
        active: data.active !== false,
        sort_order: data.sort_order || 0
      };
    });
    const activeSlides = docs.filter(s => s.active && s.image);
    activeSlides.sort((a, b) => a.sort_order - b.sort_order);
    return activeSlides.length > 0 ? activeSlides : fallbackCtaSlides;
  } catch (error) {
    console.warn("Error fetching CTA slides client-side (using fallback):", error);
    return fallbackCtaSlides;
  }
}

export async function saveContactMessage(messageData: {
  name: string;
  phone: string;
  email?: string;
  productSlug?: string;
  message?: string;
}) {
  try {
    await addDoc(collection(db, "contact_messages"), {
      ...messageData,
      created_at: new Date()
    });
    return true;
  } catch (error) {
    console.error("Error saving contact message client-side:", error);
    throw error;
  }
}

export const fallbackTestimonials = [
  {
    id: "testimonial-1",
    name: "Nguyễn Văn Hoà",
    role: "Gia chủ - Thanh Hoá",
    content: "Tôi rất hài lòng với công trình lăng mộ gia tộc mà Đá Tâm An chế tác. Các nét chạm khắc tinh xảo, chất đá xanh tự nhiên nguyên khối rất đẹp. Nghệ nhân tư vấn kích thước chuẩn phong thủy Lỗ Ban vô cùng tận tình.",
    rating: 5,
    active: true,
    sort_order: 1
  },
  {
    id: "testimonial-2",
    name: "Phạm Thị Tuyết",
    role: "Khách hàng - Hà Nội",
    content: "Đơn đặt hàng bia mộ granite từ xa nhưng xưởng làm rất chuyên nghiệp. Chữ khắc sâu, sắc nét, mạ vàng 24K cực kỳ sang trọng. Giao hàng nhanh và đóng gói kỹ lưỡng. Sẽ ủng hộ xưởng lâu dài.",
    rating: 5,
    active: true,
    sort_order: 2
  },
  {
    id: "testimonial-3",
    name: "Lê Minh Tuấn",
    role: "Đại diện dòng họ Lê - Ninh Bình",
    content: "Chân thành cảm ơn tập thể nghệ nhân Đá Tâm An. Việc trùng tu khuôn viên lăng mộ tổ dòng họ được hoàn thành đúng tiến độ, chất lượng đá đồng đều và hoa văn rồng phượng uy nghiêm, chuẩn cổ kính.",
    rating: 5,
    active: true,
    sort_order: 3
  },
  {
    id: "testimonial-4",
    name: "Trần Thanh Bình",
    role: "Gia chủ - Quảng Trị",
    content: "Xưởng tư vấn thiết kế phối cảnh 3D rất trực quan, giúp gia đình dễ dàng hình dung trước khi thi công. Quá trình lắp đặt chuyên nghiệp, cẩn thận từng khớp nối mạch hồ. Rất uy tín!",
    rating: 5,
    active: true,
    sort_order: 4
  }
];

export async function getTestimonials() {
  try {
    const querySnapshot = await getDocs(collection(db, "testimonials"));
    if (querySnapshot.empty) return fallbackTestimonials;
    const docs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        role: data.role || "",
        content: data.content || "",
        rating: typeof data.rating === "number" ? data.rating : 5,
        active: data.active !== false,
        sort_order: data.sort_order || 0
      };
    });
    const activeTestimonials = docs.filter(t => t.active);
    activeTestimonials.sort((a, b) => a.sort_order - b.sort_order);
    return activeTestimonials.length > 0 ? activeTestimonials : fallbackTestimonials;
  } catch (error) {
    console.warn("Error fetching testimonials client-side (using fallback):", error);
    return fallbackTestimonials;
  }
}

// ==========================================
// NEW DYNAMIC HOMEPAGE SECTIONS & SITE SETTINGS
// ==========================================

export const fallbackCoreValues: CoreValue[] = [
  {
    id: "val-1",
    title: "Nghệ Nhân Làng Nghề Cổ",
    description: "Chế tác trực tiếp từ phôi đá chuẩn bởi nghệ nhân điêu khắc gia tộc giàu kinh nghiệm Ninh Bình.",
    iconName: "Award",
    sort_order: 1
  },
  {
    id: "val-2",
    title: "Đá Tự Nhiên Nguyên Khối 100%",
    description: "Sử dụng phôi đá hoa cương nhập khẩu, đá xanh Thanh Hóa nguyên khối tốt nhất, bảo hành nứt vỡ trọn đời.",
    iconName: "ShieldCheck",
    sort_order: 2
  },
  {
    id: "val-3",
    title: "Thiết Kế Thước Lỗ Ban",
    description: "Hỗ trợ phác thảo bản vẽ 2D hoàn chỉnh chuẩn cung cát Lỗ Ban âm phần, hoàn thiện chuẩn hẹn 3-5 ngày.",
    iconName: "Clock",
    sort_order: 3
  }
];

export const fallbackBrandIntroductions: BrandIntroduction[] = [
  {
    id: "intro-1",
    title: "Chế tác bằng tâm huyết",
    content: "Lăng Mộ Đá Quảng Trị chuyên thiết kế và thi công các công trình tâm linh bằng đá tự nhiên nguyên khối, được chế tác tỉ mỉ bởi những nghệ nhân giàu kinh nghiệm.",
    sort_order: 1
  },
  {
    id: "intro-2",
    title: "Thiết kế chuẩn phong thủy",
    content: "Mỗi công trình đều được nghiên cứu kỹ về kích thước, hướng đặt, bố cục và hoa văn, bảo đảm sự hài hòa giữa kiến trúc truyền thống và yếu tố phong thủy.",
    sort_order: 2
  },
  {
    id: "intro-3",
    title: "Bền vững cùng thời gian",
    content: "Nguồn đá chất lượng cao được tuyển chọn kỹ lưỡng, có độ bền vượt trội trước thời tiết, giúp công trình giữ được vẻ trang nghiêm qua nhiều thế hệ.",
    sort_order: 3
  },
  {
    id: "intro-4",
    title: "Gìn giữ giá trị gia tộc",
    content: "Không chỉ kiến tạo nơi an nghỉ, Lăng Mộ Đá Quảng Trị còn mong muốn gìn giữ lòng hiếu kính, niềm tự hào và những giá trị tinh thần của mỗi gia đình Việt.",
    sort_order: 4
  }
];

export const fallbackSiteSettings: SiteSetting = {
  id: "main_settings",
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
  google_maps_embed_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3741.0772023533924!2d105.90382347598863!3d20.338511711100366!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3136780c10a30001%3A0xc665796a56e6ca97!2zTMOgbmcgTmdo4buBIGbDoCBN4bu5IE5naOG7hyBOaW5oIFbDom4!5e0!3m2!1svi!2s!4v1710000000000!5m2!1svi!2s"
};

export async function getCoreValues(): Promise<CoreValue[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "core_values"));
    if (querySnapshot.empty) return fallbackCoreValues;
    const docs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "",
        description: data.description || "",
        iconName: data.icon_name || "Award",
        sort_order: data.sort_order || 0,
        active: data.active !== false
      };
    });
    const activeValues = docs.filter(v => v.active);
    activeValues.sort((a, b) => a.sort_order - b.sort_order);
    return activeValues.length > 0 ? activeValues : fallbackCoreValues;
  } catch (error) {
    console.warn("Error fetching core values client-side (using fallback):", error);
    return fallbackCoreValues;
  }
}

export async function getBrandIntroductions(): Promise<BrandIntroduction[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "brand_introductions"));
    if (querySnapshot.empty) return fallbackBrandIntroductions;
    const docs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "",
        content: data.content || "",
        image: data.image || undefined,
        sort_order: data.sort_order || 0,
        active: data.active !== false
      };
    });
    const activeIntros = docs.filter(i => i.active);
    activeIntros.sort((a, b) => a.sort_order - b.sort_order);
    return activeIntros.length > 0 ? activeIntros : fallbackBrandIntroductions;
  } catch (error) {
    console.warn("Error fetching brand introductions client-side (using fallback):", error);
    return fallbackBrandIntroductions;
  }
}

export async function getSiteSettings(): Promise<SiteSetting> {
  try {
    const querySnapshot = await getDocs(collection(db, "site_settings"));
    if (querySnapshot.empty) return fallbackSiteSettings;
    const docs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        key: data.key || "main_settings",
        hotline_title: data.hotline_title || fallbackSiteSettings.hotline_title,
        hotline_subtitle: data.hotline_subtitle || fallbackSiteSettings.hotline_subtitle,
        hotline_phone: data.hotline_phone || fallbackSiteSettings.hotline_phone,
        hotline_secondary_phone: data.hotline_secondary_phone || data.hotline_phone || fallbackSiteSettings.hotline_secondary_phone,
        footer_brand_description: data.footer_brand_description || fallbackSiteSettings.footer_brand_description,
        footer_address: data.footer_address || fallbackSiteSettings.footer_address,
        facebook_url: data.facebook_url || fallbackSiteSettings.facebook_url,
        tiktok_url: data.tiktok_url || fallbackSiteSettings.tiktok_url,
        youtube_url: data.youtube_url || fallbackSiteSettings.youtube_url,
        zalo_phone: data.zalo_phone || fallbackSiteSettings.zalo_phone,
        zalo_url: data.zalo_url || fallbackSiteSettings.zalo_url,
        google_maps_embed_url: data.google_maps_embed_url || fallbackSiteSettings.google_maps_embed_url,
        active: data.active !== false
      };
    });
    const activeSettings = docs.find(s => s.active);
    return activeSettings || fallbackSiteSettings;
  } catch (error) {
    console.warn("Error fetching site settings client-side (using fallback):", error);
    return fallbackSiteSettings;
  }
}

export const fallbackSeoSettings: SeoSetting = {
  id: "main_seo",
  website_name: "Đá Mỹ Nghệ Tâm An",
  default_seo_title: "Chế Tác Bia Mộ Đá Granite Cao Cấp & Lăng Mộ Đá Đẹp - Đá Tâm An",
  default_meta_description: "Đá Mỹ Nghệ Tâm An chuyên thiết kế, chế tác bia mộ đá granite cao cấp, lăng mộ đá xanh tự nhiên nguyên khối chuẩn kích thước phong thủy Lỗ Ban, chạm khắc rồng phượng tinh xảo trường tồn.",
  default_og_image: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=1200&auto=format&fit=crop",
  website_url: "https://langmodaquangtri.com",
  canonical_url: "https://langmodaquangtri.com",
  no_index: false,
};

export async function getSeoSettings(): Promise<SeoSetting> {
  try {
    const querySnapshot = await getDocs(collection(db, "seo_settings"));
    if (querySnapshot.empty) return fallbackSeoSettings;
    const docs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        website_name: data.website_name || fallbackSeoSettings.website_name,
        default_seo_title: data.default_seo_title || fallbackSeoSettings.default_seo_title,
        default_meta_description: data.default_meta_description || fallbackSeoSettings.default_meta_description,
        default_og_image: data.default_og_image || fallbackSeoSettings.default_og_image,
        website_url: data.website_url || fallbackSeoSettings.website_url,
        canonical_url: data.canonical_url || fallbackSeoSettings.canonical_url || data.website_url || "",
        no_index: data.no_index === true,
      };
    });
    const mainSeo = docs.find(s => s.id === "main_seo") || docs[0];
    return mainSeo || fallbackSeoSettings;
  } catch (error) {
    console.warn("Error fetching SEO settings client-side (using fallback):", error);
    return fallbackSeoSettings;
  }
}

export const fallbackWorkProcesses: WorkProcess[] = [
  {
    id: "step-1",
    step: "01",
    title: "Tiếp nhận yêu cầu",
    description: "Ghi nhận mẫu mã, kích thước, vị trí thi công và ngân sách.",
    active: true,
    sort_order: 1
  },
  {
    id: "step-2",
    step: "02",
    title: "Tư vấn phương án",
    description: "Đề xuất loại đá, kiểu dáng và thiết kế phù hợp với công trình.",
    active: true,
    sort_order: 2
  },
  {
    id: "step-3",
    step: "03",
    title: "Báo giá chi tiết",
    description: "Cung cấp báo giá lăng mộ đá minh bạch theo từng hạng mục.",
    active: true,
    sort_order: 3
  },
  {
    id: "step-4",
    step: "04",
    title: "Điều chỉnh thiết kế",
    description: "Chỉnh sửa mẫu mã, kích thước và vật liệu theo yêu cầu.",
    active: true,
    sort_order: 4
  },
  {
    id: "step-5",
    step: "05",
    title: "Chốt phương án",
    description: "Ký hợp đồng và tiến hành sản xuất, vận chuyển, lắp đặt.",
    active: true,
    sort_order: 5
  }
];

export async function getWorkProcesses(): Promise<WorkProcess[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "work_process"));
    if (querySnapshot.empty) return fallbackWorkProcesses;
    const docs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        step: data.step || "",
        title: data.title || "",
        description: data.description || "",
        sort_order: data.sort_order || 0,
        active: data.active !== false
      };
    });
    const activeProcesses = docs.filter(p => p.active);
    activeProcesses.sort((a, b) => a.sort_order - b.sort_order);
    return activeProcesses.length > 0 ? activeProcesses : fallbackWorkProcesses;
  } catch (error) {
    console.warn("Error fetching work processes client-side (using fallback):", error);
    return fallbackWorkProcesses;
  }
}


