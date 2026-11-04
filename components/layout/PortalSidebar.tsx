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
  ChevronDown,
  Sparkles,
  FileText,
  Receipt,
  Wallet,
  BookOpen,
} from "lucide-react";
import { useGetPortalWebsiteConfigQuery } from "@/lib/services/api";

interface SubNavItem {
  to: string;
  label: string;
  icon?: any;
}

interface PortalNavItem {
  to: string;
  label: string;
  icon: any;
  exact?: boolean;
  children?: SubNavItem[];
}

const navItems: PortalNavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/compliance", label: "Compliance Calendar", icon: CalendarDays },
  { to: "/documents", label: "Filed Documents", icon: Files },
  {
    to: "/billing/invoices",
    label: "Invoices & Billing",
    icon: CreditCard,
    children: [
      { to: "/billing/invoices", label: "Invoices", icon: FileText },
      { to: "/billing/receipts", label: "Receipts", icon: Receipt },
      { to: "/billing/outlays", label: "Outlays", icon: Wallet },
      { to: "/billing/ledger", label: "Ledger", icon: BookOpen },
    ],
  },
  { to: "/requests", label: "Document Requests", icon: FileUp },
  { to: "/support", label: "Help & Support", icon: HelpCircle },
  { to: "/profile", label: "Account Profile", icon: ShieldCheck },
];

export function PortalSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [billingOpen, setBillingOpen] = useState(true);
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
          const isBilling = !!item.children;
          const active = item.exact
            ? pathname === item.to || pathname === "/portal"
            : isBilling
            ? pathname.startsWith("/billing")
            : pathname === item.to || pathname.startsWith(item.to);

          return (
            <div key={item.to} className="space-y-0.5">
              <div className="flex items-center">
                <Link
                  href={item.to}
                  className={`flex flex-1 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                </Link>
                {isBilling && !collapsed && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setBillingOpen((v) => !v);
                    }}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-md transition-colors mr-1"
                    title={billingOpen ? "Collapse submenu" : "Expand submenu"}
                  >
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        billingOpen ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Expandable Submenu (Invoices, Receipts, Outlays, Ledger) */}
              {isBilling && !collapsed && billingOpen && (
                <div className="ml-5 space-y-0.5 border-l-2 border-primary/20 pl-2.5 py-0.5">
                  {item.children!.map((sub) => {
                    const isSubActive =
                      pathname === sub.to ||
                      (sub.to === "/billing/invoices" && (pathname === "/billing" || pathname === "/billing/"));
                    const SubIcon = sub.icon;

                    return (
                      <Link
                        key={sub.to}
                        href={sub.to}
                        className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          isSubActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        }`}
                      >
                        {SubIcon && (
                          <SubIcon
                            className={`h-3.5 w-3.5 shrink-0 ${
                              isSubActive ? "text-primary" : "opacity-60"
                            }`}
                          />
                        )}
                        <span>{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
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
