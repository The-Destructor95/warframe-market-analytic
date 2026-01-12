'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type PriceHistoryData = {
  timestamp: Date;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  median: number;
  volume: number;
};

type PriceChartProps = {
  data: PriceHistoryData[];
};

export function PriceChart({ data }: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        Pas encore de données d&apos;historique. Attendez le prochain polling.
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map((item) => ({
    date: new Date(item.timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
    min: item.minPrice,
    max: item.maxPrice,
    avg: item.avgPrice,
    median: item.median,
  }));

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{
              value: 'Platinum',
              angle: -90,
              position: 'insideLeft',
              style: { fill: 'hsl(var(--muted-foreground))' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="min"
            stroke="#10b981"
            strokeWidth={2}
            name="Min"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="avg"
            stroke="#f59e0b"
            strokeWidth={2}
            name="Moyenne"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="median"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Médiane"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="max"
            stroke="#ef4444"
            strokeWidth={2}
            name="Max"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
