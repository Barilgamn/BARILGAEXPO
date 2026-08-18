import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Crosshair } from 'lucide-react';
import { HALL, WALL_H, floors, walls, boothLabels } from '../data/hallGeometry';
import { booths } from '../data/booths';

/**
 * Албан ёсны зураглалын геометрийг (шал + цэнхэр шугамаар тэмдэглэсэн хана)
 * жинхэнэ изометр проекцоор харуулна. Гурван тэнхлэг ижил богиносолттой
 * тул хана бодит өндрөөрөө (2.4 м) босно.
 */
const COS = 0.866;
const TILT = 0.5;
const CX = HALL.w / 2;
const CY = HALL.h / 2;

/** Планы цэгийг дэлгэцийн координат руу; z нь дээш өргөнө. */
const P = (x: number, y: number, z = 0): [number, number] => {
  const dx = x - CX, dy = y - CY;
  return [(dx - dy) * COS, (dx + dy) * TILT - z];
};
const pts = (a: [number, number][]) => a.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

const WALL_LIGHT = '#f1f5f9';
const WALL_DARK = '#c3ccd8';
const WALL_TOP = '#ffffff';

const AREA: Record<string, number> = Object.fromEntries(booths.map(b => [b.id, b.area]));

export const IsometricFloorPlan: React.FC = () => {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [isFs, setIsFs] = useState(false);
  const [overlay, setOverlay] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  useEffect(() => {
    const onChange = () => setIsFs(document.fullscreenElement === wrapRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => {
    if (!overlay) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOverlay(false); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [overlay]);

  const expanded = isFs || overlay;

  const toggleFullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) { document.exitFullscreen?.(); return; }
    if (overlay) { setOverlay(false); return; }
    try {
      const req = el.requestFullscreen?.();
      if (req && typeof req.catch === 'function') req.catch(() => setOverlay(true));
    } catch { /* дараах шалгалт барина */ }
    window.setTimeout(() => { if (document.fullscreenElement !== el) setOverlay(true); }, 300);
  };

  /* Хананууд арынхаас урагш — гүн нь (x+y) */
  const ordered = useMemo(() => {
    return walls
      .map(w => ({ w, d: (w[0] + w[1] + w[2] + w[3]) / 2 }))
      .sort((a, b) => a.d - b.d);
  }, []);

  const vb = useMemo(() => {
    const c: [number, number][] = [P(0, 0, WALL_H), P(HALL.w, 0, WALL_H), P(HALL.w, HALL.h), P(0, HALL.h)];
    const xs = c.map(p => p[0]), ys = c.map(p => p[1]);
    const m = 24;
    const minX = Math.min(...xs) - m, minY = Math.min(...ys) - m;
    return { minX, minY, w: Math.max(...xs) - minX + m, h: Math.max(...ys) - minY + m };
  }, []);

  const zoom = (f: number) => setScale(s => Math.min(12, Math.max(0.5, s * f)));
  const reset = () => { setScale(1); setTx(0); setTy(0); };

  const onWheel: React.WheelEventHandler = (e) => { e.preventDefault(); zoom(e.deltaY < 0 ? 1.15 : 0.87); };
  const onPointerDown: React.PointerEventHandler = (e) => {
    if ((e.target as HTMLElement).closest('[data-controls]')) return;
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
        className={`${overlay ? 'fixed inset-0 z-[9999]' : 'relative'} overflow-hidden select-none cursor-grab active:cursor-grabbing`}
        style={{
          height: expanded ? '100vh' : 620,
          width: overlay ? '100vw' : undefined,
          touchAction: 'none',
          background: 'linear-gradient(180deg, #eef2f7 0%, #dfe6ef 100%)',
        }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <svg
          viewBox={`${vb.minX} ${vb.minY} ${vb.w} ${vb.h}`}
          className="w-full h-full"
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: dragRef.current ? 'none' : 'transform 0.14s ease-out',
          }}
        >
          {/* Танхимын суурь */}
          <polygon
            points={pts([P(-8, -8), P(HALL.w + 8, -8), P(HALL.w + 8, HALL.h + 8), P(-8, HALL.h + 8)])}
            fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5"
          />

          {/* Талбайн шал — эх файлын өнгөөр */}
          {floors.map((f, i) => (
            <polygon key={i} points={pts(f.p.map(p => P(p[0], p[1])))} fill={f.c} fillOpacity={0.22} />
          ))}

          {/* Хана — арынхаас урагш */}
          {ordered.map(({ w }, i) => {
            const [x1, y1, x2, y2] = w;
            const b1 = P(x1, y1), b2 = P(x2, y2);
            const t1 = P(x1, y1, WALL_H), t2 = P(x2, y2, WALL_H);
            /* Планы x дагуух хана гэрэлтэй, y дагуух нь сүүдэртэй */
            const along = Math.abs(x2 - x1) >= Math.abs(y2 - y1);
            return (
              <g key={i}>
                <polygon points={pts([t1, t2, b2, b1])} fill={along ? WALL_LIGHT : WALL_DARK} />
                <line x1={t1[0]} y1={t1[1]} x2={t2[0]} y2={t2[1]} stroke={WALL_TOP} strokeWidth="1.1" />
              </g>
            );
          })}

          {/* Талбайн дугаар — ханан дээгүүр */}
          {boothLabels.map(l => {
            const p = P(l.x, l.y, WALL_H + 4);
            const a = AREA[l.t];
            return (
              <g key={l.t} style={{ pointerEvents: 'none' }} textAnchor="middle">
                <text x={p[0]} y={p[1]} fontSize="7" fontWeight="800" fill="#1e293b">{l.t}</text>
                {!!a && <text x={p[0]} y={p[1] + 7} fontSize="5" fontWeight="600" fill="#64748b">{a}м²</text>}
              </g>
            );
          })}
        </svg>

        <div data-controls className="absolute right-3 top-3 flex items-center gap-1.5 z-10">
          <button onClick={() => zoom(1.35)} className={btn} title="Томруулах"><ZoomIn size={16} /></button>
          <button onClick={() => zoom(0.74)} className={btn} title="Жижигрүүлэх"><ZoomOut size={16} /></button>
          <button onClick={reset} className={btn} title="Хэвд оруулах"><Crosshair size={16} /></button>
          <button onClick={toggleFullscreen} className={btn} title={expanded ? 'Бүтэн дэлгэцээс гарах' : 'Бүтэн дэлгэц'}>
            {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        <div className="absolute left-3 bottom-3 text-[11px] text-gray-600 bg-white/85 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-200">
          Чирж зөөх · Дугуй эргүүлж томруулах
        </div>
      </div>
    </div>
  );
};
