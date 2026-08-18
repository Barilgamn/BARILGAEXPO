import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Crosshair } from 'lucide-react';
import { booths } from '../data/booths';
import {
  floorPlanLayout,
  BoothRect,
  FLOORPLAN_STAGE,
  FLOORPLAN_GATE,
} from '../data/floorPlanLayout';

/**
 * Харах өнцөг тогтмол: rot = −45°, tilt = 0.866.
 * Энэ утганд изометрик проекц тэнхлэгт зэрэгцэж, талбайнууд жинхэнэ
 * тэгш өнцөгт хэлбэрээр, өмнөх талын мөр нь л 3D мэдрэмж өгнө.
 */
const COS = 0.866;
const ROT = -Math.PI / 4;
const TILT = 0.866;
const C = Math.cos(ROT);
const SN = Math.sin(ROT);
/* Гүний коэффициент: гүн = dx*(C+SN) + dy*(C−SN) */
const A_COEF = C + SN;
const B_COEF = C - SN;
const EPS = 1e-6;

const BOOTH_DEPTH = 9;
const STAGE_DEPTH = 14;

type Palette = { top: string; light: string; dark: string };

/* Бүх талбай ижил саарал — зөвхөн гэрэл сүүдрээр ялгарна */
const BOOTH: Palette = { top: '#cbd5e1', light: '#93a1b2', dark: '#6d7a8c' };
const BOOTH_HOVER: Palette = { top: '#f8fafc', light: '#b8c4d2', dark: '#8d99a9' };
const STAGE: Palette = { top: '#e05a4f', light: '#b3453c', dark: '#8f352e' };
const GATE: Palette = { top: '#e2e8f0', light: '#b6c0cc', dark: '#95a1b0' };

/** Бүх талбайг багтаах хүрээ — зураглалыг төвлөрүүлнэ */
const BOUNDS = (() => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const key of Object.keys(floorPlanLayout)) {
    const r = floorPlanLayout[key];
    x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y);
    x1 = Math.max(x1, r.x + r.w); y1 = Math.max(y1, r.y + r.h);
  }
  return { x0, y0, x1, y1 };
})();
const CX = (BOUNDS.x0 + BOUNDS.x1) / 2;
const CY = (BOUNDS.y0 + BOUNDS.y1) / 2;

const P = (dx: number, dy: number, z: number): [number, number] => {
  const rx = dx * C - dy * SN;
  const ry = dx * SN + dy * C;
  return [(rx - ry) * COS, (rx + ry) * TILT - z];
};

const pts = (arr: [number, number][]) => arr.map(p => p.join(',')).join(' ');

const farDepth = (r: BoothRect) => {
  const dx = A_COEF > 0 ? r.x - CX : r.x + r.w - CX;
  const dy = B_COEF > 0 ? r.y - CY : r.y + r.h - CY;
  return A_COEF * dx + B_COEF * dy;
};

const screenBBox = (r: BoothRect, depth: number): [number, number, number, number] => {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [px, py] of [[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h]]) {
    for (const z of [0, depth]) {
      const [sx, sy] = P(px - CX, py - CY, z);
      xs.push(sx); ys.push(sy);
    }
  }
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
};

/**
 * Painter's algorithm: дэлгэц дээр давхцаж буй хос бүрт "аль нь ард" гэдгийг
 * тэнхлэгийн тусгаарлалтаар тогтоож граф үүсгээд топологи эрэмбэлнэ.
 */
const depthSort = <T extends { r: BoothRect; depth: number }>(nodes: T[]): T[] => {
  const n = nodes.length;
  const bb = nodes.map(nd => screenBBox(nd.r, nd.depth));
  const d = nodes.map(nd => farDepth(nd.r));
  const adj: number[][] = Array.from({ length: n }, () => []);
  const indeg = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (bb[i][2] <= bb[j][0] || bb[j][2] <= bb[i][0] || bb[i][3] <= bb[j][1] || bb[j][3] <= bb[i][1]) continue;
      const A = nodes[i].r;
      const B = nodes[j].r;
      let behind: number | null = null;
      if (Math.abs(A_COEF) > EPS && A.x + A.w <= B.x) behind = A_COEF > 0 ? i : j;
      else if (Math.abs(A_COEF) > EPS && B.x + B.w <= A.x) behind = A_COEF > 0 ? j : i;
      else if (Math.abs(B_COEF) > EPS && A.y + A.h <= B.y) behind = B_COEF > 0 ? i : j;
      else if (Math.abs(B_COEF) > EPS && B.y + B.h <= A.y) behind = B_COEF > 0 ? j : i;
      if (behind === null) continue;
      const front = behind === i ? j : i;
      adj[behind].push(front);
      indeg[front]++;
    }
  }

  const out: T[] = [];
  const used = new Array(n).fill(false);
  for (let k = 0; k < n; k++) {
    let best = -1;
    for (let i = 0; i < n; i++) if (!used[i] && indeg[i] === 0 && (best < 0 || d[i] < d[best])) best = i;
    if (best < 0) for (let i = 0; i < n; i++) if (!used[i] && (best < 0 || d[i] < d[best])) best = i;
    used[best] = true;
    out.push(nodes[best]);
    for (const v of adj[best]) indeg[v]--;
  }
  return out;
};

interface BoxProps {
  r: BoothRect;
  depth: number;
  palette: Palette;
  label?: string;
  labelFill?: string;
  labelWeight?: number;
  onEnter?: () => void;
  onLeave?: () => void;
}

const Box: React.FC<BoxProps> = ({
  r, depth, palette, label, labelFill = '#3f4a5a', labelWeight = 700, onEnter, onLeave,
}) => {
  const dx0 = r.x - CX, dx1 = r.x + r.w - CX;
  const dy0 = r.y - CY, dy1 = r.y + r.h - CY;
  const corners: [number, number][] = [[dx0, dy0], [dx1, dy0], [dx1, dy1], [dx0, dy1]];
  const top = corners.map(([x, y]) => P(x, y, depth));
  const bottom = corners.map(([x, y]) => P(x, y, 0));

  /* Гадагш чиглэсэн нормаль: N, E, S, W — зөвхөн харагдах талыг зурна */
  const normals: [number, number][] = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const sides = normals.map((nm, i) => {
    if (nm[0] * A_COEF + nm[1] * B_COEF <= EPS) return null;
    const j = (i + 1) % 4;
    const nrx = nm[0] * C - nm[1] * SN;
    const nry = nm[0] * SN + nm[1] * C;
    return (
      <polygon
        key={i}
        points={pts([top[i], top[j], bottom[j], bottom[i]])}
        fill={(nrx - nry) * COS > 0 ? palette.dark : palette.light}
      />
    );
  });

  const cx = (top[0][0] + top[2][0]) / 2;
  const cy = (top[0][1] + top[2][1]) / 2;
  const fontSize = Math.min(15, Math.max(7, Math.min(r.w, r.h * 1.4) / 2.6));

  return (
    <g onMouseEnter={onEnter} onMouseLeave={onLeave} style={{ cursor: onEnter ? 'pointer' : 'default' }}>
      {sides}
      <polygon points={pts(top)} fill={palette.top} stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" />
      {label && (
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
          fontSize={fontSize} fontWeight={labelWeight} fill={labelFill} style={{ pointerEvents: 'none' }}>
          {label}
        </text>
      )}
    </g>
  );
};

type Item = { kind: 'booth' | 'stage' | 'gate'; id: string; r: BoothRect; depth: number };

/* Дараалал ба хүрээ өнцөг тогтмол тул нэг л удаа тооцоологдоно */
const ITEMS: Item[] = (() => {
  const list: Item[] = booths
    .filter(b => floorPlanLayout[b.id])
    .map(b => ({ kind: 'booth' as const, id: b.id, r: floorPlanLayout[b.id], depth: BOOTH_DEPTH }));
  list.push({ kind: 'stage', id: '__stage', r: FLOORPLAN_STAGE, depth: STAGE_DEPTH });
  list.push({ kind: 'gate', id: '__gate', r: FLOORPLAN_GATE, depth: 3 });
  return depthSort(list);
})();

const GEO = (() => {
  const m = 26;
  const outer: [number, number][] = [
    [BOUNDS.x0 - m - CX, BOUNDS.y0 - m - CY],
    [BOUNDS.x1 + m - CX, BOUNDS.y0 - m - CY],
    [BOUNDS.x1 + m - CX, BOUNDS.y1 + m - CY],
    [BOUNDS.x0 - m - CX, BOUNDS.y1 + m - CY],
  ];
  const projected = outer.map(([x, y]) => P(x, y, 0));
  const xs = projected.map(p => p[0]);
  const ys = projected.map(p => p[1]);
  const minX = Math.min(...xs) - 14;
  const minY = Math.min(...ys) - 34;
  return {
    vb: { minX, minY, w: Math.max(...xs) - minX + 14, h: Math.max(...ys) - minY + 20 },
    floorPoly: pts(projected),
  };
})();

export const IsometricFloorPlan: React.FC = () => {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const [isFs, setIsFs] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  /* Бүтэн дэлгэц — Fullscreen API */
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

  const clampScale = (s: number) => Math.min(8, Math.max(0.5, s));
  const zoom = (f: number) => setScale(s => clampScale(s * f));
  const reset = () => { setScale(1); setTx(0); setTy(0); };

  const onWheel: React.WheelEventHandler = (e) => {
    e.preventDefault();
    zoom(e.deltaY < 0 ? 1.14 : 0.88);
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

  const btn = 'p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 transition-colors';

  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white">
      <div
        ref={wrapRef}
        className="relative overflow-hidden select-none cursor-grab active:cursor-grabbing"
        style={{
          height: isFs ? '100vh' : 600,
          touchAction: 'none',
          background: 'radial-gradient(120% 100% at 50% 0%, #1e293b 0%, #0f172a 60%, #090f1c 100%)',
        }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <svg
          viewBox={`${GEO.vb.minX} ${GEO.vb.minY} ${GEO.vb.w} ${GEO.vb.h}`}
          className="w-full h-full"
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: dragRef.current ? 'none' : 'transform 0.14s ease-out',
          }}
        >
          <polygon points={GEO.floorPoly} fill="#1c2739" />

          {ITEMS.map(it => {
            if (it.kind === 'stage') {
              return <Box key={it.id} r={it.r} depth={it.depth} palette={STAGE}
                label="STAGE" labelFill="#ffffff" labelWeight={900} />;
            }
            if (it.kind === 'gate') {
              return <Box key={it.id} r={it.r} depth={it.depth} palette={GATE} />;
            }
            return (
              <Box
                key={it.id}
                r={it.r}
                depth={it.depth}
                palette={hover === it.id ? BOOTH_HOVER : BOOTH}
                label={it.id}
                onEnter={() => setHover(it.id)}
                onLeave={() => setHover(null)}
              />
            );
          })}

          {(() => {
            const p = P(FLOORPLAN_GATE.x + FLOORPLAN_GATE.w / 2 - CX, FLOORPLAN_GATE.y + FLOORPLAN_GATE.h + 16 - CY, 3);
            return (
              <text x={p[0]} y={p[1]} textAnchor="middle" fill="#8fa0b6" fontSize="13" fontWeight="700"
                letterSpacing="1.5" style={{ pointerEvents: 'none' }}>
                ENTRANCE
              </text>
            );
          })()}
        </svg>

        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          <button onClick={() => zoom(1.3)} className={btn} title="Томруулах"><ZoomIn size={16} /></button>
          <button onClick={() => zoom(0.77)} className={btn} title="Жижигрүүлэх"><ZoomOut size={16} /></button>
          <button onClick={reset} className={btn} title="Хэвд оруулах"><Crosshair size={16} /></button>
          <button onClick={toggleFullscreen} className={btn} title={isFs ? 'Бүтэн дэлгэцээс гарах' : 'Бүтэн дэлгэц'}>
            {isFs ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        <div className="absolute left-3 bottom-3 text-[11px] text-slate-400 bg-slate-900/60 backdrop-blur px-3 py-1.5 rounded-lg">
          Чирж зөөх · Дугуй эргүүлж томруулах
        </div>

        {hover && (
          <div className="absolute right-3 bottom-3 bg-white/95 backdrop-blur rounded-lg px-3 py-1.5 shadow-lg">
            <span className="font-extrabold text-gray-900 text-sm">{hover}</span>
          </div>
        )}
      </div>
    </div>
  );
};
