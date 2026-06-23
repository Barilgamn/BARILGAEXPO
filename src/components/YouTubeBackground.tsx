import React, { useEffect, useRef } from 'react';

interface Props {
  videoId: string;
  /** Тоглуулах хурд (0.25, 0.5, 1 ...). YouTube-ийн дэмждэг утгууд. */
  rate?: number;
  className?: string;
}

/**
 * Hero хэсгийн дэвсгэрт YouTube видеог дуугүй, давталттай, удаашруулж тоглуулна.
 * YouTube IFrame API ашиглан setPlaybackRate дуудна (URL параметрээр хурдыг
 * найдвартай тохируулах боломжгүй тул).
 */
let apiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if ((window as any).YT && (window as any).YT.Player) {
      resolve();
      return;
    }
    const prev = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      if (typeof prev === 'function') prev();
      resolve();
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });
  return apiPromise;
}

export const YouTubeBackground: React.FC<Props> = ({ videoId, rate = 0.75, className = '' }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    let destroyed = false;
    loadYouTubeApi().then(() => {
      if (destroyed || !hostRef.current) return;
      playerRef.current = new (window as any).YT.Player(hostRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          mute: 1,
          loop: 1,
          playlist: videoId,
          playsinline: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: (e: any) => {
            e.target.mute();
            e.target.setPlaybackRate(rate);
            e.target.playVideo();
          },
          onStateChange: (e: any) => {
            // Дуусахад дахин эхнээс нь тоглуулж давталт баталгаажуулна
            if (e.data === (window as any).YT.PlayerState.ENDED) {
              e.target.seekTo(0);
              e.target.playVideo();
            }
            if (e.data === (window as any).YT.PlayerState.PLAYING) {
              e.target.setPlaybackRate(rate);
            }
          },
        },
      });
    });
    return () => {
      destroyed = true;
      try { playerRef.current?.destroy?.(); } catch { /* ignore */ }
    };
  }, [videoId, rate]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* iframe-ийг 16:9 хадгалан бүх талбайг бүрхэхээр томруулна (object-cover мэт) */}
      <div
        ref={hostRef}
        className="absolute top-1/2 left-1/2"
        style={{
          width: '100vw',
          height: '56.25vw',
          minHeight: '100%',
          minWidth: '177.78vh',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
