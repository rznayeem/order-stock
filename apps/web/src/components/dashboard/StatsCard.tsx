import { Card, CardContent } from "@repo/ui/components/card";
import { motion } from "motion/react";
import { cn } from "@repo/ui/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  delay?: number;
  trend?: string;
  warning?: boolean;
}

export function StatsCard({ title, value, subtitle, icon, delay = 0, trend, warning }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className={cn(
        "overflow-hidden border-none shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative",
        warning ? "bg-warning/5" : ""
      )}>
        {/* Animated background glow */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
        
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
                {trend && (
                  <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                    {trend}
                  </span>
                )}
              </div>
            </div>
            <div className={cn(
              "p-3 rounded-2xl",
              warning ? "bg-warning/20" : "bg-primary/10"
            )}>
              {icon}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">{subtitle}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
