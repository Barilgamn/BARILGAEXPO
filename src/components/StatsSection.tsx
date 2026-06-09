import React, { useState, useEffect, useRef } from "react";
import { Users, Eye, TrendingUp, Award } from "lucide-react";
import { useTranslation } from "../i18n";

interface CounterProps {
  end: number;
  duration?: number;
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
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
  const { t } = useTranslation();
  
  const stats = [
    {
      id: "stat-exhibitors",
      end: 400,
      suffix: "+",
      label: t('stat1_lab'),
      description: t('stat1_desc'),
      icon: Users,
      color: "from-red-400 to-teal-500",
    },
    {
      id: "stat-visitors",
      end: 30000,
      suffix: "+",
      label: t('stat2_lab'),
      description: t('stat2_desc'),
      icon: Eye,
      color: "from-blue-400 to-indigo-500",
    },
    {
      id: "stat-sales",
      end: 100,
      suffix: <span className="block text-2xl md:text-3xl mt-1 tracking-normal font-bold">{t('stat3_suf')}</span>,
      label: t('stat3_lab'),
      description: t('stat3_desc'),
      icon: TrendingUp,
      color: "from-red-400 to-red-500",
    },
    {
      id: "stat-editions",
      end: 40,
      suffix: <span className="block text-2xl md:text-3xl mt-1 tracking-normal font-bold">{t('stat4_suf')}</span>,
      label: t('stat4_lab'),
      description: t('stat4_desc'),
      icon: Award,
      color: "from-red-400 to-rose-500",
    },
  ];

  return (
    <section id="stats" className="relative z-30 mt-12 lg:mt-20 mb-8 lg:mb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-blue-950 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-blue-800/50 relative overflow-hidden group">
        {/* Architectural Background */}
        <div className="absolute inset-0 bg-blueprint z-0 opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-950/80 z-0" />
        
        {/* Warning Tape Top Border */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-red-400 to-red-500 z-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)" }} />

        {/* Decorative Grid Lines */}
        <div className="absolute top-0 right-1/4 w-px h-full bg-blue-500/10 z-0" />
        <div className="absolute top-0 left-1/4 w-px h-full bg-blue-500/10 z-0" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-blue-500/10 z-0" />

        <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 relative z-10 divide-y md:divide-y-0 lg:divide-x divide-blue-800/50">
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
                <div className="mb-4 p-4 rounded-xl bg-blue-900/40 border border-blue-700/50 shadow-inner group-hover:bg-blue-800/50 transition-colors duration-300">
                  <Icon className="h-8 w-8 text-red-400" />
                </div>
                <div className="text-4xl md:text-5xl font-black mb-2 font-mono text-white">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                </div>
                <div className="text-red-400 font-heading font-bold text-sm tracking-widest uppercase mb-2">
                  {stat.label}
                </div>
                <p className="text-blue-200/60 text-sm leading-relaxed max-w-[220px]">
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
