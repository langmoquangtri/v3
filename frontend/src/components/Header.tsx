import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Phone, Heart, MapPin, Sparkles, ChevronDown } from "lucide-react";
import { ViewType, Category } from "../types";

interface HeaderProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  categories?: Category[];
}

export default function Header({ currentView, onNavigate, categories }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine if we scrolled down
      if (currentScrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Check scroll direction and show/hide navbar
      if (currentScrollY > 120) {
        if (currentScrollY > lastScrollY.current) {
          // Scrolling down - hide navbar
          setIsVisible(false);
        } else {
          // Scrolling up - show navbar
          setIsVisible(true);
        }
      } else {
        // At the very top, always show navbar
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const highlightCategories = categories ? categories.filter(c => c.highlight) : [];
  
  const postCategories = [
    { label: "Kiến thức phong thủy", view: { type: "posts", categorySlug: "knowledge" } as ViewType, path: "/chuyen-muc/knowledge" },
    { label: "Tư vấn thiết kế", view: { type: "posts", categorySlug: "consulting" } as ViewType, path: "/chuyen-muc/consulting" },
    { label: "Tin tức sự kiện", view: { type: "posts", categorySlug: "news" } as ViewType, path: "/chuyen-muc/news" },
    { label: "Phong thủy lăng mộ", view: { type: "posts", categorySlug: "feng_shui" } as ViewType, path: "/chuyen-muc/feng_shui" },
  ];

  const navItems = [
    { label: "TRANG CHỦ", view: { type: "home" } as ViewType, path: "/" },
    { 
      label: "SẢN PHẨM", 
      view: { type: "products" } as ViewType, 
      path: "/san-pham",
      dropdown: highlightCategories.map(cat => ({
        label: cat.name,
        view: { type: "products", categorySlug: cat.slug } as ViewType,
        path: `/danh-muc/${cat.slug}`
      }))
    },
    { label: "DỰ ÁN / CÔNG TRÌNH", view: { type: "projects" } as ViewType, path: "/du-an" },
    { 
      label: "BÀI VIẾT", 
      view: { type: "posts" } as ViewType, 
      path: "/bai-viet",
      dropdown: postCategories
    },
    { label: "LIÊN HỆ", view: { type: "contact" } as ViewType, path: "/lien-he" },
  ];

  const isActive = (itemView: ViewType) => {
    if (currentView.type === itemView.type) {
      return true;
    }
    if (currentView.type === "product-detail" && itemView.type === "products") {
      return true;
    }
    if (currentView.type === "post-detail" && itemView.type === "posts") {
      return true;
    }
    return false;
  };

  const handleNavClick = (view: ViewType, e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(view);
    setIsOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ease-in-out transform ${
      isVisible ? "translate-y-0" : "-translate-y-full"
    } ${
      isScrolled 
        ? "bg-white/80 backdrop-blur-md border-b border-deep-navy/10 shadow-sm" 
        : "bg-light-cream/40 backdrop-blur-[4px] border-b border-transparent"
    }`}>
      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center transition-all duration-500 ease-in-out ${
          isScrolled ? "h-16" : "h-20"
        }`}>
          {/* Logo Brand Brandmark */}
          <div 
            onClick={(e) => handleNavClick({ type: "home" }, e)}
            className="flex items-center cursor-pointer group"
          >
            <img 
              src="https://images.langmodaquangtri.com/logo/Layer%201.png" 
              alt="LĂNG MỘ ĐÁ QUẢNG TRỊ" 
              className={`w-auto transition-all duration-500 ease-in-out group-hover:scale-105 object-contain ${
                isScrolled ? "h-12" : "h-14"
              }`}
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 h-full">
            {navItems.map((item, idx) => (
              <div key={idx} className="relative group flex items-center h-full">
                <a
                  href={item.path}
                  onClick={(e) => handleNavClick(item.view, e)}
                  className={`font-serif text-[15px] font-bold tracking-wider transition-all relative py-2 flex items-center gap-1 ${
                    isActive(item.view)
                      ? "text-deep-navy font-extrabold"
                      : "text-deep-navy/70 hover:text-deep-navy"
                  }`}
                >
                  {item.label}
                  {item.dropdown && item.dropdown.length > 0 && (
                    <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:translate-y-0.5 transition-transform" />
                  )}
                  {isActive(item.view) && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-deep-navy" />
                  )}
                </a>

                {/* Dropdown Menu */}
                {item.dropdown && item.dropdown.length > 0 && (
                  <div className="absolute top-full left-0 mt-0 w-64 bg-light-cream border border-deep-navy/15 shadow-xl rounded-sm py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
                    {item.dropdown.map((subItem, subIdx) => (
                      <a
                        key={subIdx}
                        href={subItem.path}
                        onClick={(e) => handleNavClick(subItem.view, e)}
                        className="block px-4 py-2.5 text-[13.5px] font-serif font-bold text-deep-navy/85 hover:text-red-clay hover:bg-cream/45 transition-all border-b border-deep-navy/5 last:border-b-0"
                      >
                        {subItem.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Desktop Button */}
          <div className="hidden lg:flex items-center">
            <a
              href="/lien-he"
              onClick={(e) => handleNavClick({ type: "contact" }, e)}
              className={`bg-deep-navy text-cream text-[11px] font-bold uppercase tracking-widest hover:bg-dark-navy transition-all rounded-none border border-soft-blue/20 flex items-center gap-2 ${
                isScrolled ? "px-5 py-2.5" : "px-6 py-3"
              }`}
            >
              <Heart className="w-4 h-4 text-muted-pink animate-pulse" />
              Đặt Chế Tác
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-deep-navy hover:text-red-clay focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="lg:hidden border-t border-deep-navy/10 bg-light-cream/95 backdrop-blur-md transition-all">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {navItems.map((item, idx) => {
              const isItemActive = isActive(item.view);
              const hasDropdown = item.dropdown && item.dropdown.length > 0;
              const isExpanded = !!expandedMenus[item.label];
              return (
                <div key={idx} className="space-y-0.5">
                  <div className="flex items-center justify-between w-full">
                    <a
                      href={item.path}
                      onClick={(e) => {
                        if (hasDropdown) {
                          e.preventDefault();
                          toggleMenu(item.label);
                        } else {
                          handleNavClick(item.view, e);
                        }
                      }}
                      className={`flex-grow block px-4 py-3 rounded-none font-serif text-[15px] font-bold tracking-wider ${
                        isItemActive
                          ? "bg-cream text-deep-navy"
                          : "text-deep-navy hover:bg-cream hover:text-deep-navy"
                      }`}
                    >
                      {item.label}
                    </a>
                    {hasDropdown && (
                      <button
                        onClick={() => toggleMenu(item.label)}
                        className="px-4 py-3 text-deep-navy hover:text-red-clay focus:outline-none"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </div>

                  {/* Mobile Submenu accordions */}
                  {hasDropdown && isExpanded && (
                    <div className="pl-6 pr-4 py-1 space-y-1.5 bg-cream/25 border-l-2 border-red-clay/20 ml-4 mb-2">
                      <a
                        href={item.path}
                        onClick={(e) => handleNavClick(item.view, e)}
                        className="block py-1.5 text-[13.5px] font-serif font-bold tracking-wide text-deep-navy/70 hover:text-deep-navy italic"
                      >
                        • Xem tất cả {item.label === "SẢN PHẨM" ? "sản phẩm" : "bài viết"}
                      </a>
                      {item.dropdown.map((subItem, subIdx) => {
                        const isSubActive = currentView.type === subItem.view.type && 
                          ("categorySlug" in currentView && "categorySlug" in subItem.view && currentView.categorySlug === subItem.view.categorySlug);
                        return (
                          <a
                            key={subIdx}
                            href={subItem.path}
                            onClick={(e) => handleNavClick(subItem.view, e)}
                            className={`block py-1.5 text-[13.5px] font-serif font-bold tracking-wide ${
                              isSubActive
                                ? "text-red-clay"
                                : "text-deep-navy/70 hover:text-deep-navy"
                            }`}
                          >
                            • {subItem.label}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="pt-4 pb-2 border-t border-deep-navy/10 px-4">
              <a
                href="/lien-he"
                onClick={(e) => handleNavClick({ type: "contact" }, e)}
                className="w-full py-3 bg-deep-navy text-cream text-[11px] font-bold uppercase tracking-widest hover:bg-dark-navy transition-all rounded-none text-center block"
              >
                Yêu Cầu Gọi Lại Tư Vấn
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
