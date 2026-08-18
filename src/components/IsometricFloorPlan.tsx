import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Crosshair, RotateCcw, RotateCw } from 'lucide-react';
import { HALL, WALL_H, floors, walls, boothLabels } from '../data/hallGeometry';
import { boothDims } from '../data/floorPlanLayout';
import { booths } from '../data/booths';

/**
 * Албан ёсны зураглалын геометрийг (шал + цэнхэр шугамаар тэмдэглэсэн хана)
 * изометр проекцоор харуулна. Гурван тэнхлэг ижил богиносолттой тул хана
 * бодит өндрөөрөө (2.4 м) босно. Зураглалыг чирж эргүүлж олон талаас харна.
 */
const COS = 0.866;
const CX = HALL.w / 2;
const CY = HALL.h / 2;

const AREA: Record<string, number> = Object.fromEntries(booths.map(b => [b.id, b.area]));

/** Эргэлт (rot) ба налуу (tilt)-аас хамаарсан проекц */
const makeView = (rot: number, tilt: number) => {
  const c = Math.cos(rot), s = Math.sin(rot);
  const P = (x: number, y: number, z = 0): [number, number] => {
    const dx = x - CX, dy = y - CY;
    const rx = dx * c - dy * s;
    const ry = dx * s + dy * c;
    return [(rx - ry) * COS, (rx + ry) * tilt - z];
  };
  /** Гүн = rx + ry; их байх тусам харагчид ойр */
  const depth = (x: number, y: number) => {
    const dx = x - CX, dy = y - CY;
    return dx * (c + s) + dy * (c - s);
  };
  return { P, depth, c, s };
};

const pts = (a: [number, number][]) => a.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

export const IsometricFloorPlan: React.FC = () => {
  const [rot, setRot] = useState(0);
  const [tilt, setTilt] = useState(0.5);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [isFs, setIsFs] = useState(false);
  const [overlay, setOverlay] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<
    { mode: 'rotate' | 'pan'; x: number; y: number; rot: number; tilt: number; tx: number; ty: number } | null
  >(null);

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

  const view = useMemo(() => makeView(rot, tilt), [rot, tilt]);

  /* Хананууд арынхаас урагш — голч цэгийн гүнээр */
  const ordered = useMemo(() => {
    const { depth } = view;
    return walls
      .map(w => ({ w, d: depth((w[0] + w[2]) / 2, (w[1] + w[3]) / 2) }))
      .sort((a, b) => a.d - b.d);
  }, [view]);

  const vb = useMemo(() => {
    const { P } = view;
    const c: [number, number][] = [];
    for (const [x, y] of [[0, 0], [HALL.w, 0], [HALL.w, HALL.h], [0, HALL.h]] as [number, number][]) {
      c.push(P(x, y, 0), P(x, y, WALL_H));
    }
    const xs = c.map(p => p[0]), ys = c.map(p => p[1]);
    const m = 26;
    const minX = Math.min(...xs) - m, minY = Math.min(...ys) - m;
    return { minX, minY, w: Math.max(...xs) - minX + m, h: Math.max(...ys) - minY + m };
  }, [view]);

  const zoom = (f: number) => setScale(s => Math.min(12, Math.max(0.5, s * f)));
  const spin = (d: number) => setRot(r => r + d);
  const reset = () => { setRot(0); setTilt(0.5); setScale(1); setTx(0); setTy(0); };

  const onWheel: React.WheelEventHandler = (e) => { e.preventDefault(); zoom(e.deltaY < 0 ? 1.15 : 0.87); };
  const onPointerDown: React.PointerEventHandler = (e) => {
    if ((e.target as HTMLElement).closest('[data-controls]')) return;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = {
      mode: e.shiftKey || e.button === 1 ? 'pan' : 'rotate',
      x: e.clientX, y: e.clientY, rot, tilt, tx, ty,
    };
  };
  const onPointerMove: React.PointerEventHandler = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (d.mode === 'pan') { setTx(d.tx + dx); setTy(d.ty + dy); }
    else {
      setRot(d.rot + dx * 0.006);
      setTilt(Math.min(0.95, Math.max(0.16, d.tilt + dy * 0.0016)));
    }
  };
  const onPointerUp = () => { dragRef.current = null; };

  const btn = 'p-2 rounded-lg bg-white/90 hover:bg-white border border-gray-200 text-gray-600 shadow-sm transition-colors';
  const { P, c, s } = view;

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
            /* Гадагш нормалийг эргүүлээд дэлгэц дээр аль тийш харснаар гэрэлтүүлнэ */
            const nx = -(y2 - y1), ny = x2 - x1;
            const nrx = nx * c - ny * s, nry = nx * s + ny * c;
            const facesRight = (nrx - nry) > 0;
            return (
              <g key={i}>
                <polygon points={pts([t1, t2, b2, b1])} fill={facesRight ? '#c3ccd8' : '#f1f5f9'} />
                <line x1={t1[0]} y1={t1[1]} x2={t2[0]} y2={t2[1]} stroke="#ffffff" strokeWidth="1.1" />
              </g>
            );
          })}

          {/* Талбайн дугаар ба хэмжээ — ШАЛАН дээр */}
          {boothLabels.map(l => {
            const p = P(l.x, l.y, 0);
            const d = boothDims[l.t];
            const a = AREA[l.t];
            return (
              <g key={l.t} textAnchor="middle" style={{ pointerEvents: 'none' }}>
                <text x={p[0]} y={p[1]} fontSize="6.5" fontWeight="800" fill="#1e293b"
                  stroke="#ffffff" strokeWidth="1.6" paintOrder="stroke">{l.t}</text>
                {(d || a) && (
                  <text x={p[0]} y={p[1] + 6} fontSize="4.6" fontWeight="600" fill="#475569"
                    stroke="#ffffff" strokeWidth="1.3" paintOrder="stroke">
                    {d ? `${d[0]}X${d[1]}` : ''}{d && a ? ' · ' : ''}{a ? `${a}м²` : ''}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <div data-controls className="absolute right-3 top-3 flex items-center gap-1.5 z-10">
          <button onClick={() => spin(-0.3)} className={btn} title="Зүүн эргүүлэх"><RotateCcw size={16} /></button>
          <button onClick={() => spin(0.3)} className={btn} title="Баруун эргүүлэх"><RotateCw size={16} /></button>
          <button onClick={() => zoom(1.35)} className={btn} title="Томруулах"><ZoomIn size={16} /></button>
          <button onClick={() => zoom(0.74)} className={btn} title="Жижигрүүлэх"><ZoomOut size={16} /></button>
          <button onClick={reset} className={btn} title="Хэвд оруулах"><Crosshair size={16} /></button>
          <button onClick={toggleFullscreen} className={btn} title={expanded ? 'Бүтэн дэлгэцээс гарах' : 'Бүтэн дэлгэц'}>
            {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        <div className="absolute left-3 bottom-3 text-[11px] text-gray-600 bg-white/85 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-200">
          Чирж эргүүлэх · Shift + чирж зөөх · Дугуй эргүүлж томруулах
        </div>
      </div>
    </div>
  );
};
