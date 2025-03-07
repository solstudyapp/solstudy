
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: number;
}

const StatCard = ({ title, value, description, icon, trend }: StatCardProps) => (
  <Card className="admin-card">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="p-2 bg-white/10 rounded-full">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-white/70 mt-1">{description}</p>
      {trend !== undefined && (
        <div className="flex items-center mt-4">
          <div className={`text-xs flex items-center ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
            <ArrowUpRight size={14} className="ml-1" />
          </div>
          <div className="text-xs text-white/50 ml-2">from last month</div>
        </div>
      )}
    </CardContent>
  </Card>
);

export default StatCard;
