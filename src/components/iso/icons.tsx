import React from 'react';
import {
  IsoSvg, TextL, Box, Cyl, Cone, Ball, Tree, Pine, RoofX, RoofY, Pyramid, ExtrudeX, WinsL, WinsR, Quad, Line, Poly, C, P, pts,
  LEAF, WOOD_DARK, type Shade,
} from './iso';

type IconProps = { size?: number };

/* ── Тусламжийн жижиг хэлбэрүүд ─────────────────────────────────────── */

/** Хоёр цэгийн хооронд зузаантай тууз (үйлдлийн цагийн зүүний эсрэг, [y,z] хавтгайд) */
const bar = (p: number[], q: number[], t: number): number[][] => {
  const dx = q[0] - p[0], dz = q[1] - p[1];
  const len = Math.hypot(dx, dz) || 1;
  const nx = (-dz / len) * (t / 2), nz = (dx / len) * (t / 2);
  return [
    [p[0] + nx, p[1] + nz], [p[0] - nx, p[1] - nz],
    [q[0] - nx, q[1] - nz], [q[0] + nx, q[1] + nz],
  ].sort(() => 0) as number[][];
};

/** Дэлгэцийн хавтгай (billboard) дүрсүүд — 3D цэгийн дагуу байрлана */
const Sun: React.FC<{ cx: number; cy: number; r: number }> = ({ cx, cy, r }) => (
  <g>
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i * Math.PI) / 4;
      return <line key={i} x1={cx + Math.cos(a) * (r + 1.2)} y1={cy + Math.sin(a) * (r + 1.2)} x2={cx + Math.cos(a) * (r + 3.4)} y2={cy + Math.sin(a) * (r + 3.4)} stroke="#ffc94d" strokeWidth={1.1} strokeLinecap="round" />;
    })}
    <circle cx={cx} cy={cy} r={r} fill="#ffd45e" stroke="rgba(140,80,0,.4)" strokeWidth={0.5} />
    <circle cx={cx - r * 0.25} cy={cy - r * 0.25} r={r * 0.5} fill="#fff0a8" />
  </g>
);

const Flake: React.FC<{ cx: number; cy: number; r: number }> = ({ cx, cy, r }) => (
  <g stroke="#bfe6ff" strokeWidth={1} strokeLinecap="round">
    {[0, 60, 120].map(a => (
      <line key={a} x1={cx - Math.cos((a * Math.PI) / 180) * r} y1={cy - Math.sin((a * Math.PI) / 180) * r} x2={cx + Math.cos((a * Math.PI) / 180) * r} y2={cy + Math.sin((a * Math.PI) / 180) * r} />
    ))}
    <circle cx={cx} cy={cy} r={1} fill="#e8f6ff" stroke="none" />
  </g>
);

const Blades: React.FC<{ cx: number; cy: number; len: number; rot?: number }> = ({ cx, cy, len, rot = 20 }) => (
  <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
    {[0, 120, 240].map(a => (
      <polygon key={a} transform={`rotate(${a})`} points={`0,-0.9 ${len},-0.25 ${len},0.25 0,0.9`} fill="#ffffff" stroke="rgba(28,16,8,.35)" strokeWidth={0.4} strokeLinejoin="round" />
    ))}
    <circle r={1.3} fill="#e7ebf0" stroke="rgba(28,16,8,.4)" strokeWidth={0.4} />
  </g>
);

const Hat: React.FC<{ x: number; y: number; z: number; k?: number }> = ({ x, y, z, k = 1 }) => {
  const [cx, cy] = P(x, y, z);
  const w = 7.2 * k;
  return (
    <g stroke="rgba(28,16,8,.38)" strokeWidth={0.5} strokeLinejoin="round">
      <ellipse cx={cx} cy={cy + 0.4 * k} rx={w * 1.08} ry={w * 0.34} fill="#d99a1c" />
      <path d={`M${cx - w},${cy} A${w},${w * 0.95} 0 0 1 ${cx + w},${cy} Z`} fill="#f8bd3d" />
      <path d={`M${cx + w * 0.1},${cy - w * 0.93} A${w},${w * 0.95} 0 0 1 ${cx + w},${cy} L${cx + w * 0.2},${cy} Z`} fill="#da9c22" stroke="none" />
      <path d={`M${cx - w * 0.28},${cy - w * 0.9} L${cx - w * 0.28},${cy - 0.2} L${cx + w * 0.22},${cy - 0.2} L${cx + w * 0.22},${cy - w * 0.95} Z`} fill="#ffe073" />
      <path d={`M${cx - w * 0.6},${cy - w * 0.58} A${w * 0.8},${w * 0.7} 0 0 1 ${cx - w * 0.1},${cy - w * 0.88}`} fill="none" stroke="rgba(255,255,255,.55)" strokeWidth={1} strokeLinecap="round" />
    </g>
  );
};

const LeafMark: React.FC<{ x: number; y: number; z: number; k?: number }> = ({ x, y, z, k = 1 }) => {
  const [cx, cy] = P(x, y, z);
  return (
    <g transform={`translate(${cx} ${cy}) scale(${k})`} stroke="rgba(28,16,8,.35)" strokeWidth={0.5} strokeLinejoin="round">
      <path d="M0,0 C1,-6 7,-10 13,-9 C12,-2 7,5 0,0 Z" fill="#86c25c" />
      <path d="M1,-1 C4,-3 8,-6 12,-8.2" fill="none" stroke="#e8f7cf" strokeWidth={0.9} strokeLinecap="round" />
      <path d="M0,0 L-2.2,2" fill="none" stroke="#6e4a28" strokeWidth={0.9} strokeLinecap="round" />
    </g>
  );
};

/** Тоосгоны давхаргын шугам (зүүн, баруун нүүр дээр) */
const BrickLinesL: React.FC<{ y: number; x0: number; x1: number; z0: number; z1: number; rows: number; bw: number }> = ({ y, x0, x1, z0, z1, rows, bw }) => {
  const out: React.ReactNode[] = [];
  const rh = (z1 - z0) / rows;
  for (let r = 1; r < rows; r++) out.push(<Line key={`h${r}`} a={[x0, y, z0 + r * rh]} b={[x1, y, z0 + r * rh]} stroke="rgba(60,25,10,.42)" w={0.5} />);
  for (let r = 0; r < rows; r++) for (let x = x0 + bw * (r % 2 ? 0.5 : 1); x < x1 - 0.05; x += bw) out.push(<Line key={`v${r}-${x}`} a={[x, y, z0 + r * rh]} b={[x, y, z0 + (r + 1) * rh]} stroke="rgba(60,25,10,.42)" w={0.5} />);
  return <g>{out}</g>;
};
const BrickLinesR: React.FC<{ x: number; y0: number; y1: number; z0: number; z1: number; rows: number; bw: number }> = ({ x, y0, y1, z0, z1, rows, bw }) => {
  const out: React.ReactNode[] = [];
  const rh = (z1 - z0) / rows;
  for (let r = 1; r < rows; r++) out.push(<Line key={`h${r}`} a={[x, y0, z0 + r * rh]} b={[x, y1, z0 + r * rh]} stroke="rgba(60,25,10,.42)" w={0.5} />);
  for (let r = 0; r < rows; r++) for (let y = y0 + bw * (r % 2 ? 0.5 : 1); y < y1 - 0.05; y += bw) out.push(<Line key={`v${r}-${y}`} a={[x, y, z0 + r * rh]} b={[x, y, z0 + (r + 1) * rh]} stroke="rgba(60,25,10,.42)" w={0.5} />);
  return <g>{out}</g>;
};

/* ═════════ КАТЕГОРИ 1 — Шинэ орон сууц, үл хөдлөх хөрөнгө ═════════ */

export const Skyline: React.FC<IconProps> = ({ size }) => (
  <IsoSvg size={size}>
    <Box x={1} y={1} w={2.4} d={2.4} h={8.2} c={C.concrete} />
    <WinsL y={3.4} x0={1} x1={3.4} z0={0.8} z1={7.8} cols={2} rows={6} lit={[1, 4, 7, 10]} />
    <WinsR x={3.4} y0={1} y1={3.4} z0={0.8} z1={7.8} cols={2} rows={6} lit={[2, 5, 8]} />
    <Box x={4.2} y={1.4} w={2.6} d={2.4} h={6.4} c={C.cream} />
    <WinsL y={3.8} x0={4.2} x1={6.8} z0={0.8} z1={6.2} cols={3} rows={4} lit={[0, 5, 9]} />
    <WinsR x={6.8} y0={1.4} y1={3.8} z0={0.8} z1={6.2} cols={2} rows={4} lit={[1, 6]} />
    <Box x={1.2} y={4.4} w={3} d={2.6} h={3.6} c={C.brick} />
    <WinsL y={7} x0={1.2} x1={4.2} z0={0.8} z1={3.4} cols={3} rows={2} lit={[1, 4]} glass="#a9d7e8" />
    <WinsR x={4.2} y0={4.4} y1={7} z0={0.8} z1={3.4} cols={2} rows={2} lit={[3]} glass="#8cc0d4" />
    <Box x={1.6} y={4.8} z={3.6} w={1.2} d={1.2} h={0.7} c={C.steel} />
    <Tree x={6.2} y={6} s={0.9} />
  </IsoSvg>
);

export const Tower: React.FC<IconProps> = ({ size }) => (
  <IsoSvg size={size}>
    <Box x={1.2} y={1.2} w={3} d={3} h={7.8} c={C.cream} />
    <WinsL y={4.2} x0={1.2} x1={4.2} z0={0.9} z1={7.8} cols={3} rows={7} lit={[1, 5, 9, 14, 18]} />
    <WinsR x={4.2} y0={1.2} y1={4.2} z0={0.9} z1={7.8} cols={3} rows={7} lit={[2, 7, 11, 16]} />
    <Box x={1.0} y={1.0} z={7.8} w={3.4} d={3.4} h={0.5} c={C.orange} />
    <Box x={4.4} y={2.6} w={2.6} d={3.2} h={4.6} c={C.white} />
    <WinsL y={5.8} x0={4.4} x1={7} z0={0.8} z1={4.4} cols={2} rows={3} lit={[1, 4]} />
    <WinsR x={7} y0={2.6} y1={5.8} z0={0.8} z1={4.4} cols={3} rows={3} lit={[2, 6]} />
    <Box x={4.2} y={2.4} z={4.6} w={3} d={3.6} h={0.4} c={C.orange} />
    <Box x={1.4} y={5.4} w={2.4} d={1.8} h={0.5} c={C.grass} />
    <Tree x={2.2} y={6.4} z={0.5} s={0.55} />
  </IsoSvg>
);

export const Cabin: React.FC<IconProps> = ({ size }) => (
  <IsoSvg size={size}>
    <Box x={5.4} y={1.6} w={0.8} d={0.8} h={0.9} c={C.brick} hi={false} />
    <Box x={1.6} y={2.2} w={4.6} d={3.8} h={2.8} c={C.cream} />
    <Quad p={[[2.2, 6, 0], [3.2, 6, 0], [3.2, 6, 2.1], [2.2, 6, 2.1]]} fill="#7a4a2a" />
    <Quad p={[[4.2, 6, 1], [5.5, 6, 1], [5.5, 6, 2.2], [4.2, 6, 2.2]]} fill="#9fd0e3" stroke="rgba(28,16,8,.4)" />
    <Quad p={[[6.2, 3.2, 1], [6.2, 4.7, 1], [6.2, 4.7, 2.2], [6.2, 3.2, 2.2]]} fill="#6aa9c4" stroke="rgba(28,16,8,.4)" />
    <RoofX x={1.3} y={1.9} z={2.8} w={5.2} d={4.4} h={2.1} c={C.roof} cap={C.cream.r} />
    <Box x={4.8} y={2.7} z={3.6} w={0.7} d={0.7} h={1.8} c={C.brick} />
    <Box x={2.0} y={6} w={1.4} d={0.7} h={0.3} c={C.concrete} />
    <Tree x={6.7} y={6.5} s={0.7} />
  </IsoSvg>
);

export const Interior: React.FC<IconProps> = ({ size }) => (
  <IsoSvg size={size}>
    <Tree x={6.5} y={1.4} s={0.95} />
    <Box x={0.9} y={2.9} w={5.4} d={4.1} h={0.14} c={{ t: '#f6dfae', l: '#e5c88e', r: '#c9a96c' }} hi={false} />
    <Box x={1.5} y={3.3} z={0.14} w={3.8} d={0.7} h={1.9} c={C.blue} />
    <Box x={1.5} y={3.3} z={0.14} w={3.8} d={2.0} h={0.85} c={C.blue} />
    <Box x={1.5} y={3.3} z={0.99} w={0.55} d={2.0} h={0.75} c={C.blue} />
    <Box x={4.75} y={3.3} z={0.99} w={0.55} d={2.0} h={0.75} c={C.blue} />
    <Box x={2.1} y={4.0} z={0.99} w={1.5} d={1.3} h={0.38} c={{ t: '#b6cdfc', l: '#92b1f4', r: '#7396de' }} />
    <Box x={3.2} y={4.0} z={0.99} w={1.5} d={1.3} h={0.38} c={{ t: '#b6cdfc', l: '#92b1f4', r: '#7396de' }} />
    <Box x={2.3} y={3.95} z={1.37} w={0.65} d={0.5} h={0.55} c={C.orange} />
    <Box x={2.6} y={5.9} z={0.14} w={2.0} d={0.9} h={0.55} c={C.wood} />
    <Box x={3.1} y={6.05} z={0.69} w={0.55} d={0.4} h={0.2} c={C.red} hi={false} />
    <Box x={6.0} y={3.0} w={0.25} d={0.25} h={3.4} c={C.steel} hi={false} />
    <Cyl x={6.12} y={3.12} z={3.2} r={0.75} h={0.9} c={C.yellow} />
    <Cyl x={6.1} y={5.9} r={0.55} h={0.8} c={C.orange} />
    <Ball x={6.1} y={5.9} z={1.6} r={0.9} c={LEAF} />
  </IsoSvg>
);

export const Blueprint: React.FC<IconProps> = ({ size }) => {
  const g: React.ReactNode[] = [];
  for (let i = 1; i < 6; i++) {
    const v = 0.9 + i * (6.2 / 6);
    g.push(<Line key={`a${i}`} a={[v, 0.9, 0.5]} b={[v, 7.1, 0.5]} stroke="rgba(255,255,255,.38)" w={0.4} />);
    g.push(<Line key={`b${i}`} a={[0.9, v, 0.5]} b={[7.1, v, 0.5]} stroke="rgba(255,255,255,.38)" w={0.4} />);
  }
  return (
    <IsoSvg size={size}>
      <Box x={0.9} y={0.9} w={6.2} d={6.2} h={0.5} c={C.blue} />
      {g}
      <Box x={2.2} y={2.2} z={0.5} w={2.4} d={1.9} h={1.5} c={C.white} />
      <RoofX x={2.1} y={2.1} z={2} w={2.6} d={2.1} h={0.9} c={C.roof} cap={C.white.r} />
      <Box x={4.6} y={3.6} z={0.5} w={1.6} d={2.1} h={0.9} c={C.cream} />
      <Box x={1.2} y={6.2} z={0.5} w={0.4} d={0.38} h={0.38} c={{ t: '#ffb3b3', l: '#f48a8a', r: '#d96b6b' }} hi={false} />
      <Box x={1.6} y={6.2} z={0.5} w={3.2} d={0.38} h={0.38} c={C.yellow} hi={false} />
      <Box x={4.8} y={6.23} z={0.5} w={0.55} d={0.3} h={0.3} c={C.wood} hi={false} />
      <Box x={5.35} y={6.26} z={0.5} w={0.22} d={0.24} h={0.24} c={C.dark} hi={false} />
    </IsoSvg>
  );
};

export const HouseKey: React.FC<IconProps> = ({ size }) => (
  <IsoSvg size={size}>
    <Box x={1} y={1.6} w={3.6} d={3.2} h={2.4} c={C.white} />
    <Quad p={[[2.2, 4.8, 0], [3.2, 4.8, 0], [3.2, 4.8, 1.7], [2.2, 4.8, 1.7]]} fill="#7a4a2a" />
    <Quad p={[[4.6, 2.4, 0.9], [4.6, 3.8, 0.9], [4.6, 3.8, 2.0], [4.6, 2.4, 2.0]]} fill="#6aa9c4" stroke="rgba(28,16,8,.4)" />
    <Quad p={[[1.5, 4.8, 1], [2.0, 4.8, 1], [2.0, 4.8, 1.9], [1.5, 4.8, 1.9]]} fill="#9fd0e3" stroke="rgba(28,16,8,.4)" />
    <RoofX x={0.8} y={1.4} z={2.4} w={4} d={3.6} h={1.8} c={C.roof} cap={C.white.r} />
    {[0, 1, 2, 3].map(i => <Cyl key={i} x={6.1} y={4.2} z={i * 0.45} r={0.95} h={0.45} c={C.yellow} core="#e0a528" />)}
    <Cyl x={1.7} y={6.7} r={0.62} h={0.28} c={C.yellow} core="#3b2a14" />
    <Box x={2.3} y={6.5} w={2.3} d={0.4} h={0.28} c={C.yellow} hi={false} />
    <Box x={3.7} y={6.9} w={0.35} d={0.5} h={0.28} c={C.yellow} hi={false} />
    <Box x={4.25} y={6.9} w={0.35} d={0.4} h={0.28} c={C.yellow} hi={false} />
  </IsoSvg>
);

/* ═════════ КАТЕГОРИ 2 — Барилгын материал, дэвшилтэт технологи ═════════ */

export const Bricks: React.FC<IconProps> = ({ size }) => (
  <IsoSvg size={size}>
    <Box x={1.2} y={1.2} w={4.6} d={4.6} h={0.5} c={C.wood} />
    <Box x={1.4} y={1.4} z={0.5} w={4.2} d={4.2} h={2.5} c={C.brick} />
    <BrickLinesL y={5.6} x0={1.4} x1={5.6} z0={0.5} z1={3} rows={5} bw={1.05} />
    <BrickLinesR x={5.6} y0={1.4} y1={5.6} z0={0.5} z1={3} rows={5} bw={1.05} />
    <Box x={5.8} y={5.2} w={1.5} d={0.8} h={0.5} c={C.brick} />
    <Box x={6} y={5.3} z={0.5} w={1.3} d={0.7} h={0.5} c={C.brick} />
    <Box x={5.9} y={6.3} w={1.5} d={0.8} h={0.5} c={C.brick} />
  </IsoSvg>
);

export const GreenBuilding: React.FC<IconProps> = ({ size }) => (
  <IsoSvg size={size}>
    <Box x={1.4} y={1.6} w={4.8} d={4.2} h={5.2} c={C.white} />
    <WinsL y={5.8} x0={1.4} x1={6.2} z0={0.9} z1={5.0} cols={4} rows={3} lit={[1, 6, 10]} />
    <WinsR x={6.2} y0={1.6} y1={5.8} z0={0.9} z1={5.0} cols={3} rows={3} lit={[2, 4]} />
    <Box x={1.4} y={1.6} z={5.2} w={4.8} d={4.2} h={0.5} c={C.grass} />
    <Tree x={2.6} y={2.8} z={5.7} s={0.6} />
    <Tree x={4.8} y={4.3} z={5.7} s={0.6} />
    <LeafMark x={6.9} y={6.3} z={0.4} k={0.75} />
  </IsoSvg>
);

export const Solar: React.FC<IconProps> = ({ size }) => {
  const panel = (x0: number, x1: number, y0: number, y1: number, key: string) => {
    const q = [[x0, y1, 1.0], [x1, y1, 1.0], [x1, y0, 2.9], [x0, y0, 2.9]];
    const lines: React.ReactNode[] = [];
    for (let i = 1; i < 4; i++) {
      const u = x0 + ((x1 - x0) * i) / 4;
      lines.push(<Line key={`c${i}`} a={[u, y1, 1.0]} b={[u, y0, 2.9]} stroke="rgba(190,215,255,.7)" w={0.4} />);
    }
    lines.push(<Line key="m" a={[x0, (y0 + y1) / 2, 1.95]} b={[x1, (y0 + y1) / 2, 1.95]} stroke="rgba(190,215,255,.7)" w={0.4} />);
    return (
      <g key={key}>
        <Box x={x0 + 0.5} y={y1 - 0.3} w={0.25} d={0.25} h={1.05} c={C.steel} hi={false} />
        <Box x={x1 - 0.75} y={y1 - 0.3} w={0.25} d={0.25} h={1.05} c={C.steel} hi={false} />
        <Quad p={q} fill="#33529f" stroke="#cfe0ff" />
        {lines}
        <polygon points={pts([[x0, y1, 1.0], [x1, y1, 1.0], [x1, y1, 0.8], [x0, y1, 0.8]])} fill="#cfd6e2" stroke="rgba(28,16,8,.3)" strokeWidth={0.4} />
      </g>
    );
  };
  const [hx, hy] = P(6.4, 1.6, 6.2);
  return (
    <IsoSvg size={size}>
      <Sun cx={13} cy={12} r={4.6} />
      <Box x={6.2} y={1.4} w={0.4} d={0.4} h={6} c={C.white} hi={false} />
      <Box x={6.0} y={1.2} z={5.9} w={0.8} d={0.8} h={0.5} c={C.concrete} hi={false} />
      <Blades cx={hx} cy={hy} len={7.4} rot={24} />
      {panel(0.9, 3.9, 3.0, 5.2, 'a')}
      {panel(4.3, 7.3, 3.7, 5.9, 'b')}
    </IsoSvg>
  );
};

export const Heating: React.FC<IconProps> = ({ size }) => {
  const [fx, fy] = P(6.6, 1.2, 6.2);
  return (
    <IsoSvg size={size}>
      <Flake cx={fx - 8} cy={fy + 1} r={4} />
      <Box x={1.0} y={2.2} z={0.8} w={5.2} d={1.1} h={0.4} c={C.white} />
      {Array.from({ length: 8 }).map((_, i) => <Box key={i} x={1.15 + i * 0.64} y={2.25} z={1.2} w={0.4} d={1.0} h={3} c={C.white} hi={false} />)}
      <Box x={1.0} y={2.2} z={4.2} w={5.2} d={1.1} h={0.4} c={C.white} />
      <Box x={1.2} y={2.4} z={0} w={0.4} d={0.5} h={0.8} c={C.steel} hi={false} />
      <Box x={5.6} y={2.4} z={0} w={0.4} d={0.5} h={0.8} c={C.steel} hi={false} />
      <Cyl x={6.55} y={2.75} z={2.4} r={0.42} h={0.55} c={C.red} />
      <Cyl x={2.6} y={5.4} r={1.25} h={2.3} c={C.yellow} core="#7a5a14" />
      <Box x={5.6} y={4.7} w={1.5} d={0.9} h={2.6} c={C.white} />
      <Quad p={[[5.85, 5.6, 1.45], [6.85, 5.6, 1.45], [6.85, 5.6, 2.15], [5.85, 5.6, 2.15]]} fill="#27323e" />
      <Quad p={[[6.0, 5.6, 1.62], [6.55, 5.6, 1.62], [6.55, 5.6, 1.95], [6.0, 5.6, 1.95]]} fill="#7ee0a0" />
      <Quad p={[[5.9, 5.6, 0.8], [6.25, 5.6, 0.8], [6.25, 5.6, 1.15], [5.9, 5.6, 1.15]]} fill="#f27f24" />
      <Quad p={[[6.45, 5.6, 0.8], [6.8, 5.6, 0.8], [6.8, 5.6, 1.15], [6.45, 5.6, 1.15]]} fill="#5784e6" />
    </IsoSvg>
  );
};

export const Crane: React.FC<IconProps> = ({ size }) => {
  const lat: React.ReactNode[] = [];
  for (let i = 0; i < 8; i++) {
    const z0 = i * 1.05, z1 = z0 + 1.05;
    lat.push(<Line key={`l${i}`} a={[6.0, 2.7, z0]} b={[6.7, 2.7, z1]} stroke="rgba(80,45,0,.55)" w={0.45} />);
    lat.push(<Line key={`r${i}`} a={[6.7, 2.0, z0]} b={[6.7, 2.7, z1]} stroke="rgba(80,45,0,.55)" w={0.45} />);
  }
  return (
    <IsoSvg size={size}>
      <Box x={6.0} y={2.0} w={0.7} d={0.7} h={8.6} c={C.yellow} />
      {lat}
      <Box x={5.4} y={2.1} z={7.7} w={0.6} d={0.8} h={0.9} c={C.white} />
      <Box x={1.2} y={3.4} w={0.4} d={0.4} h={4.2} c={C.concrete} hi={false} />
      <Box x={4.4} y={3.4} w={0.4} d={0.4} h={4.2} c={C.concrete} hi={false} />
      <Box x={1.0} y={3.2} z={2} w={4} d={3.8} h={0.35} c={C.concrete} />
      <Box x={1.0} y={3.2} z={4} w={4} d={3.8} h={0.35} c={C.concrete} />
      <Box x={1.2} y={6.6} w={0.4} d={0.4} h={4.2} c={C.concrete} hi={false} />
      <Box x={4.4} y={6.6} w={0.4} d={0.4} h={4.2} c={C.concrete} hi={false} />
      <Box x={6.1} y={0.4} z={8.6} w={0.5} d={6.6} h={0.45} c={C.yellow} />
      <Box x={5.9} y={0.2} z={8.1} w={0.9} d={0.9} h={0.5} c={C.dark} hi={false} />
      <Line a={[6.35, 5.4, 8.6]} b={[6.35, 5.4, 6.4]} stroke="#2c323b" w={0.6} />
      <Box x={6.15} y={5.2} z={6.0} w={0.4} d={0.4} h={0.4} c={C.red} hi={false} />
      <Box x={5.5} y={4.7} z={5.2} w={1.7} d={1.3} h={0.8} c={C.brick} />
    </IsoSvg>
  );
};

export const Engineering: React.FC<IconProps> = ({ size }) => (
  <IsoSvg size={size}>
    <Cyl x={2.4} y={2.7} r={1.55} h={4.6} c={{ t: '#d3dbe8', l: '#a3b2c8', r: '#7e8ea8' }} />
    <Cyl x={2.4} y={2.7} z={1.5} r={1.62} h={0.28} c={C.steel} />
    <Cyl x={2.4} y={2.7} z={3.3} r={1.62} h={0.28} c={C.steel} />
    <Box x={6.3} y={2.0} w={0.7} d={0.7} h={3.6} c={C.yellow} />
    <Box x={3.7} y={2.0} z={0.8} w={3.3} d={0.7} h={0.7} c={C.yellow} />
    <Box x={4.75} y={2.12} z={1.5} w={0.35} d={0.35} h={0.5} c={C.steel} hi={false} />
    <Cyl x={4.92} y={2.3} z={2.0} r={0.75} h={0.2} c={C.red} core="#7a1f10" />
    <Box x={4.6} y={4.8} w={2.6} d={1.6} h={3.2} c={{ t: '#e8edf4', l: '#c5cfdd', r: '#9eabc0' }} />
    <Quad p={[[4.9, 6.4, 0.4], [6.9, 6.4, 0.4], [6.9, 6.4, 2.6], [4.9, 6.4, 2.6]]} fill="#7d8da6" />
    <Quad p={[[5.1, 6.4, 2.9], [5.4, 6.4, 2.9], [5.4, 6.4, 3.2], [5.1, 6.4, 3.2]]} fill="#7ee0a0" />
    <Quad p={[[5.6, 6.4, 2.9], [5.9, 6.4, 2.9], [5.9, 6.4, 3.2], [5.6, 6.4, 3.2]]} fill="#ffd45e" />
    <Quad p={[[6.1, 6.4, 2.9], [6.4, 6.4, 2.9], [6.4, 6.4, 3.2], [6.1, 6.4, 3.2]]} fill="#f9806a" />
  </IsoSvg>
);

/* ═════════ КАТЕГОРИ 3 — Гадаа талбай ═════════ */

export const Excavator: React.FC<IconProps> = ({ size }) => {
  const tread: React.ReactNode[] = [];
  for (let y = 1.7; y < 6.9; y += 0.55) tread.push(<Line key={y} a={[6.5, y, 0.15]} b={[6.5, y, 1.15]} stroke="rgba(0,0,0,.4)" w={0.45} />);
  return (
    <IsoSvg size={size}>
      <Box x={1.0} y={1.4} w={1.5} d={5.6} h={1.3} c={C.dark} />
      <Box x={5.0} y={1.4} w={1.5} d={5.6} h={1.3} c={C.dark} />
      {tread}
      <Box x={1.2} y={1.5} z={1.3} w={5.0} d={1.0} h={1.8} c={C.orange} />
      <Box x={1.2} y={2.2} z={1.3} w={5.0} d={3.0} h={1.5} c={C.yellow} />
      <ExtrudeX profile={[[4.5, 1.8], [5.6, 4.6], [6.4, 4.3], [5.3, 1.4]]} x0={2.6} x1={3.5} c={C.yellow} />
      <ExtrudeX profile={[[5.9, 4.7], [7.2, 2.1], [7.8, 2.5], [6.5, 5.2]]} x0={2.78} x1={3.32} c={C.orange} />
      <ExtrudeX profile={[[7.1, 2.4], [6.9, 1.3], [7.9, 1.2], [8.0, 2.2]]} x0={2.65} x1={3.45} c={C.steel} />
      <Box x={3.7} y={2.6} z={2.8} w={2.5} d={2.0} h={1.8} c={C.yellow} />
      <Quad p={[[3.9, 4.6, 3.2], [6.0, 4.6, 3.2], [6.0, 4.6, 4.4], [3.9, 4.6, 4.4]]} fill="#9fd0e3" stroke="rgba(28,16,8,.4)" />
      <Quad p={[[6.2, 2.8, 3.2], [6.2, 4.4, 3.2], [6.2, 4.4, 4.4], [6.2, 2.8, 4.4]]} fill="#6aa9c4" stroke="rgba(28,16,8,.4)" />
      <Box x={3.6} y={2.5} z={4.6} w={2.7} d={2.2} h={0.25} c={C.dark} hi={false} />
    </IsoSvg>
  );
};

export const Tools: React.FC<IconProps> = ({ size }) => (
  <IsoSvg size={size}>
    <Box x={1.2} y={1.6} w={3.8} d={2.5} h={2.3} c={C.red} />
    <Line a={[1.2, 4.1, 1.55]} b={[5.0, 4.1, 1.55]} stroke="rgba(60,10,0,.55)" w={0.55} />
    <Line a={[5.0, 1.6, 1.55]} b={[5.0, 4.1, 1.55]} stroke="rgba(60,10,0,.55)" w={0.55} />
    <Quad p={[[2.9, 4.1, 1.2], [3.5, 4.1, 1.2], [3.5, 4.1, 2.0], [2.9, 4.1, 2.0]]} fill="#ffe073" />
    <Box x={2.5} y={2.6} z={2.3} w={0.25} d={0.25} h={0.55} c={C.steel} hi={false} />
    <Box x={4.0} y={2.6} z={2.3} w={0.25} d={0.25} h={0.55} c={C.steel} hi={false} />
    <Box x={2.5} y={2.6} z={2.85} w={1.75} d={0.25} h={0.25} c={C.steel} />
    <Box x={1.2} y={6.6} w={4.8} d={0.8} h={0.55} c={C.yellow} />
    <Quad p={[[3.2, 6.8, 0.55], [4.1, 6.8, 0.55], [4.1, 7.2, 0.55], [3.2, 7.2, 0.55]]} fill="#bfe8b0" stroke="rgba(28,16,8,.4)" />
    <Quad p={[[1.6, 6.8, 0.55], [2.0, 6.8, 0.55], [2.0, 7.2, 0.55], [1.6, 7.2, 0.55]]} fill="#7a5a14" />
    <Quad p={[[5.2, 6.8, 0.55], [5.6, 6.8, 0.55], [5.6, 7.2, 0.55], [5.2, 6.8, 0.55]]} fill="#7a5a14" />
    <Box x={2.8} y={5.0} w={3.6} d={0.55} h={0.55} c={C.wood} />
    <Box x={6.3} y={4.55} w={1.0} d={1.45} h={1.0} c={C.steel} />
    <Box x={7.1} y={4.7} z={0.1} w={0.3} d={1.15} h={0.8} c={C.dark} hi={false} />
  </IsoSvg>
);

export const Panels: React.FC<IconProps> = ({ size }) => {
  const beam = (x: number, z: number, k: string) => (
    <g key={k}>
      <Box x={x} y={1.2} z={z} w={0.8} d={5.4} h={0.8} c={C.steel} />
      <Quad p={[[x + 0.12, 6.6, z + 0.18], [x + 0.28, 6.6, z + 0.18], [x + 0.28, 6.6, z + 0.62], [x + 0.12, 6.6, z + 0.62]]} fill="#3a424d" />
      <Quad p={[[x + 0.52, 6.6, z + 0.18], [x + 0.68, 6.6, z + 0.18], [x + 0.68, 6.6, z + 0.62], [x + 0.52, 6.6, z + 0.62]]} fill="#3a424d" />
    </g>
  );
  return (
    <IsoSvg size={size}>
      {beam(1.0, 0, 'a')}{beam(1.85, 0, 'b')}{beam(2.7, 0, 'c')}
      {beam(1.425, 0.8, 'd')}{beam(2.275, 0.8, 'e')}
      {beam(1.85, 1.6, 'f')}
      {[0, 1, 2, 3, 4].map(i => (
        <g key={i}>
          <Box x={4.4} y={1.8} z={i * 0.5} w={2.8} d={4.6} h={0.45} c={C.white} hi={false} />
          <Quad p={[[4.4, 6.4, i * 0.5 + 0.14], [7.2, 6.4, i * 0.5 + 0.14], [7.2, 6.4, i * 0.5 + 0.3], [4.4, 6.4, i * 0.5 + 0.3]]} fill="#f48a2b" />
          <Quad p={[[7.2, 1.8, i * 0.5 + 0.14], [7.2, 6.4, i * 0.5 + 0.14], [7.2, 6.4, i * 0.5 + 0.3], [7.2, 1.8, i * 0.5 + 0.3]]} fill="#cf6313" />
        </g>
      ))}
      <Quad p={[[4.4, 3.5, 2.5], [7.2, 3.5, 2.5], [7.2, 3.9, 2.5], [4.4, 3.9, 2.5]]} fill="#3a424d" />
      <Quad p={[[4.75, 6.4, 0], [5.15, 6.4, 0], [5.15, 6.4, 2.5], [4.75, 6.4, 2.5]]} fill="#3a424d" />
      <Quad p={[[7.2, 3.5, 0], [7.2, 3.9, 0], [7.2, 3.9, 2.5], [7.2, 3.5, 2.5]]} fill="#2c323b" />
    </IsoSvg>
  );
};

export const Container: React.FC<IconProps> = ({ size }) => {
  const rib: React.ReactNode[] = [];
  for (let x = 1.3; x < 7.05; x += 0.5) rib.push(<Line key={`x${x}`} a={[x, 6, 0.7]} b={[x, 6, 3.5]} stroke="rgba(120,50,0,.35)" w={0.45} />);
  for (let y = 2.4; y < 5.95; y += 0.5) rib.push(<Line key={`y${y}`} a={[7.1, y, 0.7]} b={[7.1, y, 3.5]} stroke="rgba(110,45,0,.35)" w={0.45} />);
  return (
    <IsoSvg size={size}>
      <Box x={0.9} y={2.0} w={6.2} d={4.0} h={0.5} c={C.dark} hi={false} />
      <Box x={0.9} y={2.0} z={0.5} w={6.2} d={4.0} h={3.2} c={C.orange} />
      {rib}
      <Quad p={[[1.4, 6, 0.5], [2.9, 6, 0.5], [2.9, 6, 2.7], [1.4, 6, 2.7]]} fill="#5a3a22" />
      <Quad p={[[3.8, 6, 1.6], [5.2, 6, 1.6], [5.2, 6, 2.8], [3.8, 6, 2.8]]} fill="#9fd0e3" stroke="rgba(28,16,8,.45)" />
      <Quad p={[[3.5, 6, 2.95], [5.5, 6, 2.95], [5.5, 6.7, 2.65], [3.5, 6.7, 2.65]]} fill="#f9806a" />
      <Quad p={[[7.1, 3.0, 1.6], [7.1, 4.5, 1.6], [7.1, 4.5, 2.8], [7.1, 3.0, 2.8]]} fill="#6aa9c4" stroke="rgba(28,16,8,.45)" />
      <Box x={1.4} y={6} w={1.5} d={0.7} h={0.25} c={C.concrete} />
      <Line a={[0.9, 6, 3.7]} b={[4, 4, 6.4]} stroke="#2c323b" w={0.5} />
      <Line a={[7.1, 6, 3.7]} b={[4, 4, 6.4]} stroke="#2c323b" w={0.5} />
      <Line a={[7.1, 2, 3.7]} b={[4, 4, 6.4]} stroke="#2c323b" w={0.5} />
      <Cyl x={4} y={4} z={6.3} r={0.4} h={0.22} c={C.yellow} core="#3b2a14" />
    </IsoSvg>
  );
};

export const ModelHouse: React.FC<IconProps> = ({ size }) => (
  <IsoSvg size={size}>
    <Box x={0.7} y={0.7} w={6.6} d={6.6} h={0.45} c={C.grass} />
    <Tree x={6.2} y={1.7} z={0.45} s={0.8} />
    <Box x={1.6} y={1.6} z={0.45} w={3.6} d={3.2} h={2.4} c={C.white} />
    <Quad p={[[2.9, 4.8, 0.45], [3.8, 4.8, 0.45], [3.8, 4.8, 2.1], [2.9, 4.8, 2.1]]} fill="#7a4a2a" />
    <Quad p={[[1.9, 4.8, 1.2], [2.6, 4.8, 1.2], [2.6, 4.8, 2.3], [1.9, 4.8, 2.3]]} fill="#9fd0e3" stroke="rgba(28,16,8,.4)" />
    <Quad p={[[4.1, 4.8, 1.2], [4.9, 4.8, 1.2], [4.9, 4.8, 2.3], [4.1, 4.8, 2.3]]} fill="#9fd0e3" stroke="rgba(28,16,8,.4)" />
    <Quad p={[[5.2, 2.2, 1.2], [5.2, 3.8, 1.2], [5.2, 3.8, 2.3], [5.2, 2.2, 2.3]]} fill="#6aa9c4" stroke="rgba(28,16,8,.4)" />
    <RoofX x={1.4} y={1.4} z={2.85} w={4} d={3.6} h={1.7} c={C.dark} cap={C.white.r} />
    <Box x={5.2} y={3.2} z={0.45} w={1.7} d={2.6} h={1.5} c={C.cream} />
    <Box x={5.1} y={3.1} z={1.95} w={1.9} d={2.8} h={0.25} c={C.dark} />
    <Quad p={[[2.9, 4.8, 0.45], [3.8, 4.8, 0.45], [3.8, 6.9, 0.45], [2.9, 6.9, 0.45]]} fill="#e7dcc6" />
    <Ball x={1.6} y={5.9} z={0.95} r={0.6} c={LEAF} />
    {[1.2, 2.2, 3.2, 4.2, 5.2].map(x => <Box key={x} x={x + 0.1} y={6.9} z={0.45} w={0.2} d={0.2} h={0.7} c={C.wood} hi={false} />)}
  </IsoSvg>
);

/* ═════════ Категорийн толгой дүрсүүд ═════════ */

export const MaterialsCat: React.FC<IconProps> = ({ size }) => (
  <IsoSvg size={size}>
    <Box x={1.0} y={1.0} w={5.2} d={5.2} h={0.5} c={C.wood} />
    <Box x={1.2} y={1.2} z={0.5} w={4.8} d={4.8} h={2.6} c={C.brick} />
    <BrickLinesL y={6} x0={1.2} x1={6} z0={0.5} z1={3.1} rows={5} bw={1.2} />
    <BrickLinesR x={6} y0={1.2} y1={6} z0={0.5} z1={3.1} rows={5} bw={1.2} />
    <Box x={6.2} y={5.6} w={1.4} d={0.8} h={0.5} c={C.brick} />
    <Hat x={3.7} y={3.7} z={3.1} k={1.25} />
  </IsoSvg>
);

export const Pavilion: React.FC<IconProps> = ({ size }) => (
  <IsoSvg size={size}>
    <Pine x={6.6} y={1.4} s={0.95} />
    <Box x={1.5} y={1.9} w={0.28} d={0.28} h={2.7} c={C.steel} hi={false} />
    <Box x={5.9} y={1.9} w={0.28} d={0.28} h={2.7} c={C.steel} hi={false} />
    <Box x={2.6} y={3.6} w={2.8} d={1.2} h={0.9} c={C.wood} />
    <Box x={2.8} y={3.8} z={0.9} w={0.9} d={0.7} h={0.6} c={C.blue} />
    <Box x={4.1} y={3.9} z={0.9} w={0.7} d={0.6} h={0.45} c={C.orange} />
    <Box x={1.5} y={5.7} w={0.28} d={0.28} h={2.7} c={C.steel} hi={false} />
    <Box x={5.9} y={5.7} w={0.28} d={0.28} h={2.7} c={C.steel} hi={false} />
    <Box x={1.3} y={1.7} z={2.6} w={5.0} d={4.6} h={0.45} c={C.white} />
    <Pyramid x={1.3} y={1.7} z={3.05} w={5.0} d={4.6} h={1.9} c={C.red} />
    <Tree x={0.9} y={6.8} s={0.7} />
  </IsoSvg>
);


/* ═════════ Статистикийн дүрсүүд ═════════ */

const SKIN: Shade = { t: '#ffe6cb', l: '#f3c6a0', r: '#d8a47c' };
const Person: React.FC<{ x: number; y: number; z?: number; shirt: Shade; h?: number }> = ({ x, y, z = 0, shirt, h = 1.3 }) => (
  <g>
    <Cyl x={x} y={y} z={z} r={0.5} h={h} c={shirt} />
    <Ball x={x} y={y} z={z + h + 0.42} r={0.5} c={SKIN} />
  </g>
);

export const StatExhibitors: React.FC<IconProps> = ({ size }) => (
  <IsoSvg size={size}>
    <Tree x={6.6} y={1.8} s={0.75} />
    <Box x={1.2} y={1.4} w={5.0} d={0.4} h={4.0} c={C.blue} />
    <Quad p={[[1.8, 1.8, 3.0], [5.6, 1.8, 3.0], [5.6, 1.8, 3.6], [1.8, 1.8, 3.6]]} fill="#ffffff" />
    <Quad p={[[1.8, 1.8, 1.6], [3.1, 1.8, 1.6], [3.1, 1.8, 2.7], [1.8, 1.8, 2.7]]} fill="#ff9a3c" />
    <Quad p={[[3.4, 1.8, 2.1], [5.6, 1.8, 2.1], [5.6, 1.8, 2.7], [3.4, 1.8, 2.7]]} fill="#ffffff" />
    <Quad p={[[3.4, 1.8, 1.6], [4.9, 1.8, 1.6], [4.9, 1.8, 1.95], [3.4, 1.8, 1.95]]} fill="#bcd0fb" />
    <Box x={1.6} y={4.0} w={3.8} d={1.5} h={1.3} c={C.wood} />
    <Box x={1.5} y={3.9} z={1.3} w={4.0} d={1.7} h={0.2} c={C.white} />
    <Box x={2.3} y={4.4} z={1.5} w={1.0} d={0.7} h={0.55} c={C.dark} />
    <Quad p={[[2.4, 5.1, 1.55], [3.2, 5.1, 1.55], [3.2, 5.1, 2.0], [2.4, 5.1, 2.0]]} fill="#7ee0a0" />
    <Person x={6.0} y={4.6} shirt={C.orange} />
  </IsoSvg>
);

export const StatVisitors: React.FC<IconProps> = ({ size }) => {
  // Хойноос урд руу (x+y өсөхөөр) зурна — эс бөгөөс ойр хүн холын хүнийг буруу дарна.
  const spots: [number, number, Shade, number][] = [
    [1.9, 2.3, C.blue, 1.3], [4.1, 1.7, C.red, 1.1], [6.1, 2.5, C.yellow, 1.3],
    [2.7, 4.3, C.moss, 1.1], [4.9, 3.9, C.orange, 1.3], [6.5, 5.1, C.solar, 1.1],
    [3.3, 6.3, C.red, 1.3], [5.2, 6.3, C.moss, 1.1],
  ];
  const sorted = [...spots].sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
  return (
    <IsoSvg size={size}>
      {sorted.map(([x, y, c, h], i) => <Person key={i} x={x} y={y} shirt={c} h={h} />)}
    </IsoSvg>
  );
};

export const StatGrowth: React.FC<IconProps> = ({ size }) => {
  const [ax, ay] = P(1.5, 3.2, 3.3);
  const [bx, by] = P(5.6, 3.2, 6.4);
  const ang = Math.atan2(by - ay, bx - ax);
  const head = [[0, 0], [-3.2, -1.9], [-3.2, 1.9]].map(([u, v]) => [bx + u * Math.cos(ang) - v * Math.sin(ang), by + u * Math.sin(ang) + v * Math.cos(ang)]);
  return (
    <IsoSvg size={size}>
      <Box x={0.9} y={2.2} w={1.0} d={1.9} h={1.6} c={C.orange} />
      <Box x={2.1} y={2.2} w={1.0} d={1.9} h={2.6} c={C.orange} />
      <Box x={3.3} y={2.2} w={1.0} d={1.9} h={3.8} c={C.orange} />
      <Box x={4.5} y={2.2} w={1.0} d={1.9} h={5.2} c={C.yellow} />
      <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#7fd36b" strokeWidth={1.7} strokeLinecap="round" />
      <polygon points={head.map(p => p.map(n => Math.round(n * 100) / 100).join(',')).join(' ')} fill="#7fd36b" stroke="rgba(28,16,8,.3)" strokeWidth={0.4} strokeLinejoin="round" />
      {[0, 1, 2].map(i => <Cyl key={i} x={6.2} y={5.9} z={i * 0.45} r={0.95} h={0.45} c={C.yellow} core="#e0a528" />)}
      {[0, 1].map(i => <Cyl key={`s${i}`} x={3.6} y={6.3} z={i * 0.45} r={0.8} h={0.45} c={C.yellow} core="#e0a528" />)}
    </IsoSvg>
  );
};

export const StatEdition: React.FC<IconProps> = ({ size }) => (
  <IsoSvg size={size}>
    {/* Гурван тавцан x+y нь тэнцүү (дэлгэцийн хэвтээ чиглэлд) тул нэгийг нь нөгөө нь халхлахгүй */}
    <Box x={4.9} y={1.3} w={1.8} d={1.8} h={1.1} c={{ t: '#f3d0a8', l: '#dca978', r: '#bc8a54' }} />
    <TextL x={5.8} y={3.1} z={0.3} size={0.85} fill="#8a5a2a">3</TextL>
    <Box x={3.1} y={3.1} w={1.8} d={1.8} h={2.4} c={C.yellow} />
    <TextL x={4.0} y={4.9} z={0.65} size={1.45} fill="#ffffff">1</TextL>
    <Box x={3.52} y={3.52} z={2.4} w={0.96} d={0.96} h={0.3} c={C.orange} />
    <Cyl x={4.0} y={4.0} z={2.7} r={0.22} h={0.7} c={C.yellow} />
    <Cyl x={4.0} y={4.0} z={3.4} r={0.85} h={1.15} c={C.yellow} core="#a8700e" />
    <Box x={2.9} y={3.86} z={3.7} w={0.28} d={0.28} h={0.5} c={C.yellow} hi={false} />
    <Box x={4.82} y={3.86} z={3.7} w={0.28} d={0.28} h={0.5} c={C.yellow} hi={false} />
    <Box x={1.3} y={4.9} w={1.8} d={1.8} h={1.6} c={{ t: '#eef1f6', l: '#cdd5e0', r: '#aeb8c8' }} />
    <TextL x={2.2} y={6.7} z={0.45} size={1.0} fill="#6b7686">2</TextL>
  </IsoSvg>
);

/** Түлхүүр → дүрс. Түлхүүр нь i18n-ийн ангилал/зүйлийн түлхүүртэй ижил. */
export const ISO_ICONS: Record<string, React.FC<IconProps>> = {
  cat1_title: Skyline, cat2_title: MaterialsCat, cat3_title: Pavilion,
  cat1_1: Tower, cat1_2: Cabin, cat1_3: Interior, cat1_4: Blueprint, cat1_5: HouseKey,
  cat2_1: Bricks, cat2_2: GreenBuilding, cat2_3: Solar, cat2_4: Heating, cat2_5: Crane, cat2_6: Engineering,
  'stat-exhibitors': StatExhibitors, 'stat-visitors': StatVisitors, 'stat-sales': StatGrowth, 'stat-editions': StatEdition,
  cat3_1: Excavator, cat3_2: Tools, cat3_3: Panels, cat3_4: Container, cat3_5: ModelHouse,
};
