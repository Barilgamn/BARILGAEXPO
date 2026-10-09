import React, { useState, useEffect, useRef } from "react";
import { ISO_ICONS } from "./iso/icons";
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
    <span ref={elementRef} className="font-heading font-bold tracking-tight">
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
      color: "from-red-400 to-teal-500",
    },
    {
      id: "stat-visitors",
      end: 30000,
      suffix: "+",
      label: t('stat2_lab'),
      description: t('stat2_desc'),
      color: "from-blue-400 to-indigo-500",
    },
    {
      id: "stat-sales",
      end: 100,
      suffix: <span className="block text-base sm:text-2xl md:text-3xl mt-0.5 sm:mt-1 tracking-normal font-bold">{t('stat3_suf')}</span>,
      label: t('stat3_lab'),
      description: t('stat3_desc'),
      color: "from-red-400 to-red-500",
    },
    {
      id: "stat-editions",
      end: 41,
      suffix: <span className="block text-base sm:text-2xl md:text-3xl mt-0.5 sm:mt-1 tracking-normal font-bold">{t('stat4_suf')}</span>,
      label: t('stat4_lab'),
      description: t('stat4_desc'),
      color: "from-red-400 to-rose-500",
    },
  ];

  return (
    <section id="stats" className="relative z-30 scene-ink section-pad">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
        <h2 className="display text-3xl sm:text-5xl lg:text-6xl fg text-center max-w-4xl mx-auto mb-12 md:mb-16">
          {t('stats_title')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = ISO_ICONS[stat.id];
            return (
              <div
                key={stat.id}
                id={stat.id}
                className="group/stat glass !rounded-3xl p-6 sm:p-7 flex flex-col"
              >
                <div className="-mt-4 -ml-3 mb-1 w-fit transition-transform duration-500 group-hover/stat:scale-105">
                  <Icon size={104} />
                </div>
                <div className="display text-4xl sm:text-5xl text-white tabular-nums">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                </div>
                <div className="text-red-300 font-bold text-sm mt-3 mb-1.5">
                  {stat.label}
                </div>
                <p className="text-white/60 text-sm leading-relaxed">
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
