"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, type LucideIcon } from "lucide-react"

import { cn } from "@repo/ui/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@repo/ui/components/sidebar"

export interface NavItem {
  title: string
  href: string
  icon?: LucideIcon
  isActive?: boolean
  roles?: string[]
  items?: {
    title: string
    href: string
  }[]
}

export interface NavGroupProps {
  title?: string
  items: NavItem[]
}

import { useSession } from "@/lib/auth-client"

export function NavGroup({ title, items }: NavGroupProps) {
  const { state } = useSidebar()
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role || "USER"

  const filteredItems = items.filter(item => {
    if (!item.roles) return true; // accessible by all
    return item.roles.includes(userRole);
  });

  return (
    <SidebarGroup>
      {title && state === "expanded" && (
        <SidebarGroupLabel>{title}</SidebarGroupLabel>
      )}
      <SidebarMenu>
        {filteredItems.map((item) => {
          const isParentActive = pathname.startsWith(item.href)
          
          if (!item.items?.length) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.title}
                >
                  <Link href={item.href}>
                    {item.icon && <item.icon />}
                    {state === "expanded" && <span>{item.title}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isParentActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} isActive={isParentActive}>
                    {item.icon && <item.icon />}
                    {state === "expanded" && (
                      <>
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </>
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === subItem.href}
                        >
                          <Link href={subItem.href}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
