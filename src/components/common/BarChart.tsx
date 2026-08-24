import React from "react";
import { esc, rp } from "@/lib/utils";

export interface BarChartItem {
  label: string;
  masuk: number;
  keluar: number;
}

export interface BarChartProps {
  series: BarChartItem[];
}

export const BarChart: React.FC<BarChartProps> = ({ series }) => {
  const W = 680;
  const H = 250;
  const padL = 8;
  const padB = 34;
  const padT = 14;

  const max = Math.max(1, ...series.map((d) => Math.max(d.masuk, d.keluar)));
  const n = series.length || 1;
  const slot = (W - padL * 2) / n;
  const bw = Math.min(22, slot / 3.1);
  const scale = (v: number) => (H - padB - padT) * (v / max);

  const gridLines = [];
  for (let g = 0; g <= 4; g++) {
    const y = padT + (H - padB - padT) * (g / 4);
    gridLines.push(
      <line
        key={`grid-${g}`}
        x1={padL}
        y1={y.toFixed(1)}
        x2={W - padL}
        y2={y.toFixed(1)}
        stroke="#E4E4D6"
        strokeWidth="1"
      />
    );
  }

  return (
    <div className="w-full">
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Grafik pemasukan versus pengeluaran"
          className="w-full h-auto block"
        >
          {gridLines}
          {series.map((d, i) => {
            const cx = padL + slot * i + slot / 2;
            const h1 = scale(d.masuk);
            const h2 = scale(d.keluar);
            const y0 = H - padB;

            return (
              <g key={`bar-${i}`}>
                <rect
                  x={(cx - bw - 2).toFixed(1)}
                  y={(y0 - h1).toFixed(1)}
                  width={bw}
                  height={Math.max(h1, 1).toFixed(1)}
                  rx="4"
                  fill="#0B5733"
                >
                  <title>{`${esc(d.label)} — Pemasukan ${rp(d.masuk)}`}</title>
                </rect>
                <rect
                  x={(cx + 2).toFixed(1)}
                  y={(y0 - h2).toFixed(1)}
                  width={bw}
                  height={Math.max(h2, 1).toFixed(1)}
                  rx="4"
                  fill="#F2B927"
                >
                  <title>{`${esc(d.label)} — Pengeluaran ${rp(d.keluar)}`}</title>
                </rect>
                <text
                  x={cx.toFixed(1)}
                  y={H - 12}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6B7A72"
                  fontFamily="var(--font-poppins), sans-serif"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex gap-4 text-xs text-brand-muted mt-2.5 flex-wrap">
        <span className="flex items-center">
          <i className="w-2.5 h-2.5 rounded-[3px] inline-block mr-1.5 bg-brand-deep" />
          Pemasukan
        </span>
        <span className="flex items-center">
          <i className="w-2.5 h-2.5 rounded-[3px] inline-block mr-1.5 bg-brand-gold" />
          Pengeluaran
        </span>
      </div>
    </div>
  );
};
