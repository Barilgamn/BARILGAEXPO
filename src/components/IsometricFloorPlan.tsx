import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { booths, Booth, BoothStatus, STATUS_LABELS, getBoothPrice, CATEGORY_LABELS } from '../data/booths';
import {
  floorPlanLayout,
  FLOORPLAN_VIEWBOX,
  FLOORPLAN_STAGE,
  FLOORPLAN_GATE,
} from '../data/floorPlanLayout';

type Section = 'A' | 'B' | 'G';

interface Props {
  statusOf?: (b: Booth) => BoothStatus;
}

/* Изометрик проекц: дэлгэцийн координат руу хөрвүүлнэ */
const COS = 0.866;
const SIN = 0.5;
const iso = (x: number, y: number, z = 0): [number, number] => [(x - y) * COS, (x + y) * SIN - z];
const pts = (arr: [number, number][]) => arr.map(p => p.join(',')).join(' ');

/* Секц тус бүрийн өнгө (дээд тал / гэрэлтэй тал / сүүдэртэй тал) */
const SECTION_FILL: Record<Section, { top: string; left: string; right: string }> = {
  A: { top: '#16a34a', left: '#15803d', right: '#166534' },
  B: { top: '#f59e0b', left: '#d97706', right: '#b45309' },
  G: { top: '#0ea5e9', left: '#0284c7', right: '#0369a1' },
};
const OCCUPIED_FILL = { top: '#cbd5e1', left: '#94a3b8', right: '#64748b' };
const RESERVED_FILL = { top: '#fbbf24', left: '#f59e0b', right: '#d97706' };

const SECTION_META: { key: Section; label: string; desc: string }[] = [
  { key: 'A', label: 'A танхим', desc: 'Үндсэн танхим' },
  { key: 'B', label: 'B танхим', desc: '2-р давхар' },
  { key: 'G', label: 'Гадаа талбай', desc: 'Гадна зогсоол' },
];

const BOOTH_DEPTH = 26;

export const IsometricFloorPlan: React.FC<Props> = ({ statusOf }) => {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [selected, setSelected] = useState<Booth | null>(null);
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const eff = (b: Booth) => (statusOf ? statusOf(b) : b.status);

  /* Проекц хийсний дараах хүрээ (viewBox) — бүх цэгийг багтаана */
  const vb = useMemo(() => {
    const { w, h } = FLOORPLAN_VIEWBOX;
    const corners = [iso(0, 0), iso(w, 0), iso(0, h + 80), iso(w, h + 80)];
    const xs = corners.map(c => c[0]);
    const ys = corners.map(c => c[1]);
    const minX = Math.min(...xs) - 40;
    const minY = Math.min(...ys) - 90;
    return { minX, minY, w: Math.max(...xs) - minX + 80, h: Math.max(...ys) - minY + 130 };
  }, []);

  /* Талбайг зурах дараалал: арынхаас урагшаа (x+y өсөхөөр) */
  const ordered = useMemo(() => {
    return booths
      .filter(b => floorPlanLayout[b.id])
      .slice()
      .sort((a, bb) => {
        const ra = floorPlanLayout[a.id];
        const rb = floorPlanLayout[bb.id];
        return (ra.x + ra.y + ra.w + ra.h) - (rb.x + rb.y + rb.w + rb.h);
      });
  }, []);

  const stats = useMemo(() => {
    const bySec: Record<Section, { total: number; free: number }> = {
      A: { total: 0, free: 0 }, B: { total: 0, free: 0 }, G: { total: 0, free: 0 },
    };
    booths.forEach(b => {
      bySec[b.section].total += 1;
      if (eff(b) === 'available') bySec[b.section].free += 1;
    });
    return bySec;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusOf]);

  const clampScale = (s: number) => Math.min(6, Math.max(0.6, s));
  const zoom = (f: number) => setScale(s => clampScale(s * f));
  const reset = () => { setScale(1); setTx(0); setTy(0); };

  const onWheel: React.WheelEventHandler = (e) => { e.preventDefault(); zoom(e.deltaY < 0 ? 1.12 : 0.89); };
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

  /* Нэг талбайг 3D хайрцаг маягаар зурах */
  const renderBooth = (b: Booth) => {
    const r = floorPlanLayout[b.id];
    const st = eff(b);
    const dim = activeSection !== null && b.section !== activeSection;
    const isSel = selected?.id === b.id;
    const depth = isSel ? BOOTH_DEPTH + 14 : BOOTH_DEPTH;

    const fills = st === 'occupied' ? OCCUPIED_FILL : st === 'reserved' ? RESERVED_FILL : SECTION_FILL[b.section];

    /* Дөрвөн булан (дээд гадаргуу — z=depth, суурь — z=0) */
    const tNW = iso(r.x, r.y, depth);
    const tNE = iso(r.x + r.w, r.y, depth);
    const tSE = iso(r.x + r.w, r.y + r.h, depth);
    const tSW = iso(r.x, r.y + r.h, depth);
    const bSE = iso(r.x + r.w, r.y + r.h, 0);
    const bSW = iso(r.x, r.y + r.h, 0);
    const bNE = iso(r.x + r.w, r.y, 0);

    const center = iso(r.x + r.w / 2, r.y + r.h / 2, depth);
    const fontSize = Math.min(15, Math.max(9, Math.min(r.w, r.h) / 3.4));

    return (
      <g
        key={b.id}
        onClick={(e) => { e.stopPropagation(); setSelected(b); }}
        style={{ cursor: 'pointer', opacity: dim ? 0.13 : 1, transition: 'opacity 0.15s' }}
      >
        {/* Зүүн урд тал (сүүдэртэй) */}
        <polygon points={pts([tSW, tSE, bSE, bSW])} fill={fills.left} />
        {/* Баруун урд тал */}
        <polygon points={pts([tSE, tNE, bNE, bSE])} fill={fills.right} />
        {/* Дээд тал */}
        <polygon
          points={pts([tNW, tNE, tSE, tSW])}
          fill={fills.top}
          stroke={isSel ? '#1d4ed8' : 'rgba(255,255,255,0.55)'}
          strokeWidth={isSel ? 3 : 1}
        />
        <text
          x={center[0]} y={center[1]}
          textAnchor="middle" dominantBaseline="central"
          fontSize={fontSize} fontWeight="800"
          fill={st === 'occupied' ? '#475569' : '#ffffff'}
          style={{ pointerEvents: 'none' }}
        >
          {b.id}
        </text>
      </g>
    );
  };

  const { w: FW, h: FH } = FLOORPLAN_VIEWBOX;

  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white">
      {/* Секц сонголтын табууд */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/60">
        <div className="flex flex-wrap gap-2">
          {SECTION_META.map(s => {
            const on = activeSection === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setActiveSection(on ? null : s.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-left transition-all ${on ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
              >
                <span className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: SECTION_FILL[s.key].top }} />
                <span>
                  <span className={`block text-xs font-bold ${on ? 'text-blue-700' : 'text-gray-800'}`}>{s.label}</span>
                  <span className="block text-[10px] text-gray-500">{s.desc} · Сул {stats[s.key].free}/{stats[s.key].total}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => zoom(1.25)} className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-600" title="Томруулах"><ZoomIn size={16} /></button>
          <button onClick={() => zoom(0.8)} className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-600" title="Жижигрүүлэх"><ZoomOut size={16} /></button>
          <button onClick={reset} className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-600" title="Хэвд оруулах"><Maximize2 size={16} /></button>
        </div>
      </div>

      {/* Изометрик зураглал */}
      <div
        className="relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{ height: 560, touchAction: 'none', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onClick={() => setSelected(null)}
      >
        <svg
          viewBox={`${vb.minX} ${vb.minY} ${vb.w} ${vb.h}`}
          className="w-full h-full"
          style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin: 'center center', transition: dragRef.current ? 'none' : 'transform 0.12s ease-out' }}
        >
          {/* Шал */}
          <polygon points={pts([iso(-60, -60), iso(FW + 60, -60), iso(FW + 60, FH + 90), iso(-60, FH + 90)])} fill="#334155" opacity="0.6" />
          <polygon points={pts([iso(340, 350), iso(1670, 350), iso(1670, 1160), iso(340, 1160)])} fill="#475569" opacity="0.8" />

          {/* Хаалга */}
          <polygon
            points={pts([iso(FLOORPLAN_GATE.x, FLOORPLAN_GATE.y, 4), iso(FLOORPLAN_GATE.x + FLOORPLAN_GATE.w, FLOORPLAN_GATE.y, 4), iso(FLOORPLAN_GATE.x + FLOORPLAN_GATE.w, FLOORPLAN_GATE.y + FLOORPLAN_GATE.h, 4), iso(FLOORPLAN_GATE.x, FLOORPLAN_GATE.y + FLOORPLAN_GATE.h, 4)])}
            fill="#e2e8f0"
          />
          <text {...(() => { const c = iso(FLOORPLAN_GATE.x + FLOORPLAN_GATE.w / 2, FLOORPLAN_GATE.y - 30, 4); return { x: c[0], y: c[1] }; })()} textAnchor="middle" fill="#94a3b8" fontSize="20" fontWeight="700">ENTRANCE</text>

          {/* Стэйж */}
          {(() => {
            const s = FLOORPLAN_STAGE;
            const d = 34;
            const tNW = iso(s.x, s.y, d); const tNE = iso(s.x + s.w, s.y, d);
            const tSE = iso(s.x + s.w, s.y + s.h, d); const tSW = iso(s.x, s.y + s.h, d);
            const bSE = iso(s.x + s.w, s.y + s.h, 0); const bSW = iso(s.x, s.y + s.h, 0); const bNE = iso(s.x + s.w, s.y, 0);
            const c = iso(s.x + s.w / 2, s.y + s.h / 2, d);
            return (
              <g>
                <polygon points={pts([tSW, tSE, bSE, bSW])} fill="#b91c1c" />
                <polygon points={pts([tSE, tNE, bNE, bSE])} fill="#991b1b" />
                <polygon points={pts([tNW, tNE, tSE, tSW])} fill="#ef4444" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                <text x={c[0]} y={c[1]} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="20" fontWeight="800" style={{ pointerEvents: 'none' }}>STAGE</text>
              </g>
            );
          })()}

          {/* Талбайнууд */}
          {ordered.map(renderBooth)}
        </svg>

        {/* Сонгосон талбайн мэдээлэл */}
        {selected && (
          <div
            className="absolute left-3 bottom-3 bg-white rounded-xl shadow-xl border border-gray-100 p-3.5 text-sm max-w-[270px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="font-extrabold text-gray-900 text-base">{selected.id}</span>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 text-xs">✕</button>
            </div>
            <div className="text-gray-600">{CATEGORY_LABELS[selected.category]}</div>
            {selected.area > 0 && <div className="text-gray-600">{selected.area} м² · {selected.pricePerM2.toLocaleString()}₮/м²</div>}
            <div className="text-gray-900 font-semibold">{getBoothPrice(selected).toLocaleString()}₮</div>
            <div className="mt-1.5 flex items-center gap-2">
              <span
                className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${eff(selected) === 'available' ? 'text-emerald-700 bg-emerald-50' : eff(selected) === 'reserved' ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50'}`}
              >
                {STATUS_LABELS[eff(selected)]}
              </span>
            </div>
            {selected.company && <div className="text-gray-500 text-xs mt-1">{selected.company}</div>}
            {eff(selected) === 'available' && (
              <Link
                to="/booking"
                className="mt-2.5 block text-center bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
              >
                Энэ талбайг захиалах →
              </Link>
            )}
          </div>
        )}

        {/* Төлвийн тайлбар */}
        <div className="absolute right-3 top-3 bg-slate-900/70 backdrop-blur rounded-xl px-3 py-2.5 space-y-1.5">
          {[
            { c: '#16a34a', l: 'Сул (A танхим)' },
            { c: '#f59e0b', l: 'Сул (B танхим)' },
            { c: '#0ea5e9', l: 'Сул (Гадаа)' },
            { c: '#cbd5e1', l: 'Захиалагдсан' },
          ].map(i => (
            <div key={i.l} className="flex items-center gap-2 text-[11px] text-slate-200">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: i.c }} />
              {i.l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
