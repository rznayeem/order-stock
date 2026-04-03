"use client";

import { useSession } from "@/lib/auth-client";
import { useActivityLogs } from "@/react-query/activity/activity-queries";
import { motion } from "motion/react";
import { Skeleton } from "@repo/ui/components/skeleton";
import { 
  ShoppingCart, Package, PackagePlus, AlertTriangle, FolderOpen, AlertCircle, Edit, Trash2, CheckCircle, Upload, Activity
} from "lucide-react";
import { format } from "date-fns";

export default function ActivityLogPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { data: logs, isLoading } = useActivityLogs(userId, 50);

  const getLogIcon = (type: string) => {
    switch (type) {
      case "ORDER_CREATED": return <ShoppingCart className="h-4 w-4 text-primary" />;
      case "ORDER_UPDATED": return <Edit className="h-4 w-4 text-blue-500" />;
      case "ORDER_CANCELLED": return <Trash2 className="h-4 w-4 text-destructive" />;
      case "ORDER_SHIPPED": return <Upload className="h-4 w-4 text-secondary" />;
      case "ORDER_DELIVERED": return <CheckCircle className="h-4 w-4 text-success" />;
      case "PRODUCT_ADDED": return <Package className="h-4 w-4 text-purple-500" />;
      case "PRODUCT_UPDATED": return <Edit className="h-4 w-4 text-blue-500" />;
      case "PRODUCT_RESTOCKED": return <PackagePlus className="h-4 w-4 text-success" />;
      case "CATEGORY_CREATED": return <FolderOpen className="h-4 w-4 text-orange-500" />;
      case "RESTOCK_QUEUE_ADDED": return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "USER_LOGIN": return <CheckCircle className="h-4 w-4 text-success" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getLogColor = (type: string) => {
    if (type.includes('ORDER')) return "bg-primary/10 border-primary/20";
    if (type.includes('RESTOCK') && !type.includes('ADDED')) return "bg-success/10 border-success/20";
    if (type.includes('QUEUE')) return "bg-warning/10 border-warning/20";
    if (type.includes('CANCELLED')) return "bg-destructive/10 border-destructive/20";
    return "bg-slate-100 dark:bg-slate-800 border-border";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground mt-1">Timeline of all system events and operations.</p>
      </div>

      <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl border border-slate-200 dark:border-[#333] shadow-sm p-6 lg:p-10">
        <div className="relative border-l-2 border-border/50 ml-4 space-y-8 pb-4">
          
          {isLoading ? (
            [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="relative pl-8">
                 <div className="absolute -left-[17px] top-1 h-8 w-8 rounded-full bg-muted border-4 border-background animate-pulse" />
                 <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ))
          ) : logs?.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No activities recorded yet.</p>
            </div>
          ) : (
            logs?.map((log: any, index: number) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative pl-8"
              >
                {/* Timeline Node */}
                <div className={`absolute -left-[17px] top-1.5 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white dark:border-[#1E1E1E] shadow-sm z-10 ${getLogColor(log.type)}`}>
                  {getLogIcon(log.type)}
                </div>
                
                {/* Content Card */}
                <div className={`p-4 rounded-2xl border transition-all hover:shadow-md bg-background ${getLogColor(log.type)}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                      {log.message}
                    </h4>
                    <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full shrink-0 border border-border/50">
                      {format(new Date(log.createdAt), "MMM d, h:mm a")}
                    </span>
                  </div>
                  
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-2 text-xs font-mono bg-black/5 dark:bg-white/5 p-2 rounded-lg text-muted-foreground overflow-x-auto">
                      {JSON.stringify(log.metadata)}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
