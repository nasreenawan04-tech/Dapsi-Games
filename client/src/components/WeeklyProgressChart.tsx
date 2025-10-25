import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface WeeklyProgressChartProps {
  data: Array<{
    date: string;
    studyTime: number;
    xpEarned: number;
    tasksCompleted: number;
  }>;
}

export function WeeklyProgressChart({ data }: WeeklyProgressChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Weekly Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80" data-testid="chart-weekly-progress">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="studyTime"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Study Time (min)"
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="xpEarned"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                name="XP Earned"
                dot={{ fill: "hsl(var(--secondary))", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-center p-3 rounded-lg bg-primary/10">
            <p className="text-sm text-muted-foreground mb-1">Total Study Time</p>
            <p className="text-2xl font-bold text-primary" data-testid="text-total-study-time">
              {data.reduce((sum, day) => sum + day.studyTime, 0)} min
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/10">
            <p className="text-sm text-muted-foreground mb-1">Total XP Earned</p>
            <p className="text-2xl font-bold text-secondary" data-testid="text-total-xp-earned">
              {data.reduce((sum, day) => sum + day.xpEarned, 0)} XP
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
