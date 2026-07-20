import React, { useState, useEffect } from "react";
import { 
  Phone, 
  MapPin, 
  Mail, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown,
  ChevronUp,
  ArrowLeft, 
  Star, 
  CheckCircle2, 
  Send, 
  Sliders, 
  Sparkles, 
  ShieldCheck, 
  Search, 
  Layers, 
  Feather, 
  Castle, 
  Award,
  BookOpen,
  Calendar,
  User,
  Heart,
  Tag
} from "lucide-react";
import Header from "./components/Header";
import { HeroParallax } from "./components/HeroParallax";
import CtaFaqSection from "./components/CtaFaqSection";
import WorkProcessTimeline from "./components/WorkProcessTimeline";
import Lenis from "lenis";
import { Banner, Category, Product, Project, Post, ViewType, FAQ, CtaSlide, Testimonial, CoreValue, BrandIntroduction, SiteSetting, SeoSetting, WorkProcess } from "./types";
import { getBanners, getCategories, getProducts, getProjects, getPosts, saveContactMessage, getFAQs, getCtaSlides, getTestimonials, getCoreValues, getBrandIntroductions, getSiteSettings, getSeoSettings, getWorkProcesses } from "./lib/firebase";

function getYoutubeVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/
  );
  return match ? match[1] : null;
}

function getYoutubeEmbedId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/
  );
  return match ? match[1] : null;
}

function getMapEmbedUrl(input?: string): string {
  if (!input) return "";
  // Check if it's an iframe tag
  const iframeMatch = input.match(/src="([^"]+)"/i);
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1];
  }
  return input.trim();
}

function parseLocation(): ViewType {
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  
  if (path === "/" || path === "/index.html" || path === "") {
    return { type: "home" };
  }
  if (path === "/san-pham" || path === "/san-pham/") {
    return { type: "products" };
  }
  if (path.startsWith("/san-pham/")) {
    const slug = path.slice(10).replace(/\/$/, "");
    return { type: "product-detail", slug };
  }
  if (path.startsWith("/danh-muc/")) {
    const slug = path.slice(10).replace(/\/$/, "");
    return { type: "products", categorySlug: slug };
  }
  if (path === "/du-an" || path === "/du-an/") {
    return { type: "projects" };
  }
  if (path.startsWith("/du-an/")) {
    const slug = path.slice(7).replace(/\/$/, "");
    return { type: "project-detail", slug };
  }
  if (path === "/bai-viet" || path === "/bai-viet/") {
    return { type: "posts" };
  }
  if (path.startsWith("/chuyen-muc/")) {
    const slug = path.slice(12).replace(/\/$/, "");
    return { type: "posts", categorySlug: slug };
  }
  if (path.startsWith("/bai-viet/")) {
    const slug = path.slice(10).replace(/\/$/, "");
    return { type: "post-detail", slug };
  }
  if (path === "/lien-he" || path === "/lien-he/") {
    const productSlug = searchParams.get("product") || undefined;
    return { type: "contact", productSlug };
  }
  return { type: "home" };
}

function getCoreValueIcon(iconName: string) {
  switch (iconName) {
    case "Award": return <Award className="w-7 h-7" />;
    case "ShieldCheck": return <ShieldCheck className="w-7 h-7" />;
    case "Clock": return <Clock className="w-7 h-7" />;
    case "Heart": return <Heart className="w-7 h-7" />;
    case "Sparkles": return <Sparkles className="w-7 h-7" />;
    case "CheckCircle2": return <CheckCircle2 className="w-7 h-7" />;
    default: return <Award className="w-7 h-7" />;
  }
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>({ type: "home" });

  // Initialize Lenis Smooth Scrolling
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2, // buttery smooth but not too slow
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential easing
    });

    // Make lenis globally accessible
    (window as any).lenisInstance = lenis;

    // Handle standard requestAnimationFrame tick for Lenis
    let rafId: number;
    const tick = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    // Sync Lenis scroll with GSAP ScrollTrigger if GSAP/ScrollTrigger are present in the window context
    lenis.on("scroll", () => {
      if ((window as any).ScrollTrigger) {
        (window as any).ScrollTrigger.update();
      }
    });

    if ((window as any).gsap) {
      (window as any).gsap.ticker.add((time: number) => {
        lenis.raf(time * 1000);
      });
      (window as any).gsap.ticker.lagSmoothing(0);
    }

    // Intercept clicks on internal links to perform smooth scroll
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (href && href.startsWith("#")) {
        const targetElement = document.querySelector(href) as HTMLElement | null;
        if (targetElement) {
          e.preventDefault();
          lenis.scrollTo(targetElement, {
            offset: -80, // Offset for the top sticky bar
            duration: 1.2,
          });
        }
      }
    };
    document.addEventListener("click", handleAnchorClick);

    // Clean up
    return () => {
      document.removeEventListener("click", handleAnchorClick);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      (window as any).lenisInstance = undefined;
    };
  }, []);
  
  // API Data States
  const [homepageData, setHomepageData] = useState<{
    banners: Banner[];
    categories: Category[];
    products: Product[];
    projects: Project[];
    posts: Post[];
  } | null>(null);
  
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [ctaSlides, setCtaSlides] = useState<CtaSlide[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
  const [brandIntroductions, setBrandIntroductions] = useState<BrandIntroduction[]>([]);
  const [workProcesses, setWorkProcesses] = useState<WorkProcess[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSetting | null>(null);
  const [seoSettings, setSeoSettings] = useState<SeoSetting | null>(null);
  
  // Detail views state
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  useEffect(() => {
    setSelectedImage(null);
  }, [activeProduct?.id]);

  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const [currentCatIndex, setCurrentCatIndex] = useState(0);

  useEffect(() => {
    if (categories.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentCatIndex((prev) => (prev + 1) % categories.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [categories.length]);

  const [currentProdIndex, setCurrentProdIndex] = useState(0);

  useEffect(() => {
    if (!homepageData || homepageData.products.length <= 1) return;
    const maxProductsCount = 8;
    const totalSlidesCount = Math.min(homepageData.products.length, maxProductsCount);
    
    const timer = setInterval(() => {
      setCurrentProdIndex((prev) => (prev + 1) % totalSlidesCount);
    }, 3000);
    return () => clearInterval(timer);
  }, [homepageData?.products?.length]);

  const [activeIntroIndex, setActiveIntroIndex] = useState<number | null>(0);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("default");
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactProduct, setContactProduct] = useState("");
  const [formSuccessMsg, setFormSuccessMsg] = useState("");
  const [formErrorMsg, setFormErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Loading and Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync routing state on mount and popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(parseLocation());
    };
    
    // Set initial view
    setCurrentView(parseLocation());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Fetch universal resources
  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        setLoading(true);
        const bannersData = await getBanners();
        const categoriesData = await getCategories();
        const projectsData = await getProjects();
        const postsData = await getPosts();
        const productsData = await getProducts(categoriesData);
        const faqsData = await getFAQs();
        const ctaSlidesData = await getCtaSlides();
        const testimonialsData = await getTestimonials();
        const coreValuesData = await getCoreValues();
        const brandIntrosData = await getBrandIntroductions();
        const workProcessesData = await getWorkProcesses();
        const siteSettingsData = await getSiteSettings();
        const seoSettingsData = await getSeoSettings();
 
        setHomepageData({
          banners: bannersData,
          categories: categoriesData,
          products: productsData.filter(p => p.isFeatured),
          projects: projectsData,
          posts: postsData.slice(0, 3)
        });
 
        setCategories(categoriesData);
        setAllProducts(productsData);
        setProjects(projectsData);
        setPosts(postsData);
        setFaqs(faqsData);
        setCtaSlides(ctaSlidesData);
        setTestimonials(testimonialsData);
        setCoreValues(coreValuesData);
        setBrandIntroductions(brandIntrosData);
        setWorkProcesses(workProcessesData);
        setSiteSettings(siteSettingsData);
        setSeoSettings(seoSettingsData);

        setError(null);
      } catch (err: any) {
        console.error(err);
        setError("Hệ thống đang bảo trì, vui lòng tải lại trang hoặc liên hệ hotline để được hỗ trợ tức thì.");
      } finally {
        setLoading(false);
      }
    };

    fetchBaseData();
  }, []);

  // Handle routing navigation updates
  const navigate = (view: ViewType) => {
    let path = "/";
    if (view.type === "products") {
      path = view.categorySlug ? `/danh-muc/${view.categorySlug}` : "/san-pham";
    } else if (view.type === "product-detail") {
      path = `/san-pham/${view.slug}`;
    } else if (view.type === "projects") {
      path = "/du-an";
    } else if (view.type === "project-detail") {
      path = `/du-an/${view.slug}`;
    } else if (view.type === "posts") {
      path = view.categorySlug ? `/chuyen-muc/${view.categorySlug}` : "/bai-viet";
    } else if (view.type === "post-detail") {
      path = `/bai-viet/${view.slug}`;
    } else if (view.type === "contact") {
      path = view.productSlug ? `/lien-he?product=${view.productSlug}` : "/lien-he";
    }
    
    window.history.pushState(null, "", path);
    setCurrentView(view);
    if ((window as any).lenisInstance) {
      (window as any).lenisInstance.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0 });
    }
  };

  // Listen to specific view changes to load detail content
  useEffect(() => {
    const fetchDetailData = async () => {
      if (currentView.type === "product-detail") {
        try {
          const product = allProducts.find(p => p.slug === currentView.slug);
          if (product) {
            setActiveProduct(product);
            setContactProduct(product.slug);
          } else {
            setActiveProduct(null);
          }
        } catch (e) {
          setActiveProduct(null);
        }
      } else if (currentView.type === "project-detail") {
        try {
          const project = projects.find(p => p.slug === currentView.slug);
          if (project) {
            setActiveProject(project);
          } else {
            setActiveProject(null);
          }
        } catch (e) {
          setActiveProject(null);
        }
      } else if (currentView.type === "post-detail") {
        try {
          const post = posts.find(p => p.slug === currentView.slug);
          if (post) {
            setActivePost(post);
          } else {
            setActivePost(null);
          }
        } catch (e) {
          setActivePost(null);
        }
      } else if (currentView.type === "products" && currentView.categorySlug) {
        try {
          const category = categories.find(c => c.slug === currentView.categorySlug);
          if (category) {
            setActiveCategory(category);
            setSelectedCategory(currentView.categorySlug);
          }
        } catch (e) {
          setActiveCategory(null);
        }
      } else if (currentView.type === "contact") {
        if (currentView.productSlug) {
          setContactProduct(currentView.productSlug);
          setContactMessage(`Tôi đang quan tâm và cần tư vấn báo giá chi tiết sản phẩm bia mộ: "${currentView.productSlug}"`);
        } else {
          setContactProduct("");
          setContactMessage("");
        }
      }
    };

    fetchDetailData();
  }, [currentView, allProducts, categories, projects, posts]);

  // Synchronize SEO metadata
  useEffect(() => {
    if (!seoSettings) return;

    let title = seoSettings.default_seo_title;
    let description = seoSettings.default_meta_description;
    let ogImage = seoSettings.default_og_image;
    let canonicalUrl = seoSettings.canonical_url;
    let noIndex = seoSettings.no_index;

    const currentUrl = window.location.href;

    // Determine current view detail content SEO
    if (currentView.type === "home") {
      title = seoSettings.default_seo_title || `${seoSettings.website_name} | Trang Chủ`;
      description = seoSettings.default_meta_description;
      canonicalUrl = seoSettings.canonical_url;
      noIndex = seoSettings.no_index;
    } else if (currentView.type === "products") {
      if (currentView.categorySlug) {
        const category = categories.find(c => c.slug === currentView.categorySlug);
        if (category) {
          title = category.seo_title || `${category.name} - ${seoSettings.website_name}`;
          description = category.meta_description || category.description || seoSettings.default_meta_description;
          ogImage = category.og_image || category.imageUrl || seoSettings.default_og_image;
          canonicalUrl = category.canonical_url || `${seoSettings.website_url}/danh-muc/${category.slug}`;
          noIndex = category.no_index === true || seoSettings.no_index;
        } else {
          title = `Danh mục sản phẩm - ${seoSettings.website_name}`;
        }
      } else {
        title = `Sản Phẩm Mộ Đá & Bia Mộ Cao Cấp - ${seoSettings.website_name}`;
        description = `Bộ sưu tập các mẫu sản phẩm bia mộ đá granite, lăng mộ đá xanh nguyên khối chạm khắc hoa sen rồng chầu, mạ vàng 24K cực kỳ tinh xảo.`;
        canonicalUrl = `${seoSettings.website_url}/san-pham`;
      }
    } else if (currentView.type === "product-detail") {
      const product = activeProduct || allProducts.find(p => p.slug === currentView.slug);
      if (product) {
        title = product.seo_title || `${product.name} - ${seoSettings.website_name}`;
        description = product.meta_description || product.shortDescription || seoSettings.default_meta_description;
        ogImage = product.og_image || product.imageUrl || seoSettings.default_og_image;
        canonicalUrl = product.canonical_url || `${seoSettings.website_url}/san-pham/${product.slug}`;
        noIndex = product.no_index === true || seoSettings.no_index;
      }
    } else if (currentView.type === "projects") {
      title = `Công Trình Đá Mỹ Nghệ Tiêu Biểu - ${seoSettings.website_name}`;
      description = `Danh sách các dự án lăng mộ gia đình, lăng mộ đá tổ, lăng mộ gia tộc, công trình đá tâm linh tiêu biểu đã được Đá Tâm An bàn giao, lắp đặt toàn quốc.`;
      canonicalUrl = `${seoSettings.website_url}/du-an`;
    } else if (currentView.type === "project-detail") {
      const project = activeProject || projects.find(p => p.slug === currentView.slug);
      if (project) {
        title = project.seo_title || `${project.name} - ${seoSettings.website_name}`;
        description = project.meta_description || project.shortDescription || seoSettings.default_meta_description;
        ogImage = project.og_image || project.imageUrl || seoSettings.default_og_image;
        canonicalUrl = project.canonical_url || `${seoSettings.website_url}/du-an/${project.slug}`;
        noIndex = project.no_index === true || seoSettings.no_index;
      }
    } else if (currentView.type === "posts") {
      if (currentView.categorySlug) {
        title = `Tin Tức Chuyên Mục ${currentView.categorySlug} - ${seoSettings.website_name}`;
        canonicalUrl = `${seoSettings.website_url}/chuyen-muc/${currentView.categorySlug}`;
      } else {
        title = `Kinh Nghiệm Thiết Kế, Chọn Mộ Đá Chuẩn Phong Thủy Lỗ Ban - ${seoSettings.website_name}`;
        description = `Tổng hợp các chia sẻ từ nghệ nhân lão làng về cách xây mộ đá chuẩn thước Lỗ Ban âm phần, kinh nghiệm chọn phôi đá tự nhiên bền vững.`;
        canonicalUrl = `${seoSettings.website_url}/bai-viet`;
      }
    } else if (currentView.type === "post-detail") {
      const post = activePost || posts.find(p => p.slug === currentView.slug);
      if (post) {
        title = post.seo_title || `${post.name} - ${seoSettings.website_name}`;
        description = post.meta_description || post.shortDescription || seoSettings.default_meta_description;
        ogImage = post.og_image || post.imageUrl || seoSettings.default_og_image;
        canonicalUrl = post.canonical_url || `${seoSettings.website_url}/bai-viet/${post.slug}`;
        noIndex = post.no_index === true || seoSettings.no_index;
      }
    } else if (currentView.type === "contact") {
      title = `Liên Hệ Tư Vấn Thiết Kế Mộ Đá & Bia Mộ Granite - ${seoSettings.website_name}`;
      description = `Hỗ trợ giải đáp phong thủy Lỗ Ban, đo đạc báo giá trực tiếp xưởng Đá Tâm An miễn phí 24/7. Vận chuyển và lắp đặt hoàn thiện toàn quốc.`;
      canonicalUrl = `${seoSettings.website_url}/lien-he`;
    }

    // Update <title>
    document.title = title;

    // Helper function to update or create meta tag
    const updateMetaTag = (selector: string, attrName: string, attrVal: string, contentVal: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute("content", contentVal);
    };

    // Helper function to update or create link tag
    const updateLinkTag = (relVal: string, hrefVal: string) => {
      let element = document.querySelector(`link[rel="${relVal}"]`);
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", relVal);
        document.head.appendChild(element);
      }
      element.setAttribute("href", hrefVal);
    };

    // Update Meta Description
    updateMetaTag('meta[name="description"]', 'name', 'description', description);

    // Update Robots Index
    updateMetaTag('meta[name="robots"]', 'name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Update Canonical
    updateLinkTag('canonical', canonicalUrl);

    // Update Open Graph
    updateMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    updateMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    updateMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
    updateMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);
    updateMetaTag('meta[property="og:type"]', 'property', 'og:type', currentView.type.includes('detail') ? 'article' : 'website');
    updateMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', seoSettings.website_name);

    // Update Twitter Cards (standard addition for comprehensive SEO)
    updateMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    updateMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    updateMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    updateMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);

  }, [currentView, seoSettings, activeProduct, activePost, activeProject, activeCategory, allProducts, projects, posts, categories]);

  // Submit Contact Form
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone) {
      setFormErrorMsg("Vui lòng nhập họ tên và số điện thoại liên hệ.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormSuccessMsg("");
      setFormErrorMsg("");

      await saveContactMessage({
        name: contactName,
        phone: contactPhone,
        email: contactEmail || "",
        productSlug: contactProduct || "",
        message: contactMessage || ""
      });

      setFormSuccessMsg("Gửi lời nhắn thành công! Đội ngũ nghệ nhân Bia Mộ Đá Mỹ Nghệ sẽ liên hệ với quý khách trong vòng 1 giờ làm việc.");
      // Clear form
      setContactName("");
      setContactPhone("");
      setContactEmail("");
      setContactMessage("");
      setContactProduct("");
    } catch (err) {
      setFormErrorMsg("Lỗi kết nối. Quý khách vui lòng gọi Hotline 0987.654.321 để được giải đáp ngay lập tức.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Layers": return <Layers className="w-6 h-6 text-deep-navy" />;
      case "Feather": return <Feather className="w-6 h-6 text-deep-navy" />;
      case "Castle": return <Castle className="w-6 h-6 text-deep-navy" />;
      case "Award": return <Award className="w-6 h-6 text-deep-navy" />;
      default: return <Sliders className="w-6 h-6 text-deep-navy" />;
    }
  };

  // Filter products by search and selection
  const getFilteredProducts = () => {
    let result = [...allProducts];
    if (selectedCategory !== "all") {
      result = result.filter(p => p.categorySlug === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.shortDescription.toLowerCase().includes(q) || 
        p.categoryName.toLowerCase().includes(q)
      );
    }
    
    // Filter by price range
    if (priceFilter !== "all") {
      if (priceFilter === "under-10m") {
        result = result.filter(p => p.price > 0 && p.price < 10000000);
      } else if (priceFilter === "10m-20m") {
        result = result.filter(p => p.price >= 10000000 && p.price <= 20000000);
      } else if (priceFilter === "20m-50m") {
        result = result.filter(p => p.price > 20000000 && p.price <= 50000000);
      } else if (priceFilter === "over-50m") {
        result = result.filter(p => p.price > 50000000);
      } else if (priceFilter === "quote") {
        result = result.filter(p => !p.price || p.price === 0);
      }
    }

    // Sorting logic
    if (sortBy === "price-asc") {
      result.sort((a, b) => {
        const pA = a.price || 0;
        const pB = b.price || 0;
        if (pA === 0) return 1; // Put contact/no price products at the end
        if (pB === 0) return -1;
        return pA - pB;
      });
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => {
        const pA = a.price || 0;
        const pB = b.price || 0;
        if (pA === 0) return 1;
        if (pB === 0) return -1;
        return pB - pA;
      });
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name, "vi"));
    }

    return result;
  };

  // Slider controls for homepage hero banner
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  useEffect(() => {
    if (homepageData && homepageData.banners.length > 1) {
      const interval = setInterval(() => {
        setActiveBannerIdx((prev) => (prev + 1) % homepageData.banners.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [homepageData]);

  if (loading && !homepageData) {
    return (
      <div className="min-h-screen bg-beige flex flex-col justify-center items-center py-12 px-4">
        <div className="w-16 h-16 border-4 border-clay border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-serif italic text-stone-charcoal/70 text-lg">LĂNG MỘ ĐÁ QUẢNG TRỊ - Tinh Hoa Chạm Khắc Đang Khởi Tạo...</p>
      </div>
    );
  }

  const phoneNum = siteSettings?.hotline_phone || "0987.654.321";
  const cleanPhone = phoneNum.replace(/\./g, "").replace(/\s/g, "");
  
  // Resolve Zalo Link with separate fields
  let zaloLink = "";
  if (siteSettings?.zalo_url && siteSettings.zalo_url.trim().startsWith("http")) {
    zaloLink = siteSettings.zalo_url.trim();
  } else if (siteSettings?.zalo_phone) {
    const cleanZaloPhone = siteSettings.zalo_phone.replace(/\./g, "").replace(/\s/g, "");
    zaloLink = `https://zalo.me/${cleanZaloPhone}`;
  } else if (siteSettings?.zalo_url) {
    const cleanZaloVal = siteSettings.zalo_url.replace(/\./g, "").replace(/\s/g, "");
    zaloLink = `https://zalo.me/${cleanZaloVal}`;
  } else {
    zaloLink = `https://zalo.me/${cleanPhone}`;
  }

  return (
    <div className="min-h-screen flex flex-col bg-beige text-stone-charcoal selection:bg-clay selection:text-white">
      {/* Universal Header */}
      <Header currentView={currentView} onNavigate={navigate} categories={categories} />

      {/* Main Content Area */}
      <main className="flex-grow">
        
        {/* Error Alert if any */}
        {error && (
          <div className="max-w-7xl mx-auto mt-6 px-4">
            <div className="bg-clay-light border-l-4 border-clay p-4 text-sm text-clay-dark rounded-sm">
              <p className="font-semibold">{error}</p>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW: HOME                              */}
        {/* ======================================= */}
        {currentView.type === "home" && homepageData && (
          <div>
            {/* Elegant Scroll-controlled Video Hero */}
            <HeroParallax 
              onContactClick={() => navigate({ type: "contact" })}
            />

            {/* Core Values Section */}
            <section id="core-values" className="relative py-[43px] md:py-12 bg-deep-navy border-b border-dark-navy overflow-hidden">
              {/* Background Ornament Image */}
              <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                <img 
                  src="https://images.langmodaquangtri.com/Artboard%202.svg" 
                  alt="Background pattern" 
                  className="h-full w-auto max-w-none object-contain opacity-15" 
                />
              </div>

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                  {coreValues.map((val) => (
                    <div key={val.id} className="p-4 flex flex-col md:flex-row items-center md:items-start gap-4">
                      <div className="p-3 bg-white/10 text-white rounded-full shrink-0">
                        {getCoreValueIcon(val.iconName)}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-base text-white mb-1">{val.title}</h4>
                        <p className="text-xs text-white/80 font-sans">
                          {val.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Short Introduction Section (Giới thiệu ngắn) */}
            <section className="py-[72px] md:py-20 bg-light-cream/40 border-b border-deep-navy/5">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Left Column: Introduction Accordion */}
                  <div className="lg:col-span-7 space-y-8">
                    <div>
                      <span className="text-xs uppercase tracking-[0.2em] text-red-clay font-bold font-mono">Bản Sắc Thương Hiệu</span>
                      <h3 className="text-3xl sm:text-4xl font-serif font-extrabold mt-2 text-deep-navy uppercase tracking-tight leading-tight">
                        giới thiệu - LĂNG MỘ ĐÁ QUẢNG TRỊ
                      </h3>
                      <div className="w-16 h-[1.5px] bg-red-clay mt-4" />
                    </div>

                    <div className="space-y-4 pt-2">
                      {brandIntroductions.map((item, idx) => {
                        const isOpen = activeIntroIndex === idx;
                        return (
                          <div 
                            key={item.id} 
                            className="border border-deep-navy/10 bg-white p-5 rounded-none transition-all duration-300 hover:shadow-xs"
                          >
                            <button
                              onClick={() => setActiveIntroIndex(isOpen ? null : idx)}
                              className="w-full flex justify-between items-center text-left group focus:outline-none"
                              aria-expanded={isOpen}
                            >
                              <span className={`font-serif font-bold text-base transition-colors uppercase tracking-wide ${isOpen ? "text-red-clay" : "text-deep-navy group-hover:text-red-clay"}`}>
                                {item.title}
                              </span>
                              <div className="w-6 h-6 rounded-full bg-deep-navy/5 flex items-center justify-center text-deep-navy group-hover:bg-red-clay/5 group-hover:text-red-clay transition-all duration-300">
                                {isOpen ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </div>
                            </button>
                            
                            <div 
                              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                                isOpen ? "max-h-60 opacity-100 mt-4 pt-3 border-t border-deep-navy/5" : "max-h-0 opacity-0 pointer-events-none"
                              }`}
                            >
                              <p className="text-sm text-charcoal/80 leading-relaxed font-sans whitespace-pre-line">
                                {item.content}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Image */}
                  <div className="lg:col-span-5 w-full">
                    <div className="relative w-full overflow-hidden group">
                      <img 
                        src={brandIntroductions.find(i => i.image)?.image || "https://images.langmodaquangtri.com/tra%CC%A3m.webp"} 
                        alt="Trạm chế tác Lăng Mộ Đá Quảng Trị" 
                        className="w-full h-auto filter brightness-[0.97] contrast-[1.01] transition-transform duration-[1200ms] group-hover:scale-105"
                      />
                    </div>
                    <p className="text-center text-[10px] text-charcoal/50 font-mono tracking-wider mt-3 uppercase">
                      TRẠM CHẾ TÁC LĂNG MỘ ĐÁ QUẢNG TRỊ
                    </p>
                  </div>

                </div>
              </div>
            </section>

            {/* Categories Division (Danh mục nổi bật) */}
            <section className="py-[72px] md:py-20 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <span className="text-xs uppercase tracking-[0.2em] text-red-clay font-bold font-mono">Tác Phẩm Tâm Linh</span>
                <h3 className="text-3xl sm:text-4xl font-serif font-extrabold mt-2 text-deep-navy uppercase tracking-tight">Danh Mục Sản Phẩm</h3>
                <div className="w-16 h-[1.5px] bg-red-clay mx-auto mt-4" />
              </div>

              {(() => {
                const maxCategoriesCount = 8;
                const hasMoreCategories = homepageData.categories.length > maxCategoriesCount;
                const displayedCategories = hasMoreCategories 
                  ? homepageData.categories.slice(0, maxCategoriesCount - 1)
                  : homepageData.categories;
                
                const mobileCategoriesList = hasMoreCategories
                  ? [...displayedCategories, { id: "view-more-special", name: "Xem thêm", description: "Khám phá tất cả các danh mục sản phẩm của chúng tôi", iconName: "Sparkles", isSpecialViewMore: true }]
                  : homepageData.categories;

                return (
                  <>
                    {/* Desktop view: Grid layout */}
                    <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-8">
                      {displayedCategories.map((cat) => (
                        <div 
                          key={cat.id}
                          onClick={() => navigate({ type: "products", categorySlug: cat.slug })}
                          className="group cursor-pointer bg-light-cream border border-deep-navy/10 hover:border-red-clay/35 p-5 rounded-none transition-all duration-500 hover:shadow-xs flex flex-col justify-between text-left"
                        >
                          <div>
                            {/* Elegant Sharp Editorial Image Frame for CMS Uploaded Images */}
                            <div className="w-full aspect-[4/3] mb-5 overflow-hidden relative bg-cream border border-deep-navy/5">
                              {(cat.imageUrl || (cat as any).image) ? (
                                <img 
                                  src={cat.imageUrl || (cat as any).image} 
                                  alt={cat.name} 
                                  className="w-full h-full object-cover filter brightness-[0.97] contrast-[1.01] group-hover:scale-105 transition-transform duration-[1200ms]"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-deep-navy/5">
                                  {getCategoryIcon(cat.iconName)}
                                </div>
                              )}
                              <div className="absolute inset-0 bg-deep-navy/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>

                            <h4 className="font-serif font-bold text-base text-deep-navy mb-2 group-hover:text-red-clay transition-colors uppercase tracking-wide">
                              {cat.name}
                            </h4>
                            <p className="text-xs text-charcoal/75 font-sans line-clamp-3 leading-relaxed">
                              {cat.description}
                            </p>
                          </div>
                          
                          <div className="mt-5 pt-3 border-t border-deep-navy/5 flex items-center justify-between">
                            <span className="text-[10px] font-mono tracking-widest text-red-clay font-bold uppercase">
                              KHÁM PHÁ →
                            </span>
                            <ChevronRight className="w-4 h-4 text-red-clay transform translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300" />
                          </div>
                        </div>
                      ))}

                      {hasMoreCategories && (
                        <div 
                          onClick={() => navigate({ type: "products" })}
                          className="group cursor-pointer bg-light-cream border border-dashed border-red-clay/40 hover:border-red-clay hover:bg-cream/25 p-5 rounded-none transition-all duration-500 hover:shadow-xs flex flex-col justify-between text-center items-center min-h-[320px]"
                        >
                          <div className="flex-grow flex flex-col justify-center items-center py-8">
                            <div className="w-16 h-16 rounded-full bg-red-clay/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                              <Sparkles className="w-8 h-8 text-red-clay" />
                            </div>
                            <h4 className="font-serif font-extrabold text-lg text-deep-navy mb-2 group-hover:text-red-clay transition-colors uppercase tracking-wide">
                              Xem Thêm
                            </h4>
                            <p className="text-xs text-charcoal/75 font-sans px-4">
                              Khám phá toàn bộ danh mục sản phẩm lăng mộ đá mỹ nghệ cao cấp của chúng tôi.
                            </p>
                          </div>
                          
                          <div className="w-full pt-3 border-t border-deep-navy/5 flex items-center justify-center gap-1.5 text-[10px] font-mono tracking-widest text-red-clay font-bold uppercase">
                            TẤT CẢ SẢN PHẨM <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mobile view: Horizontal Smooth Auto-sliding Track with Premium Controls */}
                    <div className="block sm:hidden relative px-2">
                      <div className="relative overflow-hidden w-full">
                        <div 
                          className="flex transition-transform duration-500 ease-in-out"
                          style={{ transform: `translateX(-${currentCatIndex * 100}%)` }}
                        >
                          {mobileCategoriesList.map((cat: any) => {
                            if (cat.isSpecialViewMore) {
                              return (
                                <div 
                                  key="view-more-special"
                                  className="w-full shrink-0 px-2"
                                >
                                  <div 
                                    onClick={() => navigate({ type: "products" })}
                                    className="group cursor-pointer bg-light-cream border border-dashed border-red-clay/40 hover:border-red-clay hover:bg-cream/25 p-5 rounded-none transition-all duration-500 hover:shadow-xs flex flex-col justify-between text-center items-center h-full min-h-[320px]"
                                  >
                                    <div className="flex-grow flex flex-col justify-center items-center py-8">
                                      <div className="w-16 h-16 rounded-full bg-red-clay/5 flex items-center justify-center mb-4">
                                        <Sparkles className="w-8 h-8 text-red-clay" />
                                      </div>
                                      <h4 className="font-serif font-extrabold text-lg text-deep-navy mb-2 uppercase tracking-wide">
                                        Xem Thêm
                                      </h4>
                                      <p className="text-xs text-charcoal/75 font-sans px-4">
                                        Khám phá toàn bộ danh mục sản phẩm lăng mộ đá mỹ nghệ cao cấp.
                                      </p>
                                    </div>
                                    
                                    <div className="w-full pt-3 border-t border-deep-navy/5 flex items-center justify-center gap-1.5 text-[10px] font-mono tracking-widest text-red-clay font-bold uppercase">
                                      TẤT CẢ SẢN PHẨM <ChevronRight className="w-4 h-4" />
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div 
                                key={cat.id}
                                className="w-full shrink-0 px-2"
                              >
                                <div 
                                  onClick={() => navigate({ type: "products", categorySlug: cat.slug })}
                                  className="group cursor-pointer bg-light-cream border border-deep-navy/10 hover:border-red-clay/35 p-5 rounded-none transition-all duration-500 hover:shadow-xs flex flex-col justify-between text-left h-full"
                                >
                                  <div>
                                    {/* Elegant Sharp Editorial Image Frame for CMS Uploaded Images */}
                                    <div className="w-full aspect-[4/3] mb-5 overflow-hidden relative bg-cream border border-deep-navy/5">
                                      {(cat.imageUrl || (cat as any).image) ? (
                                        <img 
                                          src={cat.imageUrl || (cat as any).image} 
                                          alt={cat.name} 
                                          className="w-full h-full object-cover filter brightness-[0.97] contrast-[1.01] group-hover:scale-105 transition-transform duration-[1200ms]"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-deep-navy/5">
                                          {getCategoryIcon(cat.iconName)}
                                        </div>
                                      )}
                                      <div className="absolute inset-0 bg-deep-navy/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>

                                    <h4 className="font-serif font-bold text-base text-deep-navy mb-2 group-hover:text-red-clay transition-colors uppercase tracking-wide">
                                      {cat.name}
                                    </h4>
                                    <p className="text-xs text-charcoal/75 font-sans line-clamp-3 leading-relaxed">
                                      {cat.description}
                                    </p>
                                  </div>
                                  
                                  <div className="mt-5 pt-3 border-t border-deep-navy/5 flex items-center justify-between">
                                    <span className="text-[10px] font-mono tracking-widest text-red-clay font-bold uppercase">
                                      KHÁM PHÁ →
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-red-clay transform translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300" />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Arrow & Indicator Controls row */}
                      <div className="flex items-center justify-between mt-6 px-2">
                        <button 
                          onClick={() => {
                            const len = mobileCategoriesList.length;
                            setCurrentCatIndex((prev) => (prev - 1 + len) % len);
                          }}
                          className="p-2.5 bg-white border border-deep-navy/10 rounded-full shadow-xs text-deep-navy hover:bg-light-cream hover:text-red-clay active:scale-95 transition-all"
                          aria-label="Previous Category"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        {/* Dot Indicators */}
                        <div className="flex gap-2">
                          {mobileCategoriesList.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentCatIndex(idx)}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                idx === currentCatIndex ? "w-6 bg-red-clay" : "bg-deep-navy/15"
                              }`}
                              aria-label={`Go to slide ${idx + 1}`}
                            />
                          ))}
                        </div>

                        <button 
                          onClick={() => {
                            const len = mobileCategoriesList.length;
                            setCurrentCatIndex((prev) => (prev + 1) % len);
                          }}
                          className="p-2.5 bg-white border border-deep-navy/10 rounded-full shadow-xs text-deep-navy hover:bg-light-cream hover:text-red-clay active:scale-95 transition-all"
                          aria-label="Next Category"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </section>

            {/* Customer Testimonials Section (Đánh giá của khách hàng) */}
            <section className="py-[72px] md:py-20 bg-white border-y sm:border border-deep-navy/5 overflow-hidden px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 sm:rounded-sm shadow-xs">
              <div className="text-center mb-12 px-4">
                <span className="text-xs uppercase tracking-[0.2em] text-red-clay font-bold font-mono">Ý Kiến Khách Hàng</span>
                <h3 className="text-3xl sm:text-4xl font-serif font-extrabold mt-2 text-deep-navy uppercase tracking-tight">Gia Chủ Nói Về Chúng Tôi</h3>
                <div className="w-16 h-[1.5px] bg-red-clay mx-auto mt-4" />
                <p className="text-xs text-charcoal/60 mt-3 font-sans font-medium">Di chuột vào thẻ đánh giá để tạm dừng xem chi tiết</p>
              </div>

              {/* Infinite Horizontal Auto-sliding Track with Premium Vignette Fades */}
              <div className="relative w-full">
                {/* Left & Right Gradient Vignette Fades */}
                <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                <div className="overflow-hidden w-full py-4">
                  <div className="animate-marquee-left flex gap-6 px-4">
                    {/* Render testimonials list twice to allow seamless loop wrapping */}
                    {testimonials.length > 0 ? (
                      [...testimonials, ...testimonials, ...testimonials].map((item, index) => (
                        <div 
                          key={`${item.id}-${index}`}
                          className="w-[290px] sm:w-[360px] shrink-0 bg-white border border-deep-navy/10 hover:border-red-clay/35 hover:shadow-md transition-all duration-300 p-6 sm:p-8 rounded-none flex flex-col justify-between text-left"
                        >
                          <div>
                            {/* Star rating display */}
                            <div className="flex gap-1 mb-4 text-amber-500">
                              {Array.from({ length: item.rating || 5 }).map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                              ))}
                            </div>
                            
                            {/* Testimonial body content */}
                            <p className="text-xs sm:text-sm text-charcoal/80 font-sans italic leading-relaxed mb-6 font-medium">
                              "{item.content}"
                            </p>
                          </div>

                          {/* Customer Profile Row */}
                          <div className="flex items-center gap-3 pt-4 border-t border-deep-navy/5">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-clay/10 flex items-center justify-center border border-clay/10 text-clay font-bold text-xs sm:text-sm font-serif shrink-0">
                              {item.name ? item.name.charAt(0) : "K"}
                            </div>
                            <div>
                              <strong className="block text-xs sm:text-sm text-deep-navy font-serif font-bold uppercase tracking-wide">
                                {item.name}
                              </strong>
                              <span className="block text-[10px] sm:text-xs text-charcoal/60 font-sans">
                                {item.role}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      // Safeguard for loading / fallback
                      <div className="text-center w-full py-4 text-charcoal/50 text-sm font-sans">
                        Đang tải các đánh giá...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Featured Products List (Sản phẩm nổi bật) */}
            <section className="py-[58px] md:py-16 bg-beige-paper/35 border-t border-b border-beige-dark/30">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between sm:items-end items-start gap-4 mb-10">
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-clay font-semibold">Tuyển Chọn Chế Tác</span>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold mt-1 text-stone-charcoal leading-tight">Mẫu Bia Mộ & Mộ Đá Nổi Bật</h3>
                  </div>
                  <button 
                    onClick={() => navigate({ type: "products" })}
                    className="text-xs font-bold uppercase tracking-wider text-clay hover:text-clay-dark underline underline-offset-4 flex items-center gap-1 shrink-0"
                  >
                    Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {(() => {
                  const maxProductsCount = 8;
                  const hasMoreProducts = homepageData.products.length > maxProductsCount;
                  const displayedProducts = hasMoreProducts 
                    ? homepageData.products.slice(0, maxProductsCount - 1)
                    : homepageData.products;

                  const mobileProductsList = hasMoreProducts
                    ? [...displayedProducts, { id: "view-more-special-prod", name: "Xem thêm", description: "Khám phá toàn bộ tác phẩm đá mỹ nghệ tâm linh tinh xảo khác", isSpecialViewMore: true }]
                    : homepageData.products;

                  return (
                    <>
                      {/* Desktop Grid Layout */}
                      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8">
                        {displayedProducts.map((prod) => (
                          <div 
                            key={prod.id}
                            onClick={() => navigate({ type: "product-detail", slug: prod.slug })}
                            className="bg-beige border border-beige-dark/40 rounded-sm overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer"
                          >
                            <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                              <img 
                                src={prod.imageUrl} 
                                alt={prod.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute top-3 left-3 bg-clay text-beige text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-xs">
                                {prod.categoryName.split(" (")[0]}
                              </div>
                            </div>
                            
                            <div className="p-5 flex flex-col h-[220px] justify-between">
                              <div>
                                <div className="flex items-center gap-1 text-bronze mb-1.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                                  ))}
                                  <span className="text-xs text-stone-charcoal/60 ml-1">({prod.rating})</span>
                                </div>
                                
                                <h4 
                                  onClick={() => navigate({ type: "product-detail", slug: prod.slug })}
                                  className="font-serif font-bold text-base text-stone-charcoal hover:text-clay transition-colors cursor-pointer line-clamp-2 leading-tight"
                                >
                                  {prod.name}
                                </h4>
                                
                                <p className="text-xs text-stone-charcoal/70 font-sans mt-2 line-clamp-2 leading-relaxed">
                                  {prod.shortDescription}
                                </p>
                              </div>

                              <div className="border-t border-beige-dark/50 pt-3 flex justify-between items-center mt-3">
                                <div>
                                  <span className="text-[10px] uppercase text-stone-charcoal/50 block font-mono">Giá chỉ từ</span>
                                  <span className="text-sm font-semibold text-clay">{prod.priceStr}</span>
                                </div>
                                <button
                                  onClick={() => navigate({ type: "product-detail", slug: prod.slug })}
                                  className="px-3.5 py-1.5 bg-beige-paper text-stone-charcoal hover:bg-clay hover:text-beige border border-bronze/40 text-xs font-semibold transition-all rounded-xs"
                                >
                                  Chi Tiết
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {hasMoreProducts && (
                          <div 
                            onClick={() => navigate({ type: "products" })}
                            className="bg-beige border border-dashed border-clay/40 rounded-sm overflow-hidden group hover:border-clay hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between p-6 h-full min-h-[350px]"
                          >
                            <div className="flex-grow flex flex-col justify-center items-center py-6 text-center">
                              <div className="w-14 h-14 rounded-full bg-clay/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Sparkles className="w-7 h-7 text-clay" />
                              </div>
                              <h4 className="font-serif font-bold text-lg text-stone-charcoal group-hover:text-clay transition-colors uppercase tracking-wide">
                                Xem Thêm
                              </h4>
                              <p className="text-xs text-stone-charcoal/70 font-sans px-4 mt-2">
                                Khám phá toàn bộ tác phẩm đá mỹ nghệ tâm linh tinh xảo khác của chúng tôi.
                              </p>
                            </div>
                            
                            <div className="w-full pt-4 border-t border-beige-dark/50 flex items-center justify-center gap-1.5 text-[10px] font-mono tracking-widest text-clay font-bold uppercase">
                              TẤT CẢ SẢN PHẨM <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Mobile Horizontal Sliding Track */}
                      <div className="block md:hidden relative px-2">
                        <div className="relative overflow-hidden w-full">
                          <div 
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${currentProdIndex * 100}%)` }}
                          >
                            {mobileProductsList.map((prod: any) => {
                              if (prod.isSpecialViewMore) {
                                return (
                                  <div key="view-more-special-prod" className="w-full shrink-0 px-2">
                                    <div 
                                      onClick={() => navigate({ type: "products" })}
                                      className="bg-beige border border-dashed border-clay/40 rounded-sm overflow-hidden group hover:border-clay hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between p-6 h-full min-h-[350px] text-center"
                                    >
                                      <div className="flex-grow flex flex-col justify-center items-center py-6">
                                        <div className="w-14 h-14 rounded-full bg-clay/5 flex items-center justify-center mb-4">
                                          <Sparkles className="w-7 h-7 text-clay" />
                                        </div>
                                        <h4 className="font-serif font-bold text-lg text-stone-charcoal uppercase tracking-wide">
                                          Xem Thêm
                                        </h4>
                                        <p className="text-xs text-stone-charcoal/70 font-sans px-4 mt-2">
                                          Khám phá toàn bộ tác phẩm đá mỹ nghệ tâm linh tinh xảo khác của chúng tôi.
                                        </p>
                                      </div>
                                      <div className="w-full pt-4 border-t border-beige-dark/50 flex items-center justify-center gap-1.5 text-[10px] font-mono tracking-widest text-clay font-bold uppercase">
                                        TẤT CẢ SẢN PHẨM <ChevronRight className="w-4 h-4" />
                                      </div>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div key={prod.id} className="w-full shrink-0 px-2">
                                  <div 
                                    onClick={() => navigate({ type: "product-detail", slug: prod.slug })}
                                    className="bg-beige border border-beige-dark/40 rounded-sm overflow-hidden group hover:shadow-lg transition-all duration-300 text-left cursor-pointer"
                                  >
                                    <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                                      <img 
                                        src={prod.imageUrl} 
                                        alt={prod.name} 
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute top-3 left-3 bg-clay text-beige text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-xs">
                                        {prod.categoryName.split(" (")[0]}
                                      </div>
                                    </div>
                                    
                                    <div className="p-5 flex flex-col h-[220px] justify-between">
                                      <div>
                                        <div className="flex items-center gap-1 text-bronze mb-1.5">
                                          {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                                          ))}
                                          <span className="text-xs text-stone-charcoal/60 ml-1">({prod.rating})</span>
                                        </div>
                                        
                                        <h4 
                                          onClick={() => navigate({ type: "product-detail", slug: prod.slug })}
                                          className="font-serif font-bold text-base text-stone-charcoal hover:text-clay transition-colors cursor-pointer line-clamp-2 leading-tight"
                                        >
                                          {prod.name}
                                        </h4>
                                        
                                        <p className="text-xs text-stone-charcoal/70 font-sans mt-2 line-clamp-2 leading-relaxed">
                                          {prod.shortDescription}
                                        </p>
                                      </div>

                                      <div className="border-t border-beige-dark/50 pt-3 flex justify-between items-center mt-3">
                                        <div>
                                          <span className="text-[10px] uppercase text-stone-charcoal/50 block font-mono">Giá chỉ từ</span>
                                          <span className="text-sm font-semibold text-clay">{prod.priceStr}</span>
                                        </div>
                                        <button
                                          onClick={() => navigate({ type: "product-detail", slug: prod.slug })}
                                          className="px-3.5 py-1.5 bg-beige-paper text-stone-charcoal hover:bg-clay hover:text-beige border border-bronze/40 text-xs font-semibold transition-all rounded-xs"
                                        >
                                          Chi Tiết
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Arrow & Indicator Controls row */}
                        <div className="flex items-center justify-between mt-6 px-2">
                          <button 
                            onClick={() => {
                              const len = mobileProductsList.length;
                              setCurrentProdIndex((prev) => (prev - 1 + len) % len);
                            }}
                            className="p-2.5 bg-white border border-deep-navy/10 rounded-full shadow-xs text-deep-navy hover:bg-light-cream hover:text-red-clay active:scale-95 transition-all"
                            aria-label="Previous Product"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>

                          {/* Dot Indicators */}
                          <div className="flex gap-2">
                            {mobileProductsList.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCurrentProdIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                  idx === currentProdIndex ? "w-6 bg-red-clay" : "bg-deep-navy/15"
                                }`}
                                aria-label={`Go to slide ${idx + 1}`}
                              />
                            ))}
                          </div>

                          <button 
                            onClick={() => {
                              const len = mobileProductsList.length;
                              setCurrentProdIndex((prev) => (prev + 1) % len);
                            }}
                            className="p-2.5 bg-white border border-deep-navy/10 rounded-full shadow-xs text-deep-navy hover:bg-light-cream hover:text-red-clay active:scale-95 transition-all"
                            aria-label="Next Product"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </section>

            {/* Featured Projects (Công trình tiêu biểu) */}
            <section className="py-[58px] md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <span className="text-xs uppercase tracking-[0.2em] text-clay font-semibold">Thực Tế Công Trình</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold mt-1 text-stone-charcoal">Dự Án Điêu Khắc Tiêu Biểu</h3>
                <div className="w-16 h-0.5 bg-clay mx-auto mt-3" />
              </div>

              {/* Desktop layout: Grid layout */}
              <div className="hidden sm:grid grid-cols-1 lg:grid-cols-3 gap-8">
                {homepageData.projects.map((proj) => (
                  <div 
                    key={proj.id}
                    className="bg-beige-paper/50 border border-beige-dark/40 rounded-sm overflow-hidden flex flex-col"
                  >
                    <div className="relative h-48 overflow-hidden bg-stone-200">
                      <img 
                        src={proj.imageUrl} 
                        alt={proj.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-3 left-3 bg-stone-charcoal/90 text-white text-xs px-2.5 py-1 rounded-xs font-mono">
                        {proj.location}
                      </div>
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-clay block mb-1">
                          Năm thực hiện: {proj.year}
                        </span>
                        <h4 
                          onClick={() => navigate({ type: "project-detail", slug: proj.slug })}
                          className="font-serif font-bold text-base text-stone-charcoal hover:text-clay transition-colors cursor-pointer line-clamp-1"
                        >
                          {proj.name}
                        </h4>
                        <p className="text-xs text-stone-charcoal/70 font-sans mt-2 line-clamp-3 leading-relaxed">
                          {proj.shortDescription}
                        </p>
                      </div>
                      <div className="border-t border-beige-dark/40 pt-4 mt-4 flex items-center justify-between">
                        <span className="text-[10px] italic text-stone-charcoal/60 line-clamp-1 max-w-[150px]">
                          Vật liệu: {proj.material.split(" ")[0]}
                        </span>
                        <button
                          onClick={() => navigate({ type: "project-detail", slug: proj.slug })}
                          className="text-xs font-bold text-clay hover:text-clay-dark flex items-center gap-1 uppercase tracking-wider"
                        >
                          Xem dự án <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile layout: Mixed vertical-horizontal stack matching wireframe */}
              <div className="block sm:hidden flex flex-col gap-4">
                {homepageData.projects.slice(0, 3).map((proj, idx) => {
                  if (idx === 0) {
                    // First item: Taller/large card
                    return (
                      <div 
                        key={proj.id}
                        className="bg-beige-paper/50 border border-beige-dark/40 rounded-lg overflow-hidden flex flex-col shadow-xs"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-stone-200">
                          <img 
                            src={proj.imageUrl} 
                            alt={proj.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-3 left-3 bg-stone-charcoal/90 text-white text-xs px-2.5 py-1 rounded-xs font-mono">
                            {proj.location}
                          </div>
                        </div>
                        <div className="p-4 flex-grow flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-clay block mb-1">
                              Năm thực hiện: {proj.year}
                            </span>
                            <h4 
                              onClick={() => navigate({ type: "project-detail", slug: proj.slug })}
                              className="font-serif font-bold text-base text-stone-charcoal hover:text-clay transition-colors cursor-pointer line-clamp-2 leading-snug"
                            >
                              {proj.name}
                            </h4>
                            <p className="text-xs text-stone-charcoal/70 font-sans mt-2 line-clamp-2 leading-relaxed">
                              {proj.shortDescription}
                            </p>
                          </div>
                          <div className="border-t border-beige-dark/30 pt-3 mt-3 flex items-center justify-between">
                            <span className="text-[10px] italic text-stone-charcoal/60 line-clamp-1 max-w-[150px]">
                              Vật liệu: {proj.material.split(" ")[0]}
                            </span>
                            <button
                              onClick={() => navigate({ type: "project-detail", slug: proj.slug })}
                              className="text-xs font-bold text-clay hover:text-clay-dark flex items-center gap-1 uppercase tracking-wider"
                            >
                              Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // Shorter, horizontal row/card
                    return (
                      <div 
                        key={proj.id}
                        className="bg-beige-paper/50 border border-beige-dark/40 rounded-lg overflow-hidden flex flex-row h-28 shadow-xs"
                      >
                        <div className="relative w-28 h-full overflow-hidden bg-stone-200 shrink-0">
                          <img 
                            src={proj.imageUrl} 
                            alt={proj.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3 flex flex-col justify-between flex-grow min-w-0">
                          <div>
                            <span className="text-[9px] uppercase font-mono tracking-wider font-semibold text-clay block leading-none mb-1">
                              {proj.location} • {proj.year}
                            </span>
                            <h4 
                              onClick={() => navigate({ type: "project-detail", slug: proj.slug })}
                              className="font-serif font-bold text-xs text-stone-charcoal hover:text-clay transition-colors cursor-pointer line-clamp-2 leading-snug"
                            >
                              {proj.name}
                            </h4>
                          </div>
                          <div className="border-t border-beige-dark/15 pt-1 mt-1 flex justify-between items-center text-[10px]">
                            <span className="text-[9px] italic text-stone-charcoal/50 truncate max-w-[110px]">
                              {proj.material.split(" ")[0]}
                            </span>
                            <button
                              onClick={() => navigate({ type: "project-detail", slug: proj.slug })}
                              className="font-bold text-clay flex items-center gap-0.5 uppercase tracking-wider text-[10px]"
                            >
                              Xem <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })}

                {/* View All Button aligned at the bottom right */}
                <div className="flex justify-end mt-2 px-1">
                  <button 
                    onClick={() => navigate({ type: "projects" })}
                    className="text-xs font-bold uppercase tracking-widest text-clay hover:text-clay-dark flex items-center gap-1 font-mono"
                  >
                    XEM TẤT CẢ <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </section>

            {/* Quy Trình Làm Việc (Vertical Timeline Section) */}
            <WorkProcessTimeline workProcesses={workProcesses} />

            {/* Custom CTA & FAQ Section */}
            <CtaFaqSection faqs={faqs} ctaSlides={ctaSlides} onContactClick={() => navigate({ type: "contact" })} />

            {/* Latest Posts (Bài viết mới) */}
            <section className="py-[58px] md:py-16 bg-beige-paper border-t border-beige-dark/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-10">
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-clay font-semibold">Tư Vấn Phong Thủy & Tâm Linh</span>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold mt-1 text-stone-charcoal">Tin Tức - Cẩm Nang</h3>
                  </div>
                  <button 
                    onClick={() => navigate({ type: "posts" })}
                    className="hidden sm:flex text-xs font-bold uppercase tracking-wider text-clay hover:text-clay-dark underline underline-offset-4 items-center gap-1"
                  >
                    Xem tất cả bài viết <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Desktop layout: Grid layout */}
                <div className="hidden sm:grid grid-cols-1 md:grid-cols-3 gap-8">
                  {homepageData.posts.map((post) => (
                    <div 
                      key={post.id}
                      className="bg-beige border border-beige-dark/30 rounded-sm overflow-hidden group cursor-pointer"
                      onClick={() => navigate({ type: "post-detail", slug: post.slug })}
                    >
                      <div className="relative aspect-video overflow-hidden bg-stone-100">
                        <img 
                          src={post.imageUrl} 
                          alt={post.name} 
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-3 text-[10px] text-stone-charcoal/60 font-mono mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {post.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {post.readTime}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-stone-charcoal group-hover:text-clay transition-colors line-clamp-2 leading-snug">
                          {post.name}
                        </h4>
                        <p className="text-xs text-stone-charcoal/70 font-sans mt-2 line-clamp-2 leading-relaxed">
                          {post.shortDescription}
                        </p>
                        <span className="text-xs font-bold text-clay mt-4 inline-block group-hover:underline">
                          Đọc tiếp →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile layout: Mixed vertical-horizontal stack matching wireframe */}
                <div className="block sm:hidden flex flex-col gap-4">
                  {homepageData.posts.slice(0, 3).map((post, idx) => {
                    if (idx === 0) {
                      // First item: Taller/large card
                      return (
                        <div 
                          key={post.id}
                          className="bg-beige border border-beige-dark/30 rounded-lg overflow-hidden flex flex-col shadow-xs"
                          onClick={() => navigate({ type: "post-detail", slug: post.slug })}
                        >
                          <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                            <img 
                              src={post.imageUrl} 
                              alt={post.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <div className="flex items-center gap-3 text-[10px] text-stone-charcoal/60 font-mono mb-2">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {post.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {post.readTime}
                              </span>
                            </div>
                            <h4 className="font-serif font-bold text-base text-stone-charcoal line-clamp-2 leading-snug">
                              {post.name}
                            </h4>
                            <p className="text-xs text-stone-charcoal/70 font-sans mt-2 line-clamp-2 leading-relaxed">
                              {post.shortDescription}
                            </p>
                            <span className="text-[11px] font-bold text-clay mt-3 inline-block uppercase tracking-wider">
                              Đọc tiếp →
                            </span>
                          </div>
                        </div>
                      );
                    } else {
                      // Second & Third items: Shorter horizontal row/card
                      return (
                        <div 
                          key={post.id}
                          className="bg-beige border border-beige-dark/30 rounded-lg overflow-hidden flex flex-row h-28 shadow-xs"
                          onClick={() => navigate({ type: "post-detail", slug: post.slug })}
                        >
                          <div className="relative w-28 h-full overflow-hidden bg-stone-100 shrink-0">
                            <img 
                              src={post.imageUrl} 
                              alt={post.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-3 flex flex-col justify-between flex-grow min-w-0">
                            <div>
                              <div className="flex items-center gap-2 text-[9px] text-stone-charcoal/50 font-mono leading-none mb-1">
                                <span className="flex items-center gap-0.5">
                                  <Calendar className="w-2.5 h-2.5" /> {post.date}
                                </span>
                              </div>
                              <h4 className="font-serif font-bold text-xs text-stone-charcoal line-clamp-2 leading-snug">
                                {post.name}
                              </h4>
                            </div>
                            <div className="flex justify-between items-center text-[10px] mt-1 pt-1 border-t border-beige-dark/15">
                              <span className="text-[9px] font-mono text-stone-charcoal/50">
                                {post.readTime}
                              </span>
                              <span className="font-bold text-clay uppercase tracking-wider text-[10px]">
                                Đọc tiếp →
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })}

                  {/* View All Button aligned at the bottom right */}
                  <div className="flex justify-end mt-2 px-1">
                    <button 
                      onClick={() => navigate({ type: "posts" })}
                      className="text-xs font-bold uppercase tracking-widest text-clay hover:text-clay-dark flex items-center gap-1 font-mono"
                    >
                      XEM TẤT CẢ <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Contact Hotline Section */}
            <section className="py-[58px] md:py-16 bg-clay text-beige">
              <div className="max-w-4xl mx-auto text-center px-4">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold mb-4">
                  {siteSettings?.hotline_title || "Quý Khách Cần Tư Vấn Thiết Kế Mẫu Bia Mộ Đá?"}
                </h3>
                <p className="text-sm max-w-2xl mx-auto mb-8 opacity-90 font-sans leading-relaxed whitespace-pre-line">
                  {siteSettings?.hotline_subtitle || "Đội ngũ thiết kế hỗ trợ tư vấn phong thủy Lỗ Ban, chạm hoa sen, rồng chầu, mạ vàng 24K miễn phí. Cung cấp báo giá xưởng tối ưu nhất, vận chuyển toàn quốc."}
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <a 
                    href={`tel:${(siteSettings?.hotline_phone || "0987654321").replace(/\D/g, "")}`}
                    className="px-8 py-4 bg-beige text-clay hover:bg-beige-paper text-sm font-bold uppercase tracking-widest rounded-sm transition-all shadow-md flex items-center gap-2.5"
                  >
                    <Phone className="w-4.5 h-4.5 text-clay animate-bounce" />
                    Gọi Ngay: {siteSettings?.hotline_phone || "0987.654.321"}
                  </a>
                  <a 
                    href={zaloLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 bg-[#0068FF] hover:bg-[#0054cc] text-white text-sm font-bold uppercase tracking-widest rounded-sm transition-all shadow-md flex items-center justify-center gap-2.5"
                  >
                    <img 
                      src="https://images.langmodaquangtri.com/momo/icon2/Logo-Zalo-Arc.webp" 
                      alt="Zalo" 
                      className="w-5 h-5 rounded-full object-cover bg-white shrink-0"
                    />
                    Nhắn Tin Zalo
                  </a>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW: PRODUCTS LIST & CATEGORY FILTER  */}
        {/* ======================================= */}
        {currentView.type === "products" && (
          <div className="py-[43px] md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="border-b border-beige-dark pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span 
                  onClick={() => navigate({ type: "home" })}
                  className="text-xs text-stone-charcoal/60 hover:text-clay cursor-pointer uppercase font-mono tracking-wider"
                >
                  Trang chủ
                </span>
                <span className="text-xs text-stone-charcoal/40 mx-2">/</span>
                <span className="text-xs text-clay font-bold uppercase font-mono tracking-wider">
                  {currentView.categorySlug ? "Danh mục sản phẩm" : "Tất cả sản phẩm"}
                </span>
                
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-charcoal mt-1">
                  {activeCategory ? activeCategory.name : "Sản Phẩm Chế Tác Đá Mỹ Nghệ"}
                </h2>
                {activeCategory && (
                  <p className="text-sm text-stone-charcoal/70 mt-1.5 max-w-2xl font-sans italic">
                    {activeCategory.description}
                  </p>
                )}
              </div>

              {/* Dynamic Live Search Bar */}
              <div className="relative max-w-xs w-full">
                <input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-beige-paper border border-beige-dark/70 focus:border-clay/70 text-sm py-2 pl-9 pr-4 rounded-sm focus:outline-none"
                />
                <Search className="w-4 h-4 text-stone-charcoal/40 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Main Products Grid Structure */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Mobile Filter Toggle Button */}
              <div className="block lg:hidden col-span-1">
                <button
                  onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                  className="w-full flex items-center justify-center gap-2 bg-clay text-beige py-3 px-4 rounded-sm font-semibold uppercase text-xs tracking-wider transition-colors hover:bg-clay-dark shadow-xs"
                >
                  <Sliders className="w-4 h-4" />
                  {showFiltersMobile ? "Thu gọn bộ lọc" : "Mở bộ lọc & Phân loại"}
                </button>
              </div>

              {/* Sidebar filter column */}
              <aside className={`${showFiltersMobile ? "block" : "hidden"} lg:block lg:col-span-3 space-y-6`}>
                <div className="bg-beige-paper/50 border border-beige-dark/50 p-5 rounded-sm">
                  <h4 className="font-serif font-bold text-base text-stone-charcoal border-b border-beige-dark pb-3 mb-4 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-clay" /> Phân loại dòng đá
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      <button
                        onClick={() => {
                          setSelectedCategory("all");
                          navigate({ type: "products" });
                          setActiveCategory(null);
                          if (window.innerWidth < 1024) setShowFiltersMobile(false);
                        }}
                        className={`w-full text-left text-sm py-1.5 px-2.5 rounded-xs transition-colors ${
                          selectedCategory === "all" 
                            ? "bg-clay text-beige font-semibold" 
                            : "text-stone-charcoal/80 hover:bg-beige-paper"
                        }`}
                      >
                        Tất Cả Sản Phẩm
                      </button>
                    </li>
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <button
                          onClick={() => {
                            setSelectedCategory(cat.slug);
                            navigate({ type: "products", categorySlug: cat.slug });
                            if (window.innerWidth < 1024) setShowFiltersMobile(false);
                          }}
                          className={`w-full text-left text-sm py-1.5 px-2.5 rounded-xs transition-colors ${
                            selectedCategory === cat.slug 
                              ? "bg-clay text-beige font-semibold" 
                              : "text-stone-charcoal/80 hover:bg-beige-paper"
                          }`}
                        >
                          {cat.name.split(" (")[0]}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bộ lọc theo mức giá */}
                <div className="bg-beige-paper/50 border border-beige-dark/50 p-5 rounded-sm">
                  <h4 className="font-serif font-bold text-base text-stone-charcoal border-b border-beige-dark pb-3 mb-4 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-clay" /> Khoảng giá chế tác
                  </h4>
                  <ul className="space-y-2">
                    {[
                      { id: "all", label: "Tất cả mức giá" },
                      { id: "under-10m", label: "Dưới 10 triệu" },
                      { id: "10m-20m", label: "10 triệu - 20 triệu" },
                      { id: "20m-50m", label: "20 triệu - 50 triệu" },
                      { id: "over-50m", label: "Trên 50 triệu" },
                      { id: "quote", label: "Liên hệ báo giá" },
                    ].map((range) => (
                      <li key={range.id}>
                        <button
                          onClick={() => {
                            setPriceFilter(range.id);
                            if (window.innerWidth < 1024) setShowFiltersMobile(false);
                          }}
                          className={`w-full text-left text-xs py-1.5 px-2.5 rounded-xs transition-all flex items-center justify-between ${
                            priceFilter === range.id
                              ? "bg-clay text-beige font-semibold"
                              : "text-stone-charcoal/85 hover:bg-beige-paper"
                          }`}
                        >
                          <span>{range.label}</span>
                          {priceFilter === range.id && (
                            <span className="w-1.5 h-1.5 bg-beige rounded-full"></span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-clay-light/40 border border-clay/10 p-5 rounded-sm">
                  <h4 className="font-serif font-bold text-sm text-clay-dark mb-2">Hỗ Trợ Thiết Kế 2D</h4>
                  <p className="text-xs text-stone-charcoal/80 font-sans leading-relaxed">
                    Xưởng LĂNG MỘ ĐÁ QUẢNG TRỊ nhận đo đạc trực tiếp, thiết kế bản vẽ mô phỏng 2D/3D chuẩn cung số Lỗ Ban miễn phí hoàn toàn.
                  </p>
                  <button
                    onClick={() => navigate({ type: "contact" })}
                    className="mt-3.5 w-full py-2 bg-clay text-white text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-clay-dark transition-all text-center block"
                  >
                    Gửi yêu cầu tư vấn
                  </button>
                </div>
              </aside>

              {/* Products Display list */}
              <div className="lg:col-span-9">
                {/* Header bar with count and sorting */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-beige-paper/40 border border-beige-dark/30 px-4 py-3 rounded-sm mb-6 gap-3">
                  <div className="text-xs text-stone-charcoal/80 font-medium">
                    Hiển thị <span className="font-bold text-clay">{getFilteredProducts().length}</span> sản phẩm phù hợp
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-charcoal/60">Sắp xếp:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-white border border-beige-dark/70 text-xs py-1 px-2 focus:outline-none focus:border-clay rounded-xs text-stone-charcoal"
                    >
                      <option value="default">Mặc định</option>
                      <option value="price-asc">Giá: Thấp đến Cao</option>
                      <option value="price-desc">Giá: Cao đến Thấp</option>
                      <option value="name-asc">Tên sản phẩm: A - Z</option>
                    </select>
                  </div>
                </div>

                {getFilteredProducts().length === 0 ? (
                  <div className="text-center py-16 bg-beige-paper/30 border border-beige-dark/30 rounded-sm">
                    <Search className="w-12 h-12 text-stone-charcoal/30 mx-auto mb-3" />
                    <h4 className="font-serif font-bold text-lg text-stone-charcoal mb-1">Không tìm thấy sản phẩm phù hợp</h4>
                    <p className="text-xs text-stone-charcoal/60 font-sans">Quý khách vui lòng thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.</p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("all");
                        setPriceFilter("all");
                        setSortBy("default");
                        navigate({ type: "products" });
                        setActiveCategory(null);
                      }}
                      className="mt-4 px-4 py-2 bg-clay text-white text-xs uppercase tracking-wider font-semibold rounded-xs"
                    >
                      Xóa bộ lọc tìm kiếm
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6">
                    {getFilteredProducts().map((prod) => (
                      <div 
                        key={prod.id}
                        onClick={() => navigate({ type: "product-detail", slug: prod.slug })}
                        className="bg-beige border border-beige-dark/40 rounded-sm overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer"
                      >
                        <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                          <img 
                            src={prod.imageUrl} 
                            alt={prod.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2.5 left-2.5 bg-clay text-beige text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-xs">
                            {prod.categoryName.split(" (")[0]}
                          </div>
                        </div>
                        
                        <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-1 text-bronze mb-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                              <span className="text-[10px] text-stone-charcoal/50 ml-1">({prod.rating})</span>
                            </div>
                            
                            <h4 
                              onClick={() => navigate({ type: "product-detail", slug: prod.slug })}
                              className="font-serif font-bold text-xs sm:text-sm text-stone-charcoal hover:text-clay transition-colors cursor-pointer line-clamp-2 leading-tight"
                            >
                              {prod.name}
                            </h4>
                            
                            <p className="text-[11px] sm:text-xs text-stone-charcoal/70 font-sans mt-1 line-clamp-2 leading-relaxed">
                              {prod.shortDescription}
                            </p>
                          </div>

                          <div className="border-t border-beige-dark/40 pt-2 flex flex-col xs:flex-row justify-between items-start xs:items-center mt-auto gap-2">
                            <div>
                              <span className="text-[9px] uppercase text-stone-charcoal/50 block font-mono leading-none">Giá chỉ từ</span>
                              <span className="text-xs sm:text-sm font-semibold text-clay leading-tight">{prod.priceStr}</span>
                            </div>
                            <button
                              onClick={() => navigate({ type: "product-detail", slug: prod.slug })}
                              className="w-full xs:w-auto text-center px-2 py-1 bg-beige-paper text-stone-charcoal hover:bg-clay hover:text-white border border-bronze/30 text-[10px] sm:text-[11px] font-semibold transition-all rounded-xs"
                            >
                              Xem Mẫu
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW: PRODUCT DETAIL                    */}
        {/* ======================================= */}
        {currentView.type === "product-detail" && (
          <div className="py-[43px] md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {activeProduct ? (
              <div>
                {/* Breadcrumb row */}
                <div className="flex items-center gap-2 mb-6 text-xs text-stone-charcoal/60">
                  <span onClick={() => navigate({ type: "home" })} className="hover:text-clay cursor-pointer">Trang chủ</span>
                  <span>/</span>
                  <span onClick={() => navigate({ type: "products" })} className="hover:text-clay cursor-pointer">Sản phẩm</span>
                  <span>/</span>
                  <span onClick={() => navigate({ type: "products", categorySlug: activeProduct.categorySlug })} className="hover:text-clay cursor-pointer">{activeProduct.categoryName}</span>
                  <span>/</span>
                  <span className="text-clay font-semibold line-clamp-1">{activeProduct.name}</span>
                </div>

                {/* Back button */}
                <button
                  onClick={() => navigate({ type: "products" })}
                  className="mb-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-charcoal hover:text-clay"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại danh sách sản phẩm
                </button>

                {/* Two Column Layout: Image & Ordering specs */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                  
                  {/* Left Column: Image with traditional frame */}
                  <div className="lg:col-span-6">
                    <div className="border border-bronze p-2 rounded-xs bg-beige-paper/50">
                      <div className="aspect-[4/3] bg-stone-100 overflow-hidden relative">
                        <img 
                          src={selectedImage || activeProduct.imageUrl} 
                          alt={activeProduct.name} 
                          className="w-full h-full object-cover transition-all duration-300"
                        />
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      <button 
                        onClick={() => setSelectedImage(activeProduct.imageUrl)}
                        className={`aspect-[4/3] bg-stone-200 border cursor-pointer overflow-hidden transition-all duration-300 ${
                          (!selectedImage || selectedImage === activeProduct.imageUrl)
                            ? "border-red-clay scale-[1.02] opacity-100 shadow-sm"
                            : "border-bronze/20 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={activeProduct.imageUrl} alt="Detail" className="w-full h-full object-cover" />
                      </button>
                      {activeProduct.images && activeProduct.images.length > 0 ? (
                        activeProduct.images.map((imgUrl, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(imgUrl)}
                            className={`aspect-[4/3] bg-stone-200 border cursor-pointer overflow-hidden transition-all duration-300 ${
                              selectedImage === imgUrl
                                ? "border-red-clay scale-[1.02] opacity-100 shadow-sm"
                                : "border-bronze/20 opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img src={imgUrl} alt={`Detail ${index + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))
                      ) : (
                        <>
                          <div className="aspect-[4/3] bg-stone-100 border border-bronze/10 flex items-center justify-center text-[10px] text-stone-charcoal/50 font-serif p-1 text-center">
                            Phôi Đá Đẹp
                          </div>
                          <div className="aspect-[4/3] bg-stone-100 border border-bronze/10 flex items-center justify-center text-[10px] text-stone-charcoal/50 font-serif p-1 text-center">
                            Mạ Vàng 24K
                          </div>
                          <div className="aspect-[4/3] bg-stone-100 border border-bronze/10 flex items-center justify-center text-[10px] text-stone-charcoal/50 font-serif p-1 text-center">
                            Chuẩn Lỗ Ban
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Order Specs */}
                  <div className="lg:col-span-6 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-widest text-clay font-semibold bg-clay-light px-2.5 py-1 rounded-xs inline-block mb-3">
                        {activeProduct.categoryName}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-charcoal leading-tight mb-2">
                        {activeProduct.name}
                      </h2>
                      
                      <div className="flex items-center gap-4 my-3 border-b border-beige-dark/60 pb-3">
                        <div className="flex items-center gap-0.5 text-bronze">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4.5 h-4.5 fill-current" />
                          ))}
                        </div>
                        <span className="text-xs text-stone-charcoal/60 font-sans">
                          Đánh giá tuyệt đối 5/5 dựa trên phản hồi khách hàng thực tế
                        </span>
                      </div>

                      <div className="bg-beige-paper p-4 rounded-xs border border-beige-dark/60 mb-5">
                        <span className="text-xs uppercase text-stone-charcoal/60 block font-mono mb-1">Giá xưởng chế tác dao động từ:</span>
                        <span className="text-2xl sm:text-3xl font-bold text-clay font-mono">{activeProduct.priceStr}</span>
                        <span className="text-xs text-stone-charcoal/50 block mt-1">(* Giá thay đổi phụ thuộc vào kích thước bia và yêu cầu mạ nhũ/vàng lá)</span>
                      </div>

                      <p className="text-sm text-stone-charcoal/85 font-sans leading-relaxed mb-6">
                        {activeProduct.shortDescription}
                      </p>

                      {activeProduct.commitments && activeProduct.commitments.length > 0 && (
                        <div className="space-y-2 border-t border-beige-dark/60 pt-4 mb-6">
                          {activeProduct.commitments.map((commitment, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-stone-charcoal/80">
                              <CheckCircle2 className="w-4.5 h-4.5 text-clay shrink-0" />
                              <span>{commitment}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => navigate({ type: "contact", productSlug: activeProduct.slug })}
                        className="flex-1 py-3 bg-clay text-beige hover:bg-clay-dark font-bold text-xs uppercase tracking-widest rounded-sm text-center shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <Heart className="w-4 h-4 text-bronze" /> Yêu Cầu Chế Tác Riêng
                      </button>
                      <a
                        href="tel:0987654321"
                        className="py-3 px-6 border border-clay text-clay hover:bg-clay-light font-bold text-xs uppercase tracking-widest rounded-sm text-center transition-all flex items-center justify-center gap-2"
                      >
                        <Phone className="w-4 h-4 text-clay" /> Gọi 0987.654.321
                      </a>
                    </div>
                  </div>
                </div>

                {/* Additional detailed descriptions & Specs Tabs */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-beige-dark/60 pt-10">
                  
                  {/* Left Specs side */}
                  <div className="lg:col-span-7">
                    <h3 className="font-serif font-bold text-xl text-stone-charcoal border-b border-clay/30 pb-3 mb-4">
                      Thông Tin Chi Tiết Sản Phẩm
                    </h3>
                    <p className="text-sm text-stone-charcoal/80 font-sans leading-relaxed mb-6 whitespace-pre-line">
                      {activeProduct.description}
                    </p>

                    <h4 className="font-serif font-bold text-base text-stone-charcoal mb-3">Đặc điểm nổi trội từ Xưởng Tâm An:</h4>
                    <ul className="space-y-2 mb-6">
                      {activeProduct.features.map((feat, idx) => (
                        <li key={idx} className="text-xs text-stone-charcoal/80 font-sans flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-clay shrink-0 mt-1.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right specifications block */}
                  <div className="lg:col-span-5 bg-beige-paper p-6 rounded-sm border border-beige-dark/40">
                    <h3 className="font-serif font-bold text-base text-stone-charcoal border-b border-beige-dark pb-3 mb-4">
                      Thông số Kỹ thuật & Thiết kế
                    </h3>
                    <div className="space-y-3">
                      {activeProduct.specifications.map((spec, index) => (
                        <div key={index} className="flex justify-between border-b border-beige-dark/40 pb-2 text-xs">
                          <span className="font-medium text-stone-charcoal/60">{spec.key}</span>
                          <span className="font-semibold text-stone-charcoal text-right max-w-[200px]">{spec.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 bg-clay-light/50 p-4 border border-clay/20 text-xs text-clay-dark rounded-xs">
                      <h4 className="font-bold mb-1">Mách nhỏ phong thủy:</h4>
                      <p className="font-sans leading-relaxed">
                        {activeProduct.fengshuiTip || "Theo chuẩn thước lỗ ban âm phần, kích thước 30x40cm hay 40x60cm mang các cung đại cát phú quý, mang hưng thịnh cho con cháu dòng họ. Hãy kết hợp chạm nổi hoa văn sen đầm phong thủy để tối ưu may mắn, cát khí."}
                      </p>
                    </div>

                    {getYoutubeEmbedId(activeProduct.videoUrl) && (
                      <div className="mt-6">
                        <h4 className="font-serif font-bold text-sm text-stone-charcoal mb-2">Video Giới Thiệu</h4>
                        <div className="aspect-video border border-bronze/30 rounded-xs overflow-hidden">
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${getYoutubeEmbedId(activeProduct.videoUrl)}`}
                            title={`Video giới thiệu ${activeProduct.name}`}
                            className="w-full h-full"
                            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                            sandbox="allow-scripts allow-same-origin allow-presentation"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Related Products Section */}
                <div className="mt-16 border-t border-beige-dark/60 pt-12">
                  <h3 className="font-serif font-bold text-xl text-stone-charcoal mb-8 text-center sm:text-left">
                    Sản Phẩm Cùng Phân Khúc Đá Chế Tác
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allProducts
                      .filter(p => p.categorySlug === activeProduct.categorySlug && p.id !== activeProduct.id)
                      .slice(0, 3)
                      .map((prod) => (
                        <div 
                          key={prod.id}
                          onClick={() => navigate({ type: "product-detail", slug: prod.slug })}
                          className="bg-beige border border-beige-dark/30 rounded-sm overflow-hidden group hover:shadow-md transition-all duration-300 cursor-pointer"
                        >
                          <div className="aspect-[4/3] bg-stone-100 overflow-hidden relative">
                            <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                          <div className="p-4 flex flex-col justify-between h-[180px]">
                            <div>
                              <h4 
                                onClick={() => navigate({ type: "product-detail", slug: prod.slug })}
                                className="font-serif font-bold text-sm text-stone-charcoal hover:text-clay cursor-pointer line-clamp-2"
                              >
                                {prod.name}
                              </h4>
                              <p className="text-xs text-stone-charcoal/60 font-sans mt-1 line-clamp-2">{prod.shortDescription}</p>
                            </div>
                            <div className="flex justify-between items-center mt-3 border-t border-beige-dark/30 pt-2">
                              <span className="text-xs font-semibold text-clay">{prod.priceStr}</span>
                              <button
                                onClick={() => navigate({ type: "product-detail", slug: prod.slug })}
                                className="text-xs font-bold text-clay hover:underline"
                              >
                                Xem Chi Tiết
                              </button>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="font-serif text-xl text-stone-charcoal">Rất tiếc! Mẫu bia mộ này không còn hoạt động hoặc đang cập nhật thông tin.</h3>
                <button onClick={() => navigate({ type: "products" })} className="mt-4 px-4 py-2 bg-clay text-beige text-xs uppercase font-semibold">
                  Quay lại danh sách sản phẩm
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW: PROJECTS (DANH SÁCH CÔNG TRÌNH)   */}
        {/* ======================================= */}
        {currentView.type === "projects" && (
          <div className="py-[43px] md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="border-b border-beige-dark pb-6 mb-10 text-center sm:text-left">
              <span onClick={() => navigate({ type: "home" })} className="text-xs text-stone-charcoal/60 hover:text-clay cursor-pointer uppercase font-mono tracking-wider">Trang chủ</span>
              <span className="text-xs text-stone-charcoal/40 mx-2">/</span>
              <span className="text-xs text-clay font-bold uppercase font-mono tracking-wider">Công trình thực tế</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-charcoal mt-1">Dự Án Điêu Khắc Đá Tiêu Biểu</h2>
              <p className="text-sm text-stone-charcoal/70 mt-1 max-w-2xl font-sans">
                Tổng hợp các công trình phục dựng bia di tích quốc gia, quy hoạch lăng mộ gia đình, và bia liệt sĩ tâm linh do LĂNG MỘ ĐÁ QUẢNG TRỊ trực tiếp gia công chế tác và lắp dựng hoàn chỉnh.
              </p>
            </div>

            <div className="space-y-12">
              {projects.map((proj, idx) => (
                <div 
                  key={proj.id}
                  className={`flex flex-col lg:flex-row gap-8 items-center border border-beige-dark/40 bg-beige-paper/30 p-6 rounded-sm hover:shadow-md transition-shadow ${
                    idx % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Visual Frame */}
                  <div className="w-full lg:w-1/2 aspect-video bg-stone-200 overflow-hidden rounded-xs border border-bronze/20">
                    <img 
                      src={proj.imageUrl} 
                      alt={proj.name} 
                      className="w-full h-full object-cover hover:scale-102 transition-transform duration-500"
                    />
                  </div>

                  {/* Descriptions block */}
                  <div className="w-full lg:w-1/2 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2.5 mb-3 text-xs font-mono">
                        <span className="bg-clay-light text-clay px-2.5 py-0.5 rounded-xs font-semibold">{proj.location}</span>
                        <span className="bg-beige-paper border border-beige-dark px-2.5 py-0.5 rounded-xs text-stone-charcoal/70">Năm: {proj.year}</span>
                      </div>
                      <h3 
                        onClick={() => navigate({ type: "project-detail", slug: proj.slug })}
                        className="font-serif font-bold text-xl sm:text-2xl text-stone-charcoal hover:text-clay transition-colors cursor-pointer"
                      >
                        {proj.name}
                      </h3>
                      <p className="text-sm text-stone-charcoal/80 font-sans mt-3.5 leading-relaxed">
                        {proj.shortDescription}
                      </p>
                      
                      <div className="mt-4 border-t border-beige-dark/50 pt-4">
                        <span className="text-xs font-semibold text-stone-charcoal block mb-1">Dòng vật liệu chính:</span>
                        <span className="text-xs text-clay italic font-mono">{proj.material}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate({ type: "project-detail", slug: proj.slug })}
                      className="mt-6 self-start px-5 py-2.5 bg-clay hover:bg-clay-dark text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors flex items-center gap-1.5"
                    >
                      Xem chi tiết dự án <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW: PROJECT DETAIL                    */}
        {/* ======================================= */}
        {currentView.type === "project-detail" && (
          <div className="py-[43px] md:py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {activeProject ? (
              <div>
                <div className="flex items-center gap-2 mb-6 text-xs text-stone-charcoal/60">
                  <span onClick={() => navigate({ type: "home" })} className="hover:text-clay cursor-pointer">Trang chủ</span>
                  <span>/</span>
                  <span onClick={() => navigate({ type: "projects" })} className="hover:text-clay cursor-pointer">Công trình</span>
                  <span>/</span>
                  <span className="text-clay font-semibold line-clamp-1">{activeProject.name}</span>
                </div>

                <button
                  onClick={() => navigate({ type: "projects" })}
                  className="mb-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-charcoal hover:text-clay"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại danh sách công trình
                </button>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-charcoal leading-tight mb-4">
                  {activeProject.name}
                </h2>

                <div className="flex flex-wrap gap-4 text-xs font-mono text-stone-charcoal/60 border-b border-beige-dark pb-4 mb-6">
                  <span>Địa điểm: <strong className="text-stone-charcoal font-semibold">{activeProject.location}</strong></span>
                  <span>|</span>
                  <span>Năm hoàn thành: <strong className="text-stone-charcoal font-semibold">{activeProject.year}</strong></span>
                  <span>|</span>
                  <span>Chất đá chính: <strong className="text-clay font-semibold">{activeProject.material}</strong></span>
                </div>

                <div className="border border-bronze p-2 rounded-xs bg-beige-paper/40 mb-8">
                  <div className="aspect-[16/9] overflow-hidden bg-stone-200">
                    <img src={activeProject.imageUrl} alt={activeProject.name} className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  <div className="md:col-span-8">
                    <h3 className="font-serif font-bold text-lg text-stone-charcoal border-b border-clay/30 pb-2 mb-3">
                      Tổng quan về quá trình thi công
                    </h3>
                    <p className="text-sm text-stone-charcoal/80 font-sans leading-relaxed whitespace-pre-line">
                      {activeProject.description}
                    </p>
                  </div>

                  <div className="md:col-span-4 bg-beige-paper p-5 border border-beige-dark/50 rounded-sm">
                    <h3 className="font-serif font-bold text-base text-stone-charcoal border-b border-beige-dark pb-2 mb-3">
                      Hạng mục triển khai
                    </h3>
                    <ul className="space-y-3">
                      {activeProject.scope.map((step, index) => (
                        <li key={index} className="text-xs text-stone-charcoal/85 leading-relaxed flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-clay text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {activeProject.images && activeProject.images.length > 0 && (
                  <div className="mt-12">
                    <h3 className="font-serif font-bold text-lg text-stone-charcoal border-b border-clay/30 pb-2 mb-4">
                      Hình ảnh thực tế từ công trình
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {activeProject.images.map((imgUrl, index) => (
                        <div key={index} className="aspect-[4/3] overflow-hidden rounded-xs border border-beige-dark/50 bg-stone-100 hover:shadow-md transition-shadow group">
                          <img 
                            src={imgUrl} 
                            alt={`${activeProject.name} - ảnh thực tế ${index + 1}`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-zoom-in" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Consultation prompt */}
                <div className="mt-12 bg-clay-light/60 p-6 border border-clay/15 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h4 className="font-serif font-bold text-base text-clay-dark mb-1">Quý khách mong muốn có một lăng mộ tương tự cho gia tộc?</h4>
                    <p className="text-xs text-stone-charcoal/70">Liên hệ trực tiếp để nghệ nhân của chúng tôi khảo sát và lên thiết kế độc bản miễn phí.</p>
                  </div>
                  <button
                    onClick={() => navigate({ type: "contact" })}
                    className="px-6 py-2.5 bg-clay hover:bg-clay-dark text-white text-xs font-semibold uppercase tracking-wider rounded-xs whitespace-nowrap"
                  >
                    Đăng Ký Tư Vấn Điêu Khắc
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="font-serif text-xl text-stone-charcoal">Đang tải thông tin chi tiết dự án công trình...</h3>
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW: POSTS (TIN TỨC - CẨM NANG)        */}
        {/* ======================================= */}
        {currentView.type === "posts" && (() => {
          const catMap: { [key: string]: string } = {
            knowledge: "Kiến thức",
            consulting: "Tư vấn",
            news: "Tin tức",
            feng_shui: "Phong thủy"
          };
          const filterSlug = currentView.categorySlug;
          const filteredPosts = filterSlug ? posts.filter(p => p.category === filterSlug) : posts;
          const categoryName = filterSlug ? catMap[filterSlug] || filterSlug : "Tất cả bài viết";
          
          return (
            <div className="py-[43px] md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="border-b border-beige-dark pb-6 mb-10 text-center sm:text-left">
                <span onClick={() => navigate({ type: "home" })} className="text-xs text-stone-charcoal/60 hover:text-clay cursor-pointer uppercase font-mono tracking-wider">Trang chủ</span>
                <span className="text-xs text-stone-charcoal/40 mx-2">/</span>
                <span onClick={() => navigate({ type: "posts" })} className="text-xs text-stone-charcoal/60 hover:text-clay cursor-pointer uppercase font-mono tracking-wider">Bài viết</span>
                {filterSlug && (
                  <>
                    <span className="text-xs text-stone-charcoal/40 mx-2">/</span>
                    <span className="text-xs text-clay font-bold uppercase font-mono tracking-wider">{categoryName}</span>
                  </>
                )}
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-charcoal mt-1">
                  {filterSlug ? `Chuyên Mục: ${categoryName}` : "Tư Vấn Phong Thủy & Ý Nghĩa Tâm Linh"}
                </h2>
                <p className="text-sm text-stone-charcoal/70 mt-1 max-w-2xl font-sans">
                  {filterSlug 
                    ? `Danh sách các bài viết, tư vấn chia sẻ thông tin hữu ích thuộc chuyên mục ${categoryName}.`
                    : "Kênh chia sẻ kiến thức hữu ích về cách chọn kích thước bia mộ chuẩn phong thủy Lỗ Ban, so sánh các dòng đá tạc mỹ nghệ và giải mã các mẫu họa tiết chạm khắc cổ điển."}
                </p>
              </div>

              {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPosts.map((post) => (
                    <div 
                      key={post.id}
                      className="bg-beige-paper/30 border border-beige-dark/30 rounded-sm overflow-hidden group cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate({ type: "post-detail", slug: post.slug })}
                    >
                      <div className="aspect-video bg-stone-100 overflow-hidden relative">
                        <img src={post.imageUrl} alt={post.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-3 text-[10px] text-stone-charcoal/50 font-mono mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {post.date}
                          </span>
                          <span>•</span>
                          <span>{post.readTime}</span>
                          {post.category && (
                            <>
                              <span>•</span>
                              <span className="text-clay font-semibold uppercase">{catMap[post.category] || post.category}</span>
                            </>
                          )}
                        </div>
                        <h3 className="font-serif font-bold text-base text-stone-charcoal group-hover:text-clay transition-colors line-clamp-2">
                          {post.name}
                        </h3>
                        <p className="text-xs text-stone-charcoal/70 font-sans mt-2 line-clamp-3 leading-relaxed">
                          {post.shortDescription}
                        </p>
                        <span className="text-xs font-bold text-clay mt-4 inline-block hover:underline">
                          Đọc toàn bộ bài viết →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-beige-paper/20 border border-dashed border-beige-dark/30 rounded-sm">
                  <p className="text-stone-charcoal/60 font-serif italic">Hiện tại chuyên mục này chưa có bài viết nào.</p>
                  <button 
                    onClick={() => navigate({ type: "posts" })}
                    className="mt-4 px-6 py-2 bg-clay text-white text-xs font-semibold uppercase tracking-wider rounded-xs"
                  >
                    Xem tất cả bài viết
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* ======================================= */}
        {/* VIEW: POST DETAIL                       */}
        {/* ======================================= */}
        {currentView.type === "post-detail" && (
          <div className="py-[43px] md:py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {activePost ? (
              <article>
                <div className="flex items-center gap-2 mb-6 text-xs text-stone-charcoal/60">
                  <span onClick={() => navigate({ type: "home" })} className="hover:text-clay cursor-pointer">Trang chủ</span>
                  <span>/</span>
                  <span onClick={() => navigate({ type: "posts" })} className="hover:text-clay cursor-pointer">Bài viết</span>
                  <span>/</span>
                  <span className="text-clay font-semibold line-clamp-1">{activePost.name}</span>
                </div>

                <button
                  onClick={() => navigate({ type: "posts" })}
                  className="mb-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-charcoal hover:text-clay"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại danh sách bài viết
                </button>

                <h1 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-stone-charcoal leading-tight mb-4">
                  {activePost.name}
                </h1>

                <div className="flex items-center gap-4 text-xs font-mono text-stone-charcoal/60 border-b border-beige-dark pb-4 mb-6">
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> Tác giả: {activePost.author}</span>
                  <span>|</span>
                  <span>Ngày đăng: {activePost.date}</span>
                  <span>|</span>
                  <span>Thời gian đọc: {activePost.readTime}</span>
                </div>

                <div className="border border-bronze p-2 rounded-xs bg-beige-paper/40 mb-8 max-h-[400px] overflow-hidden">
                  <img src={activePost.imageUrl} alt={activePost.name} className="w-full h-full object-cover rounded-xs" />
                </div>

                <div className="prose max-w-none text-stone-charcoal/90 font-sans text-sm leading-relaxed whitespace-pre-line space-y-4">
                  {activePost.content}
                </div>

                {/* Return Prompt */}
                <div className="mt-12 pt-8 border-t border-beige-dark/60 flex justify-between items-center">
                  <button 
                    onClick={() => navigate({ type: "posts" })}
                    className="text-xs font-bold text-stone-charcoal hover:text-clay uppercase tracking-wider flex items-center gap-1"
                  >
                    ← Quay lại cẩm nang
                  </button>
                  <button 
                    onClick={() => navigate({ type: "contact" })}
                    className="px-5 py-2.5 bg-clay hover:bg-clay-dark text-white text-xs uppercase tracking-wider font-semibold rounded-xs"
                  >
                    Đăng Ký Nhận Tư Vấn Phong Thủy
                  </button>
                </div>
              </article>
            ) : (
              <div className="text-center py-16">
                <h3 className="font-serif text-xl text-stone-charcoal">Đang tải nội dung bài viết cẩm nang...</h3>
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW: CONTACT (LIÊN HỆ)                 */}
        {/* ======================================= */}
        {currentView.type === "contact" && (
          <div className="py-[43px] md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="border-b border-beige-dark pb-6 mb-10 text-center">
              <span onClick={() => navigate({ type: "home" })} className="text-xs text-stone-charcoal/60 hover:text-clay cursor-pointer uppercase font-mono tracking-wider">Trang chủ</span>
              <span className="text-xs text-stone-charcoal/40 mx-2">/</span>
              <span className="text-xs text-clay font-bold uppercase font-mono tracking-wider">Liên hệ</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-charcoal mt-1">Liên Hệ Thiết Kế & Báo Giá Xưởng</h2>
              <p className="text-sm text-stone-charcoal/70 mt-1 max-w-2xl mx-auto font-sans">
                Quý khách vui lòng liên hệ qua hotline hoặc ghé thăm trực tiếp xưởng chế tác LĂNG MỘ ĐÁ QUẢNG TRỊ để nhận tư vấn thiết kế và báo giá chi tiết, nhanh chóng nhất.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              
              {/* Visual Direct hotline box */}
              <div className="bg-clay text-beige p-6 sm:p-8 rounded-sm border border-bronze/40 shadow-md flex flex-col justify-between">
                <div>
                  <h4 className="font-serif font-bold text-lg text-bronze mb-2">Đường Dây Nóng Hỗ Trợ Gấp</h4>
                  <p className="text-xs opacity-90 leading-relaxed font-sans mb-6">
                    Liên hệ ngay với quản lý xưởng tạc đá của chúng tôi để được giải đáp tức thì về giá cả, tư vấn phong thủy nhanh chóng.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <a href={`tel:${(siteSettings?.hotline_phone || "0987654321").replace(/\D/g, "")}`} className="flex items-center gap-3.5 hover:text-bronze transition-colors">
                    <div className="p-2.5 bg-clay-dark rounded-full">
                      <Phone className="w-5 h-5 text-bronze animate-bounce" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider block opacity-70">Hotline 24/7</span>
                      <strong className="text-lg font-serif tracking-wide">{siteSettings?.hotline_phone || "0987.654.321"}</strong>
                    </div>
                  </a>

                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 bg-clay-dark rounded-full">
                      <MapPin className="w-5 h-5 text-bronze" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider block opacity-70">Địa Chỉ Xưởng</span>
                      <span className="text-xs font-sans leading-snug">{siteSettings?.footer_address ? siteSettings.footer_address.split("\n")[0] : "Ninh Vân, Hoa Lư, Ninh Bình"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 bg-clay-dark rounded-full">
                      <Mail className="w-5 h-5 text-bronze" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider block opacity-70">Email Liên Hệ</span>
                      <span className="text-xs font-sans">{siteSettings?.footer_address ? siteSettings.footer_address.split("\n")[2]?.replace("Email: ", "") || "lienhe@dataman.vn" : "lienhe@dataman.vn"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google map simulation */}
              <div className="border border-beige-dark/60 bg-beige-paper p-6 sm:p-8 rounded-sm flex flex-col justify-between">
                <div>
                  <h4 className="font-serif font-bold text-lg text-stone-charcoal mb-2 border-b border-beige-dark pb-3">Bản Đồ Chỉ Đường Tới Xưởng Chế Tác</h4>
                  <p className="text-xs text-stone-charcoal/70 leading-relaxed font-sans mb-4">
                    Kính mời quý khách hàng ghé thăm trực tiếp xưởng chế tác để cảm nhận chất lượng phôi đá tự nhiên nguyên khối và sự tỉ mỉ trong từng đường chạm khắc từ nghệ nhân của chúng tôi.
                  </p>
                </div>
                <div className="aspect-video bg-stone-200 overflow-hidden rounded-xs relative flex items-center justify-center border border-bronze/10">
                  {siteSettings?.google_maps_embed_url ? (() => {
                    const embedUrl = getMapEmbedUrl(siteSettings.google_maps_embed_url);
                    return (
                      <iframe
                        src={embedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="w-full h-full"
                      />
                    );
                  })() : (
                    <>
                      {/* Simulated elegant map placeholder */}
                      <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=400&auto=format&fit=crop')" }} />
                      <div className="text-center z-10 px-4">
                        <MapPin className="w-8 h-8 text-clay mx-auto mb-1 animate-bounce" />
                        <strong className="text-xs text-stone-charcoal block">Đá Mỹ Nghệ Tâm An</strong>
                        <span className="text-[10px] text-stone-charcoal/60">
                          {siteSettings?.footer_address ? siteSettings.footer_address.split("\n")[0].replace("Địa chỉ: ", "") : "Ninh Vân, Hoa Lư, Ninh Bình"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Universal footer bar */}
      <footer className="bg-stone-charcoal text-beige border-t border-bronze/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[43px] md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8 border-b border-white/10 pb-8">
            
            {/* Column 1: Brand Info */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-clay flex items-center justify-center traditional-border">
                  <span className="font-serif font-bold text-lg text-bronze">TA</span>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg tracking-wide text-white leading-none">LĂNG MỘ ĐÁ QUẢNG TRỊ</h4>
                  <span className="text-[10px] uppercase tracking-widest text-bronze font-mono">Giao hòa truyền thống & hiện đại</span>
                </div>
              </div>
              <p className="text-xs text-beige/70 leading-relaxed font-sans max-w-sm whitespace-pre-line">
                {siteSettings?.footer_brand_description || "Chúng tôi tự hào kế thừa nét tinh hoa chạm khắc đá độc bản hàng trăm năm từ Ninh Bình. Cam kết cung cấp các sản phẩm bia mộ đá Granite, bia đá xanh tự nhiên trường tồn vĩnh cửu."}
              </p>
            </div>

            {/* Column 2: Navigation shortcuts */}
            <div className="md:col-span-2 space-y-3">
              <h5 className="font-serif font-bold text-sm text-bronze uppercase tracking-wider">Hỗ Trợ Nhanh</h5>
              <ul className="space-y-1.5 text-xs text-beige/80 font-sans">
                <li>
                  <button onClick={() => navigate({ type: "products" })} className="hover:text-bronze transition-colors text-left">
                    Danh Sách Sản Phẩm Đá
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate({ type: "projects" })} className="hover:text-bronze transition-colors text-left">
                    Các Công Trình Thực Tế
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate({ type: "posts" })} className="hover:text-bronze transition-colors text-left">
                    Cẩm Nang Phong Thủy Bia Mộ
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate({ type: "contact" })} className="hover:text-bronze transition-colors text-left">
                    Đăng Ký Tư Vấn Báo Giá
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Workshop location details */}
            <div className="md:col-span-3 space-y-3">
              <h5 className="font-serif font-bold text-sm text-bronze uppercase tracking-wider">Xưởng Chế Tác</h5>
              <p className="text-xs text-beige/80 leading-relaxed font-sans whitespace-pre-line">
                {siteSettings?.footer_address || `Địa chỉ: Làng nghề đá mỹ nghệ xã Ninh Vân, huyện Hoa Lư, tỉnh Ninh Bình.\nHotline chăm sóc khách hàng: 0987.654.321\nEmail: lienhe@dataman.vn`}
              </p>
            </div>

            {/* Column 4: Follow us (Theo dõi chúng tôi) */}
            <div className="md:col-span-3 space-y-4">
              <h5 className="font-serif font-bold text-sm text-bronze uppercase tracking-wider">Theo Dõi Chúng Tôi</h5>
              <p className="text-xs text-beige/70 leading-relaxed font-sans">
                Cập nhật các công trình lăng mộ đá mới nhất và những chia sẻ phong thủy hữu ích qua mạng xã hội của chúng tôi.
              </p>
              <div className="flex items-center gap-3 pt-1">
                {/* Facebook button */}
                <a 
                  href={siteSettings?.facebook_url || "https://facebook.com"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-[#1877F2] hover:bg-[#1877F2]/15 hover:text-[#1877F2] flex items-center justify-center text-beige transition-all duration-300"
                  title="Facebook"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                  </svg>
                </a>
                
                {/* TikTok button */}
                <a 
                  href={siteSettings?.tiktok_url || "https://tiktok.com"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-[#00f2fe] hover:bg-[#00f2fe]/10 hover:text-white flex items-center justify-center text-beige transition-all duration-300"
                  title="TikTok"
                >
                  <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.09-1.5-.77-.57-1.31-1.31-1.77-2.2v8.1c-.04 2.15-.71 4.36-2.24 5.88-1.53 1.55-3.8 2.33-5.96 2.14-2.11-.16-4.22-1.28-5.35-3.12C1.9 17.5 1.74 15.02 2.5 12.91c.78-2.18 2.76-3.89 5.04-4.24v4.09c-1.12.21-2.21.94-2.65 2.01-.44 1.05-.19 2.37.59 3.19.78.82 2.08 1.13 3.15.74 1.08-.39 1.75-1.51 1.78-2.66.02-3.1 0-6.21.01-9.31-.01-.58-.01-1.17-.01-1.71z" />
                  </svg>
                </a>

                {/* YouTube button */}
                <a 
                  href={siteSettings?.youtube_url || "https://youtube.com"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-[#FF0000] hover:bg-[#FF0000]/15 hover:text-[#FF0000] flex items-center justify-center text-beige transition-all duration-300"
                  title="YouTube"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center text-[10px] text-beige/50 font-mono tracking-wider text-center gap-4">
            <div>
              &copy; {new Date().getFullYear()} Bia Mộ Đá Mỹ Nghệ Tâm An. Bảo lưu mọi quyền thương hiệu.
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Contact Widget */}
      <div className="fixed md:bottom-6 md:right-6 bottom-4 right-4 z-50 flex flex-col gap-3 items-end">
        {/* Zalo Button */}
        <a
          href={zaloLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#0068FF] text-white rounded-full p-2.5 shadow-lg hover:shadow-xl transition-all duration-300 group hover:pr-5 cursor-pointer hover:scale-105"
          title="Nhắn tin Zalo"
        >
          <div className="w-6 h-6 flex items-center justify-center overflow-hidden rounded-full bg-white">
            <img 
              src="https://images.langmodaquangtri.com/momo/icon2/Logo-Zalo-Arc.webp" 
              alt="Zalo" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-300 ease-out font-medium text-xs whitespace-nowrap">
            Nhắn tin Zalo
          </span>
        </a>

        {/* Hotline Button */}
        <a
          href={`tel:${cleanPhone}`}
          className="flex items-center gap-2 bg-emerald-500 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 group hover:pr-5 cursor-pointer hover:scale-105"
          title="Gọi hotline"
        >
          <div className="w-5 h-5 flex items-center justify-center relative">
            <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-20 animate-ping"></span>
            <Phone className="w-5 h-5" />
          </div>
          <span className="max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-300 ease-out font-medium text-xs whitespace-nowrap font-sans">
            Gọi hotline
          </span>
        </a>
      </div>
    </div>
  );
}
