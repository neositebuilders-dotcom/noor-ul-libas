import { formatDate, formatPKR } from "@/lib/format";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SeriesPoint = { date: string; revenue: number; orders: number };

export function RevenueChart({ series }: { series: SeriesPoint[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B68A3A" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#B68A3A" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E7DAC9" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => value.slice(5)}
            tick={{ fontSize: 9, fill: "#7C6A5B" }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "#7C6A5B" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) =>
              value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
            }
          />
          <Tooltip
            formatter={(value: number, name: string) =>
              name === "revenue" ? formatPKR(value) : value
            }
            labelFormatter={(label: string) => formatDate(new Date(label).getTime())}
            contentStyle={{
              fontSize: 11,
              border: "1px solid #E7DAC9",
              borderRadius: 2,
              background: "#FFFCF8",
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#B68A3A"
            strokeWidth={1.5}
            fill="url(#revenueFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryBarChart({
  data,
}: {
  data: { name: string; revenue: number }[];
}) {
  return (
    <div className="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data.slice(0, 6)}
          layout="vertical"
          margin={{ left: 6, right: 12, top: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E7DAC9" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={96}
            tick={{ fontSize: 9, fill: "#7C6A5B" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => formatPKR(value)}
            contentStyle={{
              fontSize: 11,
              border: "1px solid #E7DAC9",
              borderRadius: 2,
              background: "#FFFCF8",
            }}
          />
          <Bar dataKey="revenue" fill="#35251C" radius={[0, 2, 2, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
