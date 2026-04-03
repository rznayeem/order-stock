import {
  LayoutDashboard, Package, ShoppingCart, AlertTriangle,
  Activity, FolderOpen, Settings,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  roles?: string[];
}

export const dashboardRoutes: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Products", href: "/dashboard/products", icon: Package },
  { title: "Categories", href: "/dashboard/categories", icon: FolderOpen },
  { title: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { title: "Restock Queue", href: "/dashboard/restock", icon: AlertTriangle },
  { title: "Activity Log", href: "/dashboard/activity", icon: Activity },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];
