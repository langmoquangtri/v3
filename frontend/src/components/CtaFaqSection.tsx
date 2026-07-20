import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { FAQ, CtaSlide } from "../types";

interface CtaFaqSectionProps {
  faqs: FAQ[];
  ctaSlides?: CtaSlide[];
  onContactClick: () => void;
}

const defaultSlides: CtaSlide[] = [
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

export default function CtaFaqSection({ faqs, ctaSlides = [], onContactClick }: CtaFaqSectionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const slidesToRender = ctaSlides.length > 0 ? ctaSlides : defaultSlides;

  // Auto-slide effect
  useEffect(() => {
    if (slidesToRender.length <= 1 || isHovered) return;
    
    const timer = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % slidesToRender.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [slidesToRender.length, isHovered]);

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex((prevIndex) => (prevIndex - 1 + slidesToRender.length) % slidesToRender.length);
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % slidesToRender.length);
  };

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section 
      className="py-20 max-[900px]:py-[54px] bg-carving-pattern border-t border-b border-beige-dark/20"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-[1100px] w-full mx-auto px-5">
        <div className="grid grid-cols-[1.2fr_1fr] gap-[30px] items-center max-[900px]:grid-cols-1 max-[900px]:gap-[60px]">
          
          {/* Left Column — 4:5 Aspect Ratio Image Slider */}
          <div 
            className="relative w-full aspect-[4/5] rounded-[24px] overflow-hidden group shadow-xl"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Slides container */}
            {slidesToRender.map((slide, index) => {
              const isCurrent = index === currentSlideIndex;
              return (
                <div
                  key={slide.id || index}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    isCurrent ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 pointer-events-none z-0"
                  }`}
                >
                  {/* Image background */}
                  <img
                    src={slide.image}
                    alt={slide.title || "Slide ảnh Đá Tâm An"}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Dark gradient mask for superior text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/95 via-deep-navy/40 to-black/30" />

                  {/* Text Content Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12 text-white z-10">
                    {slide.title && (
                      <h2 
                        className="font-serif font-extrabold text-cream mb-2 select-none tracking-tight leading-tight"
                        style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
                      >
                        {slide.title}
                      </h2>
                    )}
                    
                    {slide.subtitle && (
                      <p className="text-[0.88rem] sm:text-[0.95rem] mb-6 font-normal text-cream/90 max-w-md leading-relaxed select-none">
                        {slide.subtitle}
                      </p>
                    )}

                    <div>
                      <button 
                        onClick={() => {
                          if (slide.link) {
                            window.location.href = slide.link;
                          } else {
                            onContactClick();
                          }
                        }}
                        className="bg-cream text-deep-navy font-bold text-[0.9rem] uppercase tracking-wider transition-all duration-300 hover:bg-white hover:scale-[1.03] active:scale-95 shadow-lg py-3 px-8 rounded-lg pointer-events-auto"
                      >
                        {slide.button_text || "Nhận Tư Vấn"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Slider Navigation Arrows (Visible on Desktop Hover) */}
            {slidesToRender.length > 1 && (
              <>
                <button
                  onClick={handlePrevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 pointer-events-auto cursor-pointer"
                  aria-label="Slide trước"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={handleNextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 pointer-events-auto cursor-pointer"
                  aria-label="Slide tiếp theo"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Slider Indicator Dots */}
            {slidesToRender.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {slidesToRender.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlideIndex(index);
                    }}
                    className={`h-2.5 rounded-full transition-all duration-300 pointer-events-auto cursor-pointer ${
                      index === currentSlideIndex ? "w-6 bg-cream" : "w-2.5 bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Đi tới slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column — FAQ accordion */}
          <div className="flex flex-col justify-center gap-3">
            <div className="mb-4 text-left">
              <span className="text-xs uppercase tracking-[0.2em] text-red-clay font-bold font-mono">Giải Đáp Thắc Mắc</span>
              <h3 className="text-xl sm:text-2xl font-serif font-extrabold mt-1 text-deep-navy tracking-tight uppercase">Câu Hỏi Thường Gặp</h3>
            </div>
            
            <div className="flex flex-col gap-3">
              {faqs.map((faq, index) => {
                const isActive = activeIndex === index;
                return (
                  <div 
                    key={faq.id || index}
                    onClick={() => toggleAccordion(index)}
                    className="bg-white border rounded-[10px] py-[18px] px-5 cursor-pointer transition-all duration-200"
                    style={{
                      borderColor: isActive ? "#7892b5" : "#f0f0f0",
                      boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.04)" : "0 2px 8px rgba(0,0,0,0.02)"
                    }}
                  >
                    <div className="flex justify-between items-center font-normal text-[0.9rem] text-deep-navy gap-3">
                      <span className="font-semibold text-stone-charcoal text-left">{faq.question}</span>
                      {isActive ? (
                        <ChevronUp size={20} className="text-red-clay shrink-0" />
                      ) : (
                        <ChevronDown size={20} className="text-stone-charcoal/50 shrink-0" />
                      )}
                    </div>
                    {isActive && (
                      <div className="mt-3 text-[0.9rem] text-stone-charcoal/80 leading-[1.6] whitespace-pre-line text-left border-t border-beige-dark/20 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
