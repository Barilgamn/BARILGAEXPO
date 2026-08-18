import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Crosshair } from 'lucide-react';

/**
 * Албан ёсны танхимын зураглалыг (public/floorplan.svg — CorelDRAW-аас
 * гаргасан эх файл) яг хэвээр нь харуулна. Талбайн хэлбэр, байрлал, өнгө,
 * үнэ, захиалгын тэмдэглэгээ бүгд эх зурагтайгаа ижил.
 */
export const IsometricFloorPlan: React.FC = () => {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [isFs, setIsFs] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  useEffect(() => {
    const onChange = () => setIsFs(document.fullscreenElement === wrapRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.();
  };

  const zoom = (f: number) => setScale(s => Math.min(12, Math.max(0.6, s * f)));
  const reset = () => { setScale(1); setTx(0); setTy(0); };

  const onWheel: React.WheelEventHandler = (e) => {
    e.preventDefault();
    zoom(e.deltaY < 0 ? 1.15 : 0.87);
  };
  const onPointerDown: React.PointerEventHandler = (e) => {
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, tx, ty };
  };
  const onPointerMove: React.PointerEventHandler = (e) => {
    const d = dragRef.current;
    if (!d) return;
    setTx(d.tx + (e.clientX - d.x));
    setTy(d.ty + (e.clientY - d.y));
  };
  const onPointerUp = () => { dragRef.current = null; };

  const btn = 'p-2 rounded-lg bg-white/90 hover:bg-white border border-gray-200 text-gray-600 shadow-sm transition-colors';

  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white">
      <div
        ref={wrapRef}
        className="relative overflow-hidden select-none cursor-grab active:cursor-grabbing bg-white"
        style={{ height: isFs ? '100vh' : 620, touchAction: 'none' }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <img
          src="/floorplan.svg"
          alt="BARILGA EXPO 2026 танхимын зураглал"
          draggable={false}
          className="w-full h-full object-contain"
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: dragRef.current ? 'none' : 'transform 0.14s ease-out',
          }}
        />

        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          <button onClick={() => zoom(1.35)} className={btn} title="Томруулах"><ZoomIn size={16} /></button>
          <button onClick={() => zoom(0.74)} className={btn} title="Жижигрүүлэх"><ZoomOut size={16} /></button>
          <button onClick={reset} className={btn} title="Хэвд оруулах"><Crosshair size={16} /></button>
          <button onClick={toggleFullscreen} className={btn} title={isFs ? 'Бүтэн дэлгэцээс гарах' : 'Бүтэн дэлгэц'}>
            {isFs ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        <div className="absolute left-3 bottom-3 text-[11px] text-gray-500 bg-white/85 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-100">
          Чирж зөөх · Дугуй эргүүлж томруулах
        </div>
      </div>
    </div>
  );
};
