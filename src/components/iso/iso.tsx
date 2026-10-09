import React from 'react';

/* ── Изометр зурах жижиг сан ─────────────────────────────────────────────
   Бүх дүрс 64×64 хавтан дээр, 8×8 нэгжийн суурьтай. x тэнхлэг баруун-доош,
   y тэнхлэг зүүн-доош, z дээш. Гэрэл зүүн дээд талаас: дээд нүүр хамгийн
   цайвар (t), зүүн нүүр дунд (l), баруун нүүр хамгийн бараан (r).

   Хэсгүүдийг ХОЙНООС НЬ ӨМНӨӨС (холоос ойр руу) зурна. */

const S = 3.2;
const CX = 32;
const CY = 40 - 4 * S;
const K = 0.8660254;

export const P = (x: number, y: number, z: number): [number, number] => [
  CX + (x - y) * K * S,
  CY + (x + y) * 0.5 * S - z * S,
];
const f = (n: number) => Math.round(n * 100) / 100;
export const pts = (a: number[][]) => a.map(([x, y, z]) => P(x, y, z).map(f).join(',')).join(' ');

export type Shade = { t: string; l: string; r: string };

/** Гар зурсан мэт нимгэн, зөөлөн контур */
const EDGE = 'rgba(28, 16, 8, 0.34)';
const SW = 0.5;
const HI = 'rgba(255, 255, 255, 0.5)';

export const Poly: React.FC<{ p: number[][]; fill: string; stroke?: string }> = ({ p, fill, stroke = EDGE }) => (
  <polygon points={pts(p)} fill={fill} stroke={stroke} strokeWidth={SW} strokeLinejoin="round" />
);

/** Хайрцаг (x,y,z — хамгийн холын булан; w,d,h — хэмжээ) */
export const Box: React.FC<{ x: number; y: number; z?: number; w: number; d: number; h: number; c: Shade; hi?: boolean }> = ({
  x, y, z = 0, w, d, h, c, hi = true,
}) => {
  const x1 = x + w, y1 = y + d, z1 = z + h;
  return (
    <g>
      <Poly p={[[x, y1, z], [x1, y1, z], [x1, y1, z1], [x, y1, z1]]} fill={c.l} />
      <Poly p={[[x1, y, z], [x1, y1, z], [x1, y1, z1], [x1, y, z1]]} fill={c.r} />
      <Poly p={[[x, y, z1], [x1, y, z1], [x1, y1, z1], [x, y1, z1]]} fill={c.t} />
      {hi && <polyline points={pts([[x, y1, z1], [x1, y1, z1], [x1, y, z1]])} fill="none" stroke={HI} strokeWidth={0.45} strokeLinecap="round" />}
    </g>
  );
};

/** Профайлыг үйлдлийн цагийн зүүний эсрэг чиглэлд оруулна (чиглэл нь буруу өгөгдсөн ч зөв зурагдана). */
const ccw = (profile: number[][]): number[][] => {
  let a = 0;
  for (let i = 0; i < profile.length; i++) {
    const p = profile[i], q = profile[(i + 1) % profile.length];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a < 0 ? [...profile].reverse() : profile;
};

/** (y,z) хавтгай дахь профайлыг x тэнхлэгийн дагуу сунгана (дээвэр, налуу зэрэг).
 *  profile — үйлдлийн цагийн зүүний эсрэг дарааллаар [y,z]. */
export const ExtrudeX: React.FC<{ profile: number[][]; x0: number; x1: number; c: Shade; cap?: string }> = ({ profile: raw, x0, x1, c, cap }) => {
  const profile = ccw(raw);
  const n = profile.length;
  const sides: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const p = profile[i], q = profile[(i + 1) % n];
    const ny = q[1] - p[1], nz = -(q[0] - p[0]);
    if (ny + nz > 1e-6) {
      const len = Math.hypot(ny, nz) || 1;
      sides.push(
        <Poly key={i} p={[[x0, p[0], p[1]], [x1, p[0], p[1]], [x1, q[0], q[1]], [x0, q[0], q[1]]]} fill={ny / len > 0.15 ? c.l : c.t} />,
      );
    }
  }
  return (
    <g>
      {sides}
      <Poly p={profile.map(([y, z]) => [x1, y, z])} fill={cap ?? c.r} />
    </g>
  );
};

/** (x,z) хавтгай дахь профайлыг y тэнхлэгийн дагуу сунгана. */
export const ExtrudeY: React.FC<{ profile: number[][]; y0: number; y1: number; c: Shade; cap?: string }> = ({ profile: raw, y0, y1, c, cap }) => {
  const profile = ccw(raw);
  const n = profile.length;
  const sides: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const p = profile[i], q = profile[(i + 1) % n];
    const nx = q[1] - p[1], nz = -(q[0] - p[0]);
    if (nx + nz > 1e-6) {
      const len = Math.hypot(nx, nz) || 1;
      sides.push(
        <Poly key={i} p={[[p[0], y0, p[1]], [p[0], y1, p[1]], [q[0], y1, q[1]], [q[0], y0, q[1]]]} fill={nx / len > 0.15 ? c.r : c.t} />,
      );
    }
  }
  return (
    <g>
      {sides}
      <Poly p={profile.map(([x, z]) => [x, y1, z])} fill={cap ?? c.l} />
    </g>
  );
};

/** Хоёр налуутай дээвэр: ridge нь x тэнхлэгийн дагуу */
export const RoofX: React.FC<{ x: number; y: number; z: number; w: number; d: number; h: number; c: Shade; cap?: string }> = ({ x, y, z, w, d, h, c, cap }) => (
  <ExtrudeX profile={[[y, z], [y + d, z], [y + d / 2, z + h]]} x0={x} x1={x + w} c={c} cap={cap} />
);
/** ridge нь y тэнхлэгийн дагуу */
export const RoofY: React.FC<{ x: number; y: number; z: number; w: number; d: number; h: number; c: Shade; cap?: string }> = ({ x, y, z, w, d, h, c, cap }) => (
  <ExtrudeY profile={[[x, z], [x + w, z], [x + w / 2, z + h]]} y0={y} y1={y + d} c={c} cap={cap} />
);

/** Пирамид дээвэр / майхан */
export const Pyramid: React.FC<{ x: number; y: number; z: number; w: number; d: number; h: number; c: Shade }> = ({ x, y, z, w, d, h, c }) => {
  const x1 = x + w, y1 = y + d, xm = x + w / 2, ym = y + d / 2, zr = z + h;
  return (
    <g>
      <Poly p={[[x, y, z], [x, y1, z], [xm, ym, zr]]} fill={c.t} />
      <Poly p={[[x, y, z], [x1, y, z], [xm, ym, zr]]} fill={c.t} />
      <Poly p={[[x, y1, z], [x1, y1, z], [xm, ym, zr]]} fill={c.l} />
      <Poly p={[[x1, y, z], [x1, y1, z], [xm, ym, zr]]} fill={c.r} />
    </g>
  );
};

/** Босоо цилиндр (cx,cy — төв) */
export const Cyl: React.FC<{ x: number; y: number; z?: number; r: number; h: number; c: Shade; core?: string }> = ({ x, y, z = 0, r, h, c, core }) => {
  const [sx, sb] = P(x, y, z);
  const [, st] = P(x, y, z + h);
  const a = 1.2247 * r * S, b = 0.7071 * r * S;
  return (
    <g stroke={EDGE} strokeWidth={SW} strokeLinejoin="round">
      <path d={`M${f(sx - a)},${f(st)} L${f(sx - a)},${f(sb)} A${f(a)},${f(b)} 0 0 0 ${f(sx)},${f(sb + b)} L${f(sx)},${f(st + b)} Z`} fill={c.l} />
      <path d={`M${f(sx)},${f(st + b)} L${f(sx)},${f(sb + b)} A${f(a)},${f(b)} 0 0 0 ${f(sx + a)},${f(sb)} L${f(sx + a)},${f(st)} Z`} fill={c.r} />
      <ellipse cx={f(sx)} cy={f(st)} rx={f(a)} ry={f(b)} fill={c.t} />
      {core && <ellipse cx={f(sx)} cy={f(st)} rx={f(a * 0.45)} ry={f(b * 0.45)} fill={core} stroke="none" />}
    </g>
  );
};

/** Конус (мөөг, нарс мод, майхны оройд) */
export const Cone: React.FC<{ x: number; y: number; z?: number; r: number; h: number; c: Shade }> = ({ x, y, z = 0, r, h, c }) => {
  const [sx, sb] = P(x, y, z);
  const [, st] = P(x, y, z + h);
  const a = 1.2247 * r * S, b = 0.7071 * r * S;
  return (
    <g stroke={EDGE} strokeWidth={SW} strokeLinejoin="round">
      <path d={`M${f(sx)},${f(st)} L${f(sx - a)},${f(sb)} A${f(a)},${f(b)} 0 0 0 ${f(sx)},${f(sb + b)} Z`} fill={c.l} />
      <path d={`M${f(sx)},${f(st)} L${f(sx)},${f(sb + b)} A${f(a)},${f(b)} 0 0 0 ${f(sx + a)},${f(sb)} Z`} fill={c.r} />
    </g>
  );
};

/** Бөмбөрцөг (модны сүүдэр, бут) — гурван өнгөтэй */
export const Ball: React.FC<{ x: number; y: number; z: number; r: number; c: Shade }> = ({ x, y, z, r, c }) => {
  const [sx, sy] = P(x, y, z);
  const R = r * S;
  return (
    <g>
      <circle cx={f(sx)} cy={f(sy)} r={f(R)} fill={c.r} stroke={EDGE} strokeWidth={SW} />
      <circle cx={f(sx - R * 0.14)} cy={f(sy - R * 0.1)} r={f(R * 0.82)} fill={c.l} />
      <circle cx={f(sx - R * 0.28)} cy={f(sy - R * 0.3)} r={f(R * 0.46)} fill={c.t} />
    </g>
  );
};

/** Модны бүрэн дүрс (иш + титэм) */
export const Tree: React.FC<{ x: number; y: number; z?: number; s?: number; c?: Shade; trunk?: Shade }> = ({
  x, y, z = 0, s = 1, c = LEAF, trunk = WOOD_DARK,
}) => (
  <g>
    <Box x={x - 0.25 * s} y={y - 0.25 * s} z={z} w={0.5 * s} d={0.5 * s} h={1.2 * s} c={trunk} hi={false} />
    <Ball x={x} y={y} z={z + 2.1 * s} r={1.25 * s} c={c} />
  </g>
);

/** Нарс мод */
export const Pine: React.FC<{ x: number; y: number; z?: number; s?: number }> = ({ x, y, z = 0, s = 1 }) => (
  <g>
    <Box x={x - 0.2 * s} y={y - 0.2 * s} z={z} w={0.4 * s} d={0.4 * s} h={0.8 * s} c={WOOD_DARK} hi={false} />
    <Cone x={x} y={y} z={z + 0.6 * s} r={1.1 * s} h={1.8 * s} c={PINE} />
    <Cone x={x} y={y} z={z + 1.7 * s} r={0.85 * s} h={1.6 * s} c={PINE} />
  </g>
);

/** Суурийн хавтан (дүрс бүрийн доор) */
export const Tile: React.FC = () => (
  <g strokeLinejoin="round">
    <polygon points={pts([[0, 8, 0], [8, 8, 0], [8, 8, -0.9], [0, 8, -0.9]])} fill="rgba(255,226,190,0.10)" />
    <polygon points={pts([[8, 0, 0], [8, 8, 0], [8, 8, -0.9], [8, 0, -0.9]])} fill="rgba(255,226,190,0.06)" />
    <polygon points={pts([[0, 0, 0], [8, 0, 0], [8, 8, 0], [0, 8, 0]])} fill="rgba(255,232,200,0.13)" stroke="rgba(255,232,200,0.30)" strokeWidth={0.6} />
  </g>
);

/* ── Цонх, хаалга зэрэг хавтгай чимэглэл ─────────────────────────────── */

/** Зүүн нүүр (y = const) дээр цонхны тор */
export const WinsL: React.FC<{ y: number; x0: number; x1: number; z0: number; z1: number; cols: number; rows: number; lit?: number[]; glass?: string; lit_c?: string }> = ({
  y, x0, x1, z0, z1, cols, rows, lit = [], glass = '#7fb6cc', lit_c = '#ffd27a',
}) => {
  const out: React.ReactNode[] = [];
  const cw = (x1 - x0) / cols, rh = (z1 - z0) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const a = x0 + c * cw + cw * 0.18, b = x0 + (c + 1) * cw - cw * 0.18;
    const d = z0 + r * rh + rh * 0.2, e = z0 + (r + 1) * rh - rh * 0.2;
    out.push(<Poly key={`${r}-${c}`} p={[[a, y, d], [b, y, d], [b, y, e], [a, y, e]]} fill={lit.includes(r * cols + c) ? lit_c : glass} stroke="rgba(28,16,8,0.22)" />);
  }
  return <g>{out}</g>;
};
/** Баруун нүүр (x = const) дээр цонхны тор */
export const WinsR: React.FC<{ x: number; y0: number; y1: number; z0: number; z1: number; cols: number; rows: number; lit?: number[]; glass?: string; lit_c?: string }> = ({
  x, y0, y1, z0, z1, cols, rows, lit = [], glass = '#5f9ab3', lit_c = '#f0b85c',
}) => {
  const out: React.ReactNode[] = [];
  const cw = (y1 - y0) / cols, rh = (z1 - z0) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const a = y0 + c * cw + cw * 0.18, b = y0 + (c + 1) * cw - cw * 0.18;
    const d = z0 + r * rh + rh * 0.2, e = z0 + (r + 1) * rh - rh * 0.2;
    out.push(<Poly key={`${r}-${c}`} p={[[x, a, d], [x, b, d], [x, b, e], [x, a, e]]} fill={lit.includes(r * cols + c) ? lit_c : glass} stroke="rgba(28,16,8,0.22)" />);
  }
  return <g>{out}</g>;
};

/** Ерөнхий хавтгай дөрвөлжин (дурын 3D цэгүүд) */
export const Quad: React.FC<{ p: number[][]; fill: string; stroke?: string }> = ({ p, fill, stroke }) => <Poly p={p} fill={fill} stroke={stroke} />;

/** Шугам */
export const Line: React.FC<{ a: number[]; b: number[]; stroke?: string; w?: number }> = ({ a, b, stroke = 'rgba(28,16,8,0.45)', w = 0.6 }) => {
  const [x1, y1] = P(a[0], a[1], a[2]);
  const [x2, y2] = P(b[0], b[1], b[2]);
  return <line x1={f(x1)} y1={f(y1)} x2={f(x2)} y2={f(y2)} stroke={stroke} strokeWidth={w} strokeLinecap="round" />;
};

/* ── Өнгөний сан ─────────────────────────────────────────────────────── */
export const C = {
  concrete: { t: '#efe9de', l: '#d6cdbe', r: '#b9af9c' } as Shade,
  white:    { t: '#ffffff', l: '#f1f3f6', r: '#d7dde5' } as Shade,
  cream:    { t: '#fbf1dc', l: '#ecd9b6', r: '#d3bb92' } as Shade,
  brick:    { t: '#e8a07b', l: '#cd7a53', r: '#ab5f3d' } as Shade,
  roof:     { t: '#ee6e50', l: '#cf4f33', r: '#a93a22' } as Shade,
  glass:    { t: '#d9f0f8', l: '#90c9de', r: '#6aa9c4' } as Shade,
  wood:     { t: '#f3d49f', l: '#dcad6b', r: '#b98a4c' } as Shade,
  yellow:   { t: '#ffe073', l: '#f8bd3d', r: '#da9c22' } as Shade,
  orange:   { t: '#ffab5c', l: '#f48a2b', r: '#d06a17' } as Shade,
  red:      { t: '#f9806a', l: '#e2553d', r: '#bb3d29' } as Shade,
  steel:    { t: '#a4adba', l: '#7a8493', r: '#5b6573' } as Shade,
  dark:     { t: '#68717e', l: '#4a525d', r: '#343a43' } as Shade,
  blue:     { t: '#86adf8', l: '#5784e6', r: '#3f66c2' } as Shade,
  solar:    { t: '#456ac4', l: '#33529f', r: '#26407f' } as Shade,
  grass:    { t: '#bde28f', l: '#86c25c', r: '#63a043' } as Shade,
  moss:     { t: '#cddb8c', l: '#a9bd5e', r: '#869b43' } as Shade,
};
export const LEAF: Shade = { t: '#b6e08a', l: '#7fbd57', r: '#5a9a3e' };
export const PINE: Shade = { t: '#7fb069', l: '#5d9650', r: '#437a3a' };
export const WOOD_DARK: Shade = { t: '#a97c50', l: '#8a6038', r: '#6e4a28' };

/** Дүрсний ерөнхий хүрээ */
export const IsoSvg: React.FC<{ size?: number; children: React.ReactNode; title?: string }> = ({ size = 56, children, title }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title} style={{ overflow: 'visible' }}>
    <Tile />
    {children}
  </svg>
);
