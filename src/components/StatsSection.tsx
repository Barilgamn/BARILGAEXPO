import React, { useState, useEffect, useRef } from "react";
import { Users, Eye, TrendingUp, Award } from "lucide-react";

interface CounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

const AnimatedCounter: React.FC<CounterProps> = ({ end, duration = 2000, suffix = "", prefix = "" }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let animationFrameId: number;

    const startAnimation = () => {
      if (hasAnimated.current) return;
      hasAnimated.current = true;
      const startTime = performance.now();

      const updateCount = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        if (elapsedTime < duration) {
          const progress = elapsedTime / duration;
          // Easing: easeOutQuad
          const easeProgress = progress * (2 - progress);
          setCount(Math.floor(easeProgress * end));
          animationFrameId = requestAnimationFrame(updateCount);
        } else {
          setCount(end);
        }
      };

      animationFrameId = requestAnimationFrame(updateCount);
    };

    if (elementRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting) {
            startAnimation();
            if (observer && elementRef.current) {
              observer.unobserve(elementRef.current);
            }
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(elementRef.current);
    }

    return () => {
      if (observer && elementRef.current) {
        observer.disconnect();
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [end, duration]);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <span ref={elementRef} className="font-heading font-black tracking-tight text-white">
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
};

export const StatsSection: React.FC = () => {
  const stats = [
    {
      id: "stat-exhibitors",
      end: 400,
      suffix: "+",
      label: "Оролцогч",
      description: "Дотоод, гадаадын тэргүүлэгч брэнд, ААН-үүд",
      icon: Users,
      color: "from-emerald-400 to-teal-500",
    },
    {
      id: "stat-visitors",
      end: 30000,
      suffix: "+",
      label: "Үзэгч",
      description: "Хөрөнгө оруулагчид, мэргэжилтнүүд, хэрэглэгчид",
      icon: Eye,
      color: "from-blue-400 to-indigo-500",
    },
    {
      id: "stat-sales",
      end: 100,
      suffix: "+ тэрбум ₮",
      label: "Борлуулалт",
      description: "Үзэсгэлэнгийн үеэр хийгдэх борлуулалт, гэрээ хэлцэл",
      icon: TrendingUp,
      color: "from-amber-400 to-orange-500",
    },
    {
      id: "stat-editions",
      end: 40,
      suffix: "+ удаа",
      label: "Амжилттай зохион байгуулалт",
      description: "Монголын хамгийн урт настай барилгын үзэсгэлэн",
      icon: Award,
      color: "from-red-400 to-rose-500",
    },
  ];

  return (
    <section id="stats" className="relative z-30 mt-12 lg:mt-20 mb-8 lg:mb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 relative z-10 divide-y md:divide-y-0 lg:divide-x divide-white/10">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.id} 
                id={stat.id}
                className={`flex flex-col items-center text-center p-6 lg:px-8 ${
                  idx > 0 ? "pt-8 md:pt-6 lg:pt-6" : ""
                }`}
              >
                <div className="mb-4 p-4 rounded-2.5xl bg-white/5 border border-white/15 shadow-inner group hover:scale-110 transition-transform duration-300">
                  <Icon className="h-8 w-8 text-emerald-400" />
                </div>
                <div className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r text-transparent bg-clip-text from-white via-white to-gray-300">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                </div>
                <div className="text-emerald-400 font-heading font-extrabold text-lg tracking-wide uppercase mb-2">
                  {stat.label}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed max-w-[220px]">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
