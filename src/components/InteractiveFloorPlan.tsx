import React, { useMemo, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Check } from 'lucide-react';
import { booths, Booth, BoothStatus, CATEGORY_COLORS, CATEGORY_LABELS, STATUS_LABELS, getBoothPrice } from '../data/booths';
import {
  floorPlanLayout,
  FLOORPLAN_VIEWBOX,
  FLOORPLAN_STAGE,
  FLOORPLAN_PHOTOBOOTH,
  FLOORPLAN_GATE,
} from '../data/floorPlanLayout';

type Cat = Booth['category'];

interface Props {
  /** Effective status resolver (override-aware). Defaults to the booth's baseline status. */
  statusOf?: (b: Booth) => BoothStatus;
}

const STATUS_STROKE: Record<BoothStatus, string> = {
  available: '#10b981',
  occupied: '#dc2626',
  reserved: '#f59e0b',
};

export const InteractiveFloorPlan: React.FC<Props> = ({ statusOf }) => {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [activeCat, setActiveCat] = useState<Cat | null>(null);
  const [selected, setSelected] = useState<Booth | null>(null);
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const eff = (b: Booth) => (statusOf ? statusOf(b) : b.status);

  const legend = useMemo(() => {
    const cats: Cat[] = ['sponsor', 'supporting', 'standard', 'b', 'g'];
    return cats.map(c => ({ cat: c, color: CATEGORY_COLORS[c], label: CATEGORY_LABELS[c] }));
  }, []);

  const clampScale = (s: number) => Math.min(6, Math.max(0.6, s));
  const zoom = (factor: number) => setScale(s => clampScale(s * factor));
  const reset = () => { setScale(1); setTx(0); setTy(0); };

  const onWheel: React.WheelEventHandler = (e) => {
    e.preventDefault();
    zoom(e.deltaY < 0 ? 1.12 : 0.89);
  };
  const onPointerDown: React.PointerEventHandler = (e) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, tx, ty };
  };
  const onPointerMove: React.PointerEventHandler = (e) => {
    if (!dragRef.current) return;
    setTx(dragRef.current.tx + (e.clientX - dragRef.current.x));
    setTy(dragRef.current.ty + (e.clientY - dragRef.current.y));
  };
  const onPointerUp = () => { dragRef.current = null; };

  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
        <span className="text-sm font-semibold text-gray-700">Танхимын зураглал</span>
        <div className="flex items-center gap-1.5">
          <button onClick={() => zoom(1.25)} className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-600" title="Томруулах"><ZoomIn size={16} /></button>
          <button onClick={() => zoom(0.8)} className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-600" title="Жижигрүүлэх"><ZoomOut size={16} /></button>
          <button onClick={reset} className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-600" title="Хэвд оруулах"><Maximize2 size={16} /></button>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="relative bg-slate-50 overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{ height: 520, touchAction: 'none' }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <svg
          viewBox={`0 0 ${FLOORPLAN_VIEWBOX.w} ${FLOORPLAN_VIEWBOX.h}`}
          className="w-full h-full"
          style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin: 'center center', transition: dragRef.current ? 'none' : 'transform 0.12s ease-out' }}
        >
          {/* hall outline (stadium) */}
          <rect x="150" y="6" width="1700" height="1320" rx="260" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
          {/* inner exhibitor floor */}
          <rect x="360" y="370" width="1290" height="770" rx="14" fill="#fafafa" stroke="#e5e7eb" strokeWidth="2" />
          {/* gate (Хаалга) */}
          <rect x={FLOORPLAN_GATE.x} y={FLOORPLAN_GATE.y} width={FLOORPLAN_GATE.w} height={FLOORPLAN_GATE.h} rx="3" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
          <text x={FLOORPLAN_GATE.x + FLOORPLAN_GATE.w / 2} y={FLOORPLAN_GATE.y + FLOORPLAN_GATE.h / 2} textAnchor="middle" dominantBaseline="central" fill="#64748b" fontSize="16">Хаалга</text>
          {/* seating dots in front of stage */}
          {Array.from({ length: 4 }).flatMap((_, r) =>
            Array.from({ length: 7 }).map((__, c) => (
              <circle key={`d${r}-${c}`} cx={918 + c * 22} cy={965 + r * 22} r="5" fill="#e2e8f0" />
            ))
          )}
          {/* stage */}
          <rect x={FLOORPLAN_STAGE.x} y={FLOORPLAN_STAGE.y} width={FLOORPLAN_STAGE.w} height={FLOORPLAN_STAGE.h} rx="6" fill="#ef4444" />
          <text x={FLOORPLAN_STAGE.x + FLOORPLAN_STAGE.w / 2} y={FLOORPLAN_STAGE.y + FLOORPLAN_STAGE.h / 2} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="22" fontWeight="700">STAGE 8×5</text>
          {/* photo booth */}
          <rect x={FLOORPLAN_PHOTOBOOTH.x} y={FLOORPLAN_PHOTOBOOTH.y} width={FLOORPLAN_PHOTOBOOTH.w} height={FLOORPLAN_PHOTOBOOTH.h} rx="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
          <text x={FLOORPLAN_PHOTOBOOTH.x + FLOORPLAN_PHOTOBOOTH.w / 2} y={FLOORPLAN_PHOTOBOOTH.y + FLOORPLAN_PHOTOBOOTH.h / 2} textAnchor="middle" dominantBaseline="central" fill="#64748b" fontSize="16">Photo Booth</text>

          {/* booths */}
          {booths.map(b => {
            const r = floorPlanLayout[b.id];
            if (!r) return null;
            const st = eff(b);
            const dim = activeCat !== null && b.category !== activeCat;
            const isSel = selected?.id === b.id;
            return (
              <g
                key={b.id}
                onClick={(e) => { e.stopPropagation(); setSelected(b); }}
                style={{ cursor: 'pointer', opacity: dim ? 0.18 : 1, transition: 'opacity 0.15s' }}
              >
                <rect
                  x={r.x} y={r.y} width={r.w} height={r.h} rx="3"
                  fill={CATEGORY_COLORS[b.category]}
                  stroke={isSel ? '#1d4ed8' : STATUS_STROKE[st]}
                  strokeWidth={isSel ? 3 : 1.4}
                />
                <text x={r.x + r.w / 2} y={r.y + r.h / 2} textAnchor="middle" dominantBaseline="central" fontSize={Math.min(13, r.w / 3.2)} fontWeight="700" fill="#334155">{b.id}</text>
                {st === 'available' && (
                  <text x={r.x + r.w - 5} y={r.y + r.h - 4} textAnchor="end" fontSize="11" fill="#059669" fontWeight="900">✓</text>
                )}
                {st === 'reserved' && (
                  <text x={r.x + r.w - 5} y={r.y + r.h - 4} textAnchor="end" fontSize="11" fill="#d97706" fontWeight="900">◆</text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Selected booth tooltip */}
        {selected && (
          <div className="absolute left-3 bottom-3 bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-sm max-w-[260px]">
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="font-extrabold text-gray-900">{selected.id}</span>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 text-xs">✕</button>
            </div>
            <div className="text-gray-600">{CATEGORY_LABELS[selected.category]}</div>
            {selected.area > 0 && <div className="text-gray-600">{selected.area} м² · {selected.pricePerM2.toLocaleString()}₮/м²</div>}
            <div className="text-gray-900 font-semibold">{getBoothPrice(selected).toLocaleString()}₮</div>
            <div className="mt-1">
              <span
                className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ color: STATUS_STROKE[eff(selected)], background: STATUS_STROKE[eff(selected)] + '22' }}
              >
                {STATUS_LABELS[eff(selected)]}
              </span>
            </div>
            {selected.company && <div className="text-gray-500 text-xs mt-1">{selected.company}</div>}
          </div>
        )}
      </div>

      {/* Legend — click to highlight category */}
      <div className="flex flex-wrap gap-2 p-3 border-t border-gray-100 bg-white">
        {legend.map(item => {
          const on = activeCat === item.cat;
          return (
            <button
              key={item.cat}
              onClick={() => setActiveCat(on ? null : item.cat)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${on ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <span className="w-3.5 h-3.5 rounded-sm border border-gray-300" style={{ backgroundColor: item.color }} />
              {item.label}
              {on && <Check size={13} />}
            </button>
          );
        })}
        {activeCat && (
          <button onClick={() => setActiveCat(null)} className="px-3 py-1.5 rounded-full text-xs font-semibold text-gray-500 hover:text-gray-800 underline">
            Цэвэрлэх
          </button>
        )}
      </div>
    </div>
  );
};
