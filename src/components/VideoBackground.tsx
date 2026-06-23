import React, { useEffect, useRef } from 'react';

interface Props {
  src: string;
  /** Тоглуулах хурд. HTML5 video тул дурын утга (ж: 0.1) болно. */
  rate?: number;
  className?: string;
}

/**
 * Hero хэсгийн дэвсгэрт өөрсдийн hosting хийсэн видеог дуугүй, давталттай,
 * удаашруулж тоглуулна. YouTube-ээс ялгаатай нь playbackRate-ийг дурын
 * утгаар (0.25-аас бага) тохируулах боломжтой.
 */
export const VideoBackground: React.FC<Props> = ({ src, rate = 0.5, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = rate;
    v.play().catch(() => { /* autoplay restrictions — muted тул ихэвчлэн зүгээр */ });
  }, [rate, src]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onLoadedMetadata={(e) => { (e.currentTarget as HTMLVideoElement).playbackRate = rate; }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover"
        style={{ pointerEvents: 'none', minWidth: '100%', minHeight: '100%' }}
      />
    </div>
  );
};
