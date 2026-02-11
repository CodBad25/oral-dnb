type Slice = {
  label: string;
  value: number;
  color: string;
};

interface PieChartProps {
  data: Slice[];
  size?: number;
  title?: string;
  showLegend?: boolean;
}

export const PieChart = ({ data, size = 120, title, showLegend = false }: PieChartProps) => {
  const r = size / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;

  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-1">
        {title && <p className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center">{title}</p>}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth={1} />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="currentColor" fontSize={10} opacity={0.4}>
            —
          </text>
        </svg>
      </div>
    );
  }

  const slices: { d: string; color: string; label: string; pct: number }[] = [];
  let cumAngle = -Math.PI / 2;

  for (const slice of data) {
    if (slice.value === 0) continue;
    const pct = slice.value / total;
    const sliceAngle = pct * 2 * Math.PI;

    if (pct >= 0.999) {
      // Full circle
      slices.push({
        d: '',
        color: slice.color,
        label: slice.label,
        pct,
      });
    } else {
      const x1 = cx + r * Math.cos(cumAngle);
      const y1 = cy + r * Math.sin(cumAngle);
      cumAngle += sliceAngle;
      const x2 = cx + r * Math.cos(cumAngle);
      const y2 = cy + r * Math.sin(cumAngle);
      const largeArc = sliceAngle > Math.PI ? 1 : 0;

      slices.push({
        d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
        color: slice.color,
        label: slice.label,
        pct,
      });
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {title && (
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center leading-tight max-w-[120px]">
          {title}
        </p>
      )}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="text-gray-600 dark:text-gray-300"
      >
        {slices.map((s, i) =>
          s.d === '' ? (
            <circle key={i} cx={cx} cy={cy} r={r} fill={s.color} />
          ) : (
            <path key={i} d={s.d} fill={s.color} stroke="white" strokeWidth={1} />
          ),
        )}
      </svg>
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 mt-1">
          {data
            .filter((d) => d.value > 0)
            .map((d, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: d.color }} />
                <span className="text-[10px] text-gray-600 dark:text-gray-400">{d.label}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
