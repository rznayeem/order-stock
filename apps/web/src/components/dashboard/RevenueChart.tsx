"use client";

import { useTheme } from "next-themes";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export function RevenueChart({ data }: { data: any[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const formatYAxis = (tickItem: number) => {
    if (tickItem === 0) return "$0";
    return `$${tickItem >= 1000 ? (tickItem / 1000).toFixed(1) + 'k' : tickItem}`;
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isDark ? "#8b5cf6" : "#6366f1"} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={isDark ? "#8b5cf6" : "#6366f1"} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#333" : "#e5e5e5"} />
          <XAxis 
            dataKey="label" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: isDark ? "#888" : "#666", fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            yAxisId="left"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: isDark ? "#888" : "#666", fontSize: 12 }}
            tickFormatter={formatYAxis}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#1f2937' : '#fff', 
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
            itemStyle={{ color: isDark ? '#fff' : '#000', fontWeight: 'bold' }}
            formatter={(value: number, name: string) => [
              name === 'revenue' ? `$${value.toFixed(2)}` : value, 
              name === 'revenue' ? 'Revenue' : 'Orders'
            ]}
          />
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey="revenue" 
            stroke={isDark ? "#8b5cf6" : "#6366f1"} 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
            name="revenue"
            activeDot={{ r: 6, strokeWidth: 0, fill: isDark ? "#8b5cf6" : "#6366f1" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
