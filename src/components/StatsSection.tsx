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
    <span ref={elementRef} className="font-heading font-black tracking-tight text-blue-950">
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
      suffix: <span className="block text-base sm:text-2xl md:text-3xl mt-0.5 sm:mt-1 tracking-normal font-bold">{t('stat3_suf')}</span>,
      label: t('stat3_lab'),
      description: t('stat3_desc'),
      icon: TrendingUp,
      color: "from-red-400 to-red-500",
    },
    {
      id: "stat-editions",
      end: 40,
      suffix: <span className="block text-base sm:text-2xl md:text-3xl mt-0.5 sm:mt-1 tracking-normal font-bold">{t('stat4_suf')}</span>,
      label: t('stat4_lab'),
      description: t('stat4_desc'),
      icon: Award,
      color: "from-red-400 to-rose-500",
    },
  ];

  return (
    <section id="stats" className="relative z-30 surface border-t hairline section-pad">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
      <div className="surface-card p-5 sm:p-8 md:p-12 relative overflow-hidden group">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-6 sm:gap-8 md:gap-12 relative z-10 lg:divide-x divide-gray-200">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                id={stat.id}
                className="flex flex-col items-center text-center px-2 py-2 sm:p-6 lg:px-8"
              >
                <div className="mb-2 sm:mb-4 p-2.5 sm:p-4 rounded-xl bg-gray-50 border border-gray-200 transition-colors duration-300">
                  <Icon className="h-5 w-5 sm:h-8 sm:w-8 text-red-600" />
                </div>
                <div className="display text-3xl sm:text-5xl md:text-6xl mb-1 sm:mb-2 text-blue-950 tabular-nums">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                </div>
                <div className="text-red-600 font-bold text-[10px] sm:text-xs tracking-[0.18em] uppercase mb-1 sm:mb-2">
                  {stat.label}
                </div>
                <p className="text-gray-500 text-xs sm:text-sm leading-snug sm:leading-relaxed max-w-[220px]">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
};
