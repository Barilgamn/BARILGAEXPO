import React, { useMemo, useRef, useState } from 'react';
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { booths } from '../data/booths';
import {
  floorPlanLayout,
  BoothRect,
  FLOORPLAN_STAGE,
  FLOORPLAN_GATE,
} from '../data/floorPlanLayout';

/** Изометрик проекцын хэвтээ агшилт (30°) */
const COS = 0.866;

/** Бүх талбайг багтаах бодит хүрээ — зураглалыг төвлөрүүлж, чанга харуулна */
const BOUNDS = (() => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const key of Object.keys(floorPlanLayout)) {
    const r = floorPlanLayout[key];
    x0 = Math.min(x0, r.x);
    y0 = Math.min(y0, r.y);
    x1 = Math.max(x1, r.x + r.w);
    y1 = Math.max(y1, r.y + r.h);
  }
  return { x0, y0, x1, y1 };
})();

const CX = (BOUNDS.x0 + BOUNDS.x1) / 2;
const CY = (BOUNDS.y0 + BOUNDS.y1) / 2;

const BOOTH_DEPTH = 22;
const STAGE_DEPTH = 34;

type Palette = { top: string; light: string; dark: string };

/* Бүх талбай ижил саарал — зөвхөн гэрэл сүүдрээр ялгарна */
const BOOTH: Palette = { top: '#cbd5e1', light: '#93a1b2', dark: '#6d7a8c' };
const BOOTH_HOVER: Palette = { top: '#f1f5f9', light: '#b8c4d2', dark: '#8d99a9' };
const STAGE: Palette = { top: '#e05a4f', light: '#b3453c', dark: '#8f352e' };
const GATE: Palette = { top: '#e2e8f0', light: '#b6c0cc', dark: '#95a1b0' };

const pts = (arr: [number, number][]) => arr.map(p => p.join(',')).join(' ');

/** Хэвтээ эргэлт (rot) ба хазайлт (tilt)-аас хамаарсан проекц + гүний коэффициент */
const makeView = (rot: number, tilt: number) => {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const P = (dx: number, dy: number, z: number): [number, number] => {
    const rx = dx * c - dy * s;
    const ry = dx * s + dy * c;
    return [(rx - ry) * COS, (rx + ry) * tilt - z];
  };
  /* Гүн = rx + ry = dx*(c+s) + dy*(c−s). Их байх тусам харагчид ойр. */
  return { P, a: c + s, b: c - s, c, s };
};

type View = ReturnType<typeof makeView>;

/** Тэгш өнцөгтийн хамгийн ХОЛ булангийн гүн */
const farDepth = (r: BoothRect, view: View) => {
  const dx = view.a > 0 ? r.x - CX : r.x + r.w - CX;
  const dy = view.b > 0 ? r.y - CY : r.y + r.h - CY;
  return view.a * dx + view.b * dy;
};

/** Хайрцгийн дэлгэц дээрх хүрээ (extrusion-ыг оруулж) */
const screenBBox = (r: BoothRect, depth: number, view: View): [number, number, number, number] => {
  const pxs: number[] = [];
  const pys: number[] = [];
  const cs: [number, number][] = [
    [r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h],
  ];
  for (const [px, py] of cs) {
    for (const z of [0, depth]) {
      const [sx, sy] = view.P(px - CX, py - CY, z);
      pxs.push(sx);
      pys.push(sy);
    }
  }
  return [Math.min(...pxs), Math.min(...pys), Math.max(...pxs), Math.max(...pys)];
};

/**
 * Painter's algorithm-ийн зөв дараалал.
 * Дэлгэц дээр давхцаж буй хос бүрт "аль нь ард" гэдгийг тэнхлэгийн тусгаарлалтаар
 * тодорхойлж граф үүсгээд топологи эрэмбэлнэ. Ингэснээр аль ч өнцгөөс эргүүлэхэд
 * талбайнууд бие бие рүүгээ давхцахгүй.
 */
const depthSort = <T extends { r: BoothRect; depth: number }>(nodes: T[], view: View): T[] => {
  const n = nodes.length;
  const { a, b } = view;
  const bb = nodes.map(nd => screenBBox(nd.r, nd.depth, view));
  const d = nodes.map(nd => farDepth(nd.r, view));
  const adj: number[][] = Array.from({ length: n }, () => []);
  const indeg = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      /* Дэлгэц дээр огт давхцахгүй бол дараалал хамаагүй */
      if (bb[i][2] <= bb[j][0] || bb[j][2] <= bb[i][0] || bb[i][3] <= bb[j][1] || bb[j][3] <= bb[i][1]) continue;
      const A = nodes[i].r;
      const B = nodes[j].r;
      let behind: number | null = null;
      if (A.x + A.w <= B.x) behind = a > 0 ? i : j;
      else if (B.x + B.w <= A.x) behind = a > 0 ? j : i;
      else if (A.y + A.h <= B.y) behind = b > 0 ? i : j;
      else if (B.y + B.h <= A.y) behind = b > 0 ? j : i;
      if (behind === null) continue;
      const front = behind === i ? j : i;
      adj[behind].push(front);
      indeg[front]++;
    }
  }

  /* Kahn — сонголт бүрт хамгийн хол (ард) байгаагаас нь эхэлнэ */
  const out: T[] = [];
  const used = new Array(n).fill(false);
  for (let k = 0; k < n; k++) {
    let best = -1;
    for (let i = 0; i < n; i++) {
      if (!used[i] && indeg[i] === 0 && (best < 0 || d[i] < d[best])) best = i;
    }
    if (best < 0) {
      /* Мөчлөг тохиолдвол гүнээр нь сонгож үргэлжлүүлнэ */
      for (let i = 0; i < n; i++) if (!used[i] && (best < 0 || d[i] < d[best])) best = i;
    }
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
  view: View;
  label?: string;
  labelFill?: string;
  labelWeight?: number;
  onEnter?: () => void;
  onLeave?: () => void;
}

/** Нэг тэгш өнцөгтийг 3D хайрцаг болгон зурна */
const Box: React.FC<BoxProps> = ({
  r, depth, palette, view, label, labelFill = '#3f4a5a', labelWeight = 800, onEnter, onLeave,
}) => {
  const { P, a, b, c, s } = view;
  const dx0 = r.x - CX;
  const dx1 = r.x + r.w - CX;
  const dy0 = r.y - CY;
  const dy1 = r.y + r.h - CY;

  /* Булангууд: 0=NW 1=NE 2=SE 3=SW */
  const corners: [number, number][] = [[dx0, dy0], [dx1, dy0], [dx1, dy1], [dx0, dy1]];
  const top = corners.map(([x, y]) => P(x, y, depth));
  const bottom = corners.map(([x, y]) => P(x, y, 0));

  /* Тал бүрийн гадагш чиглэсэн нормаль: N, E, S, W */
  const normals: [number, number][] = [[0, -1], [1, 0], [0, 1], [-1, 0]];

  const sides = normals.map((n, i) => {
    /* Зөвхөн харагчид эргэсэн талыг зурна */
    if (n[0] * a + n[1] * b <= 0) return null;
    const j = (i + 1) % 4;
    /* Дэлгэц дээр зүүн/баруун аль тийш харсныг тодорхойлж гэрэлтүүлнэ */
    const nrx = n[0] * c - n[1] * s;
    const nry = n[0] * s + n[1] * c;
    const facesRight = (nrx - nry) * COS > 0;
    return (
      <polygon
        key={i}
        points={pts([top[i], top[j], bottom[j], bottom[i]])}
        fill={facesRight ? palette.dark : palette.light}
      />
    );
  });

  const cx = (top[0][0] + top[2][0]) / 2;
  const cy = (top[0][1] + top[2][1]) / 2;
  const fontSize = Math.min(15, Math.max(8.5, Math.min(r.w, r.h) / 3.4));

  return (
    <g onMouseEnter={onEnter} onMouseLeave={onLeave} style={{ cursor: onEnter ? 'pointer' : 'default' }}>
      {sides}
      <polygon points={pts(top)} fill={palette.top} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      {label && (
        <text
          x={cx} y={cy}
          textAnchor="middle" dominantBaseline="central"
          fontSize={fontSize} fontWeight={labelWeight} fill={labelFill}
          style={{ pointerEvents: 'none' }}
        >
          {label}
        </text>
      )}
    </g>
  );
};

type Item = { kind: 'booth' | 'stage' | 'gate'; id: string; r: BoothRect; depth: number };

export const IsometricFloorPlan: React.FC = () => {
  const [rot, setRot] = useState(0);
  const [tilt, setTilt] = useState(0.5);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [hover, setHover] = useState<string | null>(null);

  const dragRef = useRef<
    { mode: 'rotate' | 'pan'; x: number; y: number; rot: number; tilt: number; tx: number; ty: number } | null
  >(null);

  const view = useMemo(() => makeView(rot, tilt), [rot, tilt]);

  /* Бүх биетийг арынхаас урагш зөв дараалалд оруулна */
  const items = useMemo<Item[]>(() => {
    const list: Item[] = booths
      .filter(b => floorPlanLayout[b.id])
      .map(b => ({ kind: 'booth' as const, id: b.id, r: floorPlanLayout[b.id], depth: BOOTH_DEPTH }));
    list.push({ kind: 'stage', id: '__stage', r: FLOORPLAN_STAGE, depth: STAGE_DEPTH });
    list.push({ kind: 'gate', id: '__gate', r: FLOORPLAN_GATE, depth: 5 });
    return depthSort(list, view);
  }, [view]);

  /* Эргэлтэнд тохирсон хүрээ — зураглал үргэлж дүүрэн харагдана */
  const { vb, floorPoly, innerPoly } = useMemo(() => {
    const { P } = view;
    const m = 60;
    const outer: [number, number][] = [
      [BOUNDS.x0 - m - CX, BOUNDS.y0 - m - CY],
      [BOUNDS.x1 + m - CX, BOUNDS.y0 - m - CY],
      [BOUNDS.x1 + m - CX, BOUNDS.y1 + m - CY],
      [BOUNDS.x0 - m - CX, BOUNDS.y1 + m - CY],
    ];
    const projected = outer.map(([x, y]) => P(x, y, 0));
    const xs = projected.map(p => p[0]);
    const ys = projected.map(p => p[1]);
    const minX = Math.min(...xs) - 20;
    const minY = Math.min(...ys) - 70;
    return {
      vb: { minX, minY, w: Math.max(...xs) - minX + 20, h: Math.max(...ys) - minY + 60 },
      floorPoly: pts(projected),
      innerPoly: pts([
        P(340 - CX, 350 - CY, 0),
        P(1670 - CX, 350 - CY, 0),
        P(1670 - CX, 1160 - CY, 0),
        P(340 - CX, 1160 - CY, 0),
      ]),
    };
  }, [view]);

  const clampScale = (s: number) => Math.min(6, Math.max(0.55, s));
  const zoom = (f: number) => setScale(s => clampScale(s * f));
  const spin = (d: number) => setRot(r => r + d);
  const reset = () => { setRot(0); setTilt(0.5); setScale(1); setTx(0); setTy(0); };

  const onWheel: React.WheelEventHandler = (e) => {
    e.preventDefault();
    zoom(e.deltaY < 0 ? 1.12 : 0.89);
  };

  const onPointerDown: React.PointerEventHandler = (e) => {
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = {
      mode: e.shiftKey || e.button === 1 ? 'pan' : 'rotate',
      x: e.clientX, y: e.clientY, rot, tilt, tx, ty,
    };
  };

  const onPointerMove: React.PointerEventHandler = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (d.mode === 'pan') {
      setTx(d.tx + dx);
      setTy(d.ty + dy);
    } else {
      setRot(d.rot + dx * 0.0055);
      setTilt(Math.min(0.92, Math.max(0.16, d.tilt + dy * 0.0016)));
    }
  };

  const onPointerUp = () => { dragRef.current = null; };

  const btn = 'p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 transition-colors';

  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white">
      <div
        className="relative overflow-hidden select-none cursor-grab active:cursor-grabbing"
        style={{
          height: 600,
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
          viewBox={`${vb.minX} ${vb.minY} ${vb.w} ${vb.h}`}
          className="w-full h-full"
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: dragRef.current ? 'none' : 'transform 0.14s ease-out',
          }}
        >
          <polygon points={floorPoly} fill="#1c2739" />
          <polygon points={innerPoly} fill="#28344a" />

          {items.map(it => {
            if (it.kind === 'stage') {
              return (
                <Box key={it.id} r={it.r} depth={it.depth} palette={STAGE} view={view}
                  label="STAGE" labelFill="#ffffff" labelWeight={900} />
              );
            }
            if (it.kind === 'gate') {
              return <Box key={it.id} r={it.r} depth={it.depth} palette={GATE} view={view} />;
            }
            return (
              <Box
                key={it.id}
                r={it.r}
                depth={it.depth}
                palette={hover === it.id ? BOOTH_HOVER : BOOTH}
                view={view}
                label={it.id}
                onEnter={() => setHover(it.id)}
                onLeave={() => setHover(null)}
              />
            );
          })}

          {(() => {
            const p = view.P(FLOORPLAN_GATE.x + FLOORPLAN_GATE.w / 2 - CX, FLOORPLAN_GATE.y - 48 - CY, 5);
            return (
              <text x={p[0]} y={p[1]} textAnchor="middle" fill="#8fa0b6" fontSize="22" fontWeight="700"
                style={{ pointerEvents: 'none' }}>
                ENTRANCE
              </text>
            );
          })()}
        </svg>

        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          <button onClick={() => spin(-0.28)} className={btn} title="Зүүн эргүүлэх"><RotateCcw size={16} /></button>
          <button onClick={() => spin(0.28)} className={btn} title="Баруун эргүүлэх"><RotateCw size={16} /></button>
          <button onClick={() => zoom(1.25)} className={btn} title="Томруулах"><ZoomIn size={16} /></button>
          <button onClick={() => zoom(0.8)} className={btn} title="Жижигрүүлэх"><ZoomOut size={16} /></button>
          <button onClick={reset} className={btn} title="Хэвд оруулах"><Maximize2 size={16} /></button>
        </div>

        <div className="absolute left-3 bottom-3 text-[11px] text-slate-400 bg-slate-900/60 backdrop-blur px-3 py-1.5 rounded-lg">
          Чирж эргүүлэх · Shift + чирж зөөх · Дугуй эргүүлж томруулах
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
