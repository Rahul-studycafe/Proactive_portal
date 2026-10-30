"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Files,
  CreditCard,
  FileUp,
  HelpCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useGetPortalWebsiteConfigQuery } from "@/lib/services/api";

interface PortalNavItem {
  to: string;
  label: string;
  icon: any;
  exact?: boolean;
}

const navItems: PortalNavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/compliance", label: "Compliance Calendar", icon: CalendarDays },
  { to: "/documents", label: "Filed Documents", icon: Files },
  { to: "/billing", label: "Invoices & Billing", icon: CreditCard },
  { to: "/requests", label: "Document Requests", icon: FileUp },
  { to: "/support", label: "Help & Support", icon: HelpCircle },
  { to: "/profile", label: "Account Profile", icon: ShieldCheck },
];

export function PortalSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname() || "";
  const { data: websiteConfig } = useGetPortalWebsiteConfigQuery();
  const branding = websiteConfig?.branding;

  return (
    <aside
      className={`relative flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-200 print:hidden ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-2 border-b px-4">
        {branding?.logoUrl ? (
          <img
            src={branding.logoUrl}
            alt="Logo"
            className="h-8 w-8 shrink-0 object-contain rounded-md"
          />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
        )}
        {!collapsed && (
          <span className="text-base font-semibold tracking-tight truncate">
            {branding?.firmName || "Proactive"}
          </span>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.to || pathname === "/portal"
            : pathname === item.to || pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              href={item.to}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="m-2 flex items-center justify-center rounded-md border bg-card p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
        aria-label="Toggle sidebar"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </aside>
  );
}
