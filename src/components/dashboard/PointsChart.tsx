
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart as LineChartIcon } from "lucide-react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface PointsDataItem {
  date: string;
  coursePoints: number;
  referralPoints: number;
  quizPoints: number;
  testPoints?: number;
  total?: number;
}

interface PointsChartProps {
  data: PointsDataItem[];
  title?: string;
  height?: number;
}

export function PointsChart({ data, title = "Points History", height = 300 }: PointsChartProps) {
  const [processedData, setProcessedData] = useState<PointsDataItem[]>([]);

  useEffect(() => {
    // Calculate totals and ensure all data points
    const processed = data.map(item => ({
      ...item,
      testPoints: item.testPoints || 0,
      total: (item.coursePoints || 0) + (item.referralPoints || 0) + (item.quizPoints || 0) + (item.testPoints || 0)
    }));
    setProcessedData(processed);
  }, [data]);

  const chartConfig = {
    coursePoints: {
      label: "Course Points",
      color: "#14F195"
    },
    referralPoints: {
      label: "Referral Points",
      color: "#9945FF"
    },
    quizPoints: {
      label: "Quiz Points",
      color: "#FF4500"
    },
    testPoints: {
      label: "Test Points",
      color: "#0EA5E9"
    },
    total: {
      label: "Total",
      color: "#ffffff"
    }
  };

  return (
    <Card className="border-border h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <LineChartIcon className="mr-2 h-5 w-5 text-[#14F195]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={height}>
              <LineChart
                data={processedData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltipContent
                          active={active}
                          payload={payload}
                          label={label}
                        />
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="coursePoints"
                  name="Course Points"
                  stroke="#14F195"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="referralPoints"
                  name="Referral Points"
                  stroke="#9945FF"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="quizPoints"
                  name="Quiz Points"
                  stroke="#FF4500"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="testPoints"
                  name="Test Points"
                  stroke="#0EA5E9"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
