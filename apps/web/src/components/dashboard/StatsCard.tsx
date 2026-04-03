import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { motion } from "motion/react";
import { cn } from "@repo/ui/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  delay?: number;
  trend?: {
    value: string;
    label: string;
    positive?: boolean;
  };
}

export function StatsCard({ title, value, description, icon, delay = 0, trend }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium tracking-tight">{title}</CardTitle>
          <div className="text-muted-foreground">{icon}</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          {(trend || description) && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              {trend && (
                <span className={cn(
                  "font-medium",
                  trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}>
                  {trend.value}
                </span>
              )}
              {trend ? <span>{trend.label}</span> : description && <span>{description}</span>}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
