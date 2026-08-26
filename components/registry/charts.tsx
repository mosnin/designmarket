"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { PvCard, PvMuted, bool, num, str } from "./kit";
import type { RegistryKey } from "@/lib/registry-manifest";
import type { RegistryEntry } from "./types";

/**
 * Charts render against the same `--pv-*` tokens as everything else, which is
 * why Theme Morph repaints them too — SVG `fill` and `stroke` take CSS
 * variables, so no colour is hard-coded here.
 */

const SERIES = [
  { label: "Jan", installs: 3200, renders: 1400 },
  { label: "Feb", installs: 4100, renders: 2200 },
  { label: "Mar", installs: 3800, renders: 2600 },
  { label: "Apr", installs: 5400, renders: 3100 },
  { label: "May", installs: 6900, renders: 4200 },
  { label: "Jun", installs: 6100, renders: 4800 },
  { label: "Jul", installs: 8200, renders: 5600 },
  { label: "Aug", installs: 9400, renders: 6900 },
];

const SPLIT = [
  { name: "Libraries", value: 23 },
  { name: "AI tools", value: 18 },
  { name: "Resources", value: 7 },
  { name: "Primitives", value: 6 },
];

const PIE_COLORS = [
  "var(--pv-primary)",
  "color-mix(in oklab, var(--pv-primary) 65%, var(--pv-background))",
  "color-mix(in oklab, var(--pv-primary) 40%, var(--pv-background))",
  "color-mix(in oklab, var(--pv-primary) 22%, var(--pv-background))",
];

const axisProps = {
  stroke: "var(--pv-muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

function ChartTooltip(): ReactNode {
  return (
    <Tooltip
      cursor={{ stroke: "var(--pv-border)", strokeWidth: 1 }}
      contentStyle={{
        background: "var(--pv-popover)",
        border: "1px solid var(--pv-border)",
        borderRadius: "var(--pv-radius)",
        color: "var(--pv-popover-foreground)",
        fontSize: 12,
        boxShadow: "0 8px 24px rgb(0 0 0 / 0.12)",
      }}
      labelStyle={{ color: "var(--pv-muted-foreground)", marginBottom: 4 }}
    />
  );
}

/**
 * ResponsiveContainer measures its parent, and a percentage height inside an
 * auto-height flex parent resolves to zero — so the chart frame carries a
 * definite height rather than `h-full`.
 */
function Frame({ children }: { children: ReactNode }): ReactNode {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children as never}
      </ResponsiveContainer>
    </div>
  );
}

/** A tiny deterministic walk for the sparkline, seeded by point count. */
function sparkData(points: number): { i: number; v: number }[] {
  const out: { i: number; v: number }[] = [];
  let value = 50;
  for (let i = 0; i < points; i++) {
    value += Math.sin(i * 1.7) * 9 + Math.cos(i * 0.6) * 5;
    out.push({ i, v: Math.round(Math.max(8, Math.min(96, value))) });
  }
  return out;
}

export const chartRegistry = {
  "recharts/area": {
    height: 300,
    usage: `<ResponsiveContainer width="100%" height={280}>
  <AreaChart data={data}>
    <defs>
      <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
      </linearGradient>
    </defs>
    <Area dataKey="installs" stroke="var(--primary)" fill="url(#fill)" />
  </AreaChart>
</ResponsiveContainer>`,
    render: (p) => {
      const curve = str(p, "curve", "monotone") as "monotone";
      const stacked = bool(p, "stacked", false);
      return (
        <Frame>
          <AreaChart data={SERIES} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="pv-area-a" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--pv-primary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--pv-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            {bool(p, "showGrid", true) ? (
              <CartesianGrid stroke="var(--pv-border)" strokeDasharray="3 3" vertical={false} />
            ) : null}
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} width={44} />
            {ChartTooltip()}
            <Area
              type={curve}
              dataKey="installs"
              stroke="var(--pv-primary)"
              strokeWidth={2}
              fill="url(#pv-area-a)"
              stackId={stacked ? "s" : undefined}
            />
            {stacked ? (
              <Area
                type={curve}
                dataKey="renders"
                stroke="var(--pv-muted-foreground)"
                strokeWidth={1.5}
                fill="var(--pv-muted)"
                stackId="s"
              />
            ) : null}
          </AreaChart>
        </Frame>
      );
    },
  },

  "recharts/bar": {
    height: 300,
    usage: `<BarChart data={data}>
  <Bar dataKey="installs" fill="var(--primary)" radius={[4, 4, 0, 0]} />
</BarChart>`,
    render: (p) => {
      const stacked = bool(p, "stacked", false);
      const horizontal = bool(p, "horizontal", false);
      return (
        <Frame>
          <BarChart
            data={SERIES}
            layout={horizontal ? "vertical" : "horizontal"}
            margin={{ top: 8, right: 8, bottom: 0, left: horizontal ? 4 : -18 }}
          >
            <CartesianGrid stroke="var(--pv-border)" strokeDasharray="3 3" vertical={horizontal} horizontal={!horizontal} />
            {horizontal ? (
              <>
                <XAxis type="number" {...axisProps} />
                <YAxis type="category" dataKey="label" width={36} {...axisProps} />
              </>
            ) : (
              <>
                <XAxis dataKey="label" {...axisProps} />
                <YAxis width={44} {...axisProps} />
              </>
            )}
            {ChartTooltip()}
            <Bar
              dataKey="installs"
              fill="var(--pv-primary)"
              radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              stackId={stacked ? "s" : undefined}
            />
            {stacked ? (
              <Bar dataKey="renders" fill="var(--pv-secondary)" stackId="s" />
            ) : null}
          </BarChart>
        </Frame>
      );
    },
  },

  "recharts/line": {
    height: 300,
    usage: `<LineChart data={data}>
  <Line dataKey="installs" stroke="var(--primary)" dot={false} />
</LineChart>`,
    render: (p) => {
      const series = Math.max(1, Math.min(2, num(p, "series", 2)));
      const dots = bool(p, "dots", false);
      return (
        <Frame>
          <LineChart data={SERIES} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <CartesianGrid stroke="var(--pv-border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis width={44} {...axisProps} />
            {ChartTooltip()}
            <Legend
              wrapperStyle={{ fontSize: 12, color: "var(--pv-muted-foreground)" }}
              iconType="plainline"
            />
            <Line
              type="monotone"
              dataKey="installs"
              stroke="var(--pv-primary)"
              strokeWidth={2}
              dot={dots}
              activeDot={{ r: 4 }}
            />
            {series > 1 ? (
              <Line
                type="monotone"
                dataKey="renders"
                stroke="var(--pv-muted-foreground)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={dots}
              />
            ) : null}
          </LineChart>
        </Frame>
      );
    },
  },

  "recharts/pie": {
    height: 300,
    usage: `<PieChart>
  <Pie data={data} dataKey="value" innerRadius={60} paddingAngle={2}>
    {data.map((_, i) => <Cell key={i} fill={colors[i]} />)}
  </Pie>
</PieChart>`,
    render: (p) => {
      const inner = Math.max(0, Math.min(80, num(p, "innerRadius", 60)));
      return (
        <Frame>
          <PieChart>
            {ChartTooltip()}
            <Pie
              data={SPLIT}
              dataKey="value"
              nameKey="name"
              innerRadius={inner}
              outerRadius="80%"
              paddingAngle={2}
              stroke="var(--pv-background)"
              strokeWidth={2}
              label={
                bool(p, "showLabel", true)
                  ? { fill: "var(--pv-muted-foreground)", fontSize: 11 }
                  : false
              }
            >
              {SPLIT.map((entry, index) => (
                <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Legend
              wrapperStyle={{ fontSize: 12, color: "var(--pv-muted-foreground)" }}
              iconType="circle"
            />
          </PieChart>
        </Frame>
      );
    },
  },

  "recharts/radial": {
    height: 280,
    usage: `<RadialBarChart data={[{ value: 72 }]} innerRadius="70%" startAngle={90} endAngle={-270}>
  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
  <RadialBar dataKey="value" background cornerRadius={12} />
</RadialBarChart>`,
    render: (p) => {
      const value = Math.max(0, Math.min(100, num(p, "value", 72)));
      return (
        <div className="relative h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={[{ name: "score", value }]}
              innerRadius="72%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar
                dataKey="value"
                cornerRadius={12}
                fill="var(--pv-primary)"
                background={{ fill: "var(--pv-secondary)" }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-3xl font-semibold text-pv-foreground tabular-nums">
              {value}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-pv-muted-foreground">
              Ship Score
            </span>
          </div>
        </div>
      );
    },
  },

  "tremor/kpi": {
    height: 200,
    usage: `<Card>
  <p className="text-sm text-muted-foreground">Weekly downloads</p>
  <Metric>73.0m</Metric>
  <BadgeDelta deltaType="increase">+12.4%</BadgeDelta>
</Card>`,
    render: (p) => {
      const trend = str(p, "trend", "up");
      const up = trend === "up";
      const flat = trend === "flat";
      return (
        <div className="grid w-full gap-3 sm:grid-cols-2">
          {[
            { label: "Weekly downloads", value: "73.0m", delta: "+12.4%" },
            { label: "Bundle size", value: "12.3 kB", delta: "-3.1%" },
          ].map((stat, index) => (
            <PvCard key={stat.label} className="p-4">
              <p className="text-[13px] text-pv-muted-foreground">{stat.label}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-semibold tabular-nums">
                  {stat.value}
                </span>
                {!flat ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
                      up
                        ? "bg-pv-primary/12 text-pv-primary"
                        : "bg-pv-destructive/12 text-pv-destructive"
                    )}
                  >
                    {up ? (
                      <TrendingUp className="size-3" />
                    ) : (
                      <TrendingDown className="size-3" />
                    )}
                    {stat.delta}
                  </span>
                ) : null}
              </div>
              {bool(p, "showSparkline", true) ? (
                <div className="mt-3 h-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData(24 + index * 4)}>
                      <defs>
                        <linearGradient id={`pv-kpi-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--pv-primary)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="var(--pv-primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke="var(--pv-primary)"
                        strokeWidth={1.5}
                        fill={`url(#pv-kpi-${index})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : null}
            </PvCard>
          ))}
        </div>
      );
    },
  },

  "tremor/sparkline": {
    height: 160,
    usage: `<SparkAreaChart data={data} categories={["v"]} index="i" className="h-8 w-24" />`,
    render: (p) => {
      const variant = str(p, "variant", "area");
      const points = Math.max(6, Math.min(60, num(p, "points", 24)));
      const data = sparkData(points);
      return (
        <div className="flex w-full max-w-sm flex-col gap-3">
          {["Renders", "Copies", "Installs"].map((label, index) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-[13px] text-pv-muted-foreground">
                {label}
              </span>
              <div className="h-8 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  {variant === "bars" ? (
                    <BarChart data={data}>
                      <Bar dataKey="v" fill="var(--pv-primary)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  ) : variant === "line" ? (
                    <LineChart data={data}>
                      <Line
                        type="monotone"
                        dataKey="v"
                        stroke="var(--pv-primary)"
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </LineChart>
                  ) : (
                    <AreaChart data={data}>
                      <defs>
                        <linearGradient id={`pv-spark-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--pv-primary)" stopOpacity={0.45} />
                          <stop offset="100%" stopColor="var(--pv-primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke="var(--pv-primary)"
                        strokeWidth={1.5}
                        fill={`url(#pv-spark-${index})`}
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
              <span className="w-10 shrink-0 text-right font-mono text-[12px] tabular-nums text-pv-muted-foreground">
                {data[data.length - 1]?.v}
              </span>
            </div>
          ))}
          <PvMuted className="text-[11px]">
            Axis-free by design — sized to sit inside a table cell.
          </PvMuted>
        </div>
      );
    },
  },
} satisfies Partial<Record<RegistryKey, RegistryEntry>>;
