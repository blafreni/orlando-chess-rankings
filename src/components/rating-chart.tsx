import { useId } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { roundRating } from "@/lib/elo";
import { formatClubDate } from "@/lib/utils";

export function RatingChart({
  history,
}: {
  history: Array<{ date: string; rating: number }>;
}) {
  const gradientId = useId();
  const data = history.map((point) => ({
    date: point.date,
    rating: roundRating(point.rating),
  }));

  if (data.length < 2) {
    return (
      <p className="text-lg text-muted">
        Rating history will show here after a few games.
      </p>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2c4a3e" />
              <stop offset="100%" stopColor="#6b5344" />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => formatClubDate(value).replace(/^\w{3},\s/, "")}
            tick={{ fill: "#5c564e", fontSize: 12 }}
            axisLine={{ stroke: "#d4cbb8" }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            domain={["dataMin - 20", "dataMax + 20"]}
            tick={{ fill: "#5c564e", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: "#faf6ee",
              border: "1px solid #d4cbb8",
              borderRadius: 12,
              fontSize: 16,
            }}
            labelFormatter={(value) => formatClubDate(String(value))}
            formatter={(value) => [value, "Rating"]}
          />
          <Line
            type="monotone"
            dataKey="rating"
            stroke={`url(#${gradientId})`}
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, fill: "#2c4a3e" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
