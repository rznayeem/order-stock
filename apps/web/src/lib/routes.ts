import {
  LayoutDashboard, Package, ShoppingCart, AlertTriangle,
  Activity, FolderOpen, Settings, Users
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon?: any;
  roles?: string[];
  items?: { title: string; href: string }[];
}

export const dashboardRoutes: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }, // Accessible by everyone
  { title: "Products", href: "/dashboard/products", icon: Package, roles: ["ADMIN", "MANAGER"] },
  { title: "Categories", href: "/dashboard/categories", icon: FolderOpen, roles: ["ADMIN", "MANAGER"] },
  { title: "Orders", href: "/dashboard/orders", icon: ShoppingCart, roles: ["ADMIN", "MANAGER", "USER"] },
  { title: "Restock Queue", href: "/dashboard/restock", icon: AlertTriangle, roles: ["ADMIN", "MANAGER"] },
  { title: "Activity Log", href: "/dashboard/activity", icon: Activity, roles: ["ADMIN", "MANAGER"] },
  { 
    title: "User Management", 
    href: "/dashboard/users", 
    icon: Users, 
    roles: ["ADMIN"],
    items: [
      { title: "User List", href: "/dashboard/users" },
      { title: "Create User", href: "/dashboard/users/create" }
    ]
  },
  { title: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["ADMIN"] },
];
