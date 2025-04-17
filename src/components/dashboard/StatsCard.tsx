
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
  gradientClass?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className = "",
  gradientClass = "from-[#14F195] to-[#9945FF]"
}: StatsCardProps) {
  return (
    <Card className={`border-border overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <div className="relative mr-3">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradientClass} opacity-20 animate-spin-slow`}></div>
            <div className={`relative z-10 p-2 rounded-full bg-gradient-to-br ${gradientClass}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={`flex items-center mt-2 text-sm ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
            <span>{trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
            <span className="ml-1 text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
