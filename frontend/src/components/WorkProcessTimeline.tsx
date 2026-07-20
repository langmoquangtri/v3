import React, { useRef, useState, useEffect } from "react";
import { WorkProcess } from "../types";
import { Sparkles, ArrowDown, ChevronDown, CheckCircle2 } from "lucide-react";

interface WorkProcessTimelineProps {
  workProcesses: WorkProcess[];
}

export default function WorkProcessTimeline({ workProcesses }: WorkProcessTimelineProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // Default steps fallback if the list from CMS is empty
  const displaySteps = workProcesses && workProcesses.length > 0 ? workProcesses : [
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

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how much of the section has scrolled past the middle of the screen
      const startPoint = rect.top - windowHeight * 0.75;
      const totalDist = rect.height - windowHeight * 0.5;
      
      let progress = -startPoint / totalDist;
      progress = Math.min(Math.max(progress, 0), 1);
      
      setScrollPercent(progress * 100);

      // Determine active index based on current scroll position relative to step elements
      const stepsCount = displaySteps.length;
      if (stepsCount > 0) {
        const index = Math.min(Math.floor(progress * stepsCount), stepsCount - 1);
        setActiveIndex(index);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    // Initial call to set positions
    setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [displaySteps.length]);

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full overflow-hidden transition-all duration-300 bg-deep-navy pt-[101px] pb-[101px] md:pt-36 md:pb-36 border-t border-b border-white/10"
      id="quy-trinh-lam-viec"
    >
      {/* Infinite Seamless Stone Pattern Marquee Banner (Top, Rotated 180deg) */}
      <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden border-b border-white/10 bg-deep-navy select-none pointer-events-none z-10 rotate-180">
        <div className="animate-stone-marquee flex w-[200%] h-full">
          <div 
            className="w-1/2 h-full bg-repeat-x" 
            style={{ 
              backgroundImage: 'url("https://images.langmodaquangtri.com/stone.webp")',
              backgroundSize: 'auto 100%'
            }}
          />
          <div 
            className="w-1/2 h-full bg-repeat-x" 
            style={{ 
              backgroundImage: 'url("https://images.langmodaquangtri.com/stone.webp")',
              backgroundSize: 'auto 100%'
            }}
          />
        </div>
      </div>

      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 bg-carving-pattern opacity-10 pointer-events-none" />
      <div className="absolute top-1/4 left-0 -translate-y-1/2 w-96 h-96 bg-soft-blue/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-red-clay/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SECTION HEADER */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-mono uppercase tracking-widest text-[#7892B5] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kỹ Nghệ Chuyên Nghiệp</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white uppercase tracking-wide">
            Quy Trình Tư Vấn & Báo Giá
          </h2>
          <div className="w-16 h-1 bg-[#7892B5] mx-auto mt-4 rounded-full" />
        </div>

        {/* TIMELINE CONTAINER */}
        <div className="relative">
          {/* DESKTOP TIMELINE DESIGN */}
          <div className="hidden md:block relative max-w-4xl mx-auto">
            {/* The main vertical track line */}
            <div className="absolute left-1/2 top-12 bottom-12 -translate-x-1/2 w-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="w-full bg-[#7892B5] origin-top transition-transform duration-100 rounded-full"
                style={{ 
                  height: "100%", 
                  transform: `scaleY(${scrollPercent / 100})` 
                }}
              />
            </div>

            {/* Steps loop */}
            <div className="space-y-16">
              {displaySteps.map((step, idx) => {
                const isLeft = idx % 2 === 0;
                const isActive = idx <= activeIndex;
                const isCurrentlyActive = idx === activeIndex;

                return (
                  <div key={step.id || idx} className="relative flex items-center justify-between">
                    {/* Left/Right Column with card */}
                    <div className={`w-[45%] ${isLeft ? "text-right" : "order-2 text-left"}`}>
                      <div 
                        className={`transition-all duration-500 transform ${
                          isActive 
                            ? "opacity-100 translate-y-0" 
                            : "opacity-40 translate-y-4"
                        }`}
                      >
                        <div className={`inline-block p-6 bg-white border rounded-sm shadow-md transition-all duration-300 ${
                          isCurrentlyActive ? "border-white ring-2 ring-white/30 scale-102" : "border-transparent"
                        }`}>
                          <span className="text-xs font-mono font-bold tracking-widest text-[#17365F]">
                            BƯỚC {step.step}
                          </span>
                          <h4 className="font-serif font-bold text-xl text-[#17365F] mt-1 transition-colors">
                            {step.title}
                          </h4>
                          <p className="text-sm text-black font-sans font-medium mt-2.5 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Central Indicator Badge */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
                      <div 
                        className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-500 font-serif font-bold text-lg shadow-md ${
                          isCurrentlyActive
                            ? "bg-white text-deep-navy border-white scale-110 ring-4 ring-white/20"
                            : isActive
                              ? "bg-[#7892B5] text-white border-[#7892B5] scale-105"
                              : "bg-deep-navy text-white/50 border-white/20"
                        }`}
                      >
                        {step.step}
                      </div>
                    </div>

                    {/* Symmetrical placeholder */}
                    <div className="w-[45%]" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* MOBILE TIMELINE DESIGN (Deep Blue Background requested) */}
          <div className="block md:hidden relative pl-12 pr-2">
            {/* Left track line */}
            <div className="absolute left-5 top-4 bottom-4 w-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="w-full bg-[#7892B5] origin-top transition-transform duration-100 rounded-full"
                style={{ 
                  height: "100%", 
                  transform: `scaleY(${scrollPercent / 100})` 
                }}
              />
            </div>

            {/* Steps list */}
            <div className="space-y-8">
              {displaySteps.map((step, idx) => {
                const isActive = idx <= activeIndex;
                const isCurrentlyActive = idx === activeIndex;

                return (
                  <div key={step.id || idx} className="relative flex items-start gap-4">
                    {/* Circle Indicator */}
                    <div className="absolute -left-[40px] top-1.5 z-10 flex items-center justify-center">
                      <div 
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-mono font-bold text-xs shadow-md transition-all duration-300 ${
                          isCurrentlyActive
                            ? "bg-white text-deep-navy border-white scale-110 ring-4 ring-white/25"
                            : isActive
                              ? "bg-[#7892B5] text-white border-[#7892B5]"
                              : "bg-deep-navy text-white/50 border-white/20"
                        }`}
                      >
                        {step.step}
                      </div>
                    </div>

                    {/* Card: màu trắng kết hợp đen và deepblue */}
                    <div 
                      className={`w-full p-5 bg-white rounded-lg border transition-all duration-300 shadow-md ${
                        isCurrentlyActive 
                          ? "border-white translate-x-1" 
                          : "border-transparent opacity-85"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold tracking-widest text-[#17365F]">
                          BƯỚC {step.step}
                        </span>
                        {isActive && (
                          <CheckCircle2 className="w-4 h-4 text-[#17365F]" />
                        )}
                      </div>
                      
                      {/* Tiêu đề chữ màu Deepblue */}
                      <h4 className="font-serif font-bold text-lg text-[#17365F]">
                        {step.title}
                      </h4>
                      
                      {/* Nội dung miêu tả màu đen */}
                      <p className="text-xs text-black font-sans font-medium mt-1.5 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Infinite Seamless Stone Pattern Marquee Banner */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden border-t border-white/10 bg-deep-navy select-none pointer-events-none z-10">
        <div className="animate-stone-marquee flex w-[200%] h-full">
          <div 
            className="w-1/2 h-full bg-repeat-x" 
            style={{ 
              backgroundImage: 'url("https://images.langmodaquangtri.com/stone.webp")',
              backgroundSize: 'auto 100%'
            }}
          />
          <div 
            className="w-1/2 h-full bg-repeat-x" 
            style={{ 
              backgroundImage: 'url("https://images.langmodaquangtri.com/stone.webp")',
              backgroundSize: 'auto 100%'
            }}
          />
        </div>
      </div>
    </section>
  );
}
