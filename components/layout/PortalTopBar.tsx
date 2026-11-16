"use client";

import { useRouter } from "next/navigation";
import { Search, LogOut, User, Bell, Building2, Briefcase, ChevronDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { toast } from "sonner";
import {
  useGetPortalProfileQuery,
  usePortalLogoutMutation,
  useGetPortalMyFirmsQuery,
  usePortalSwitchFirmMutation,
} from "@/lib/services/api";

export function PortalTopBar() {
  const router = useRouter();
  const { data: profileData } = useGetPortalProfileQuery();
  const [portalLogout] = usePortalLogoutMutation();
  const { data: myFirms = [] } = useGetPortalMyFirmsQuery();
  const [switchFirm, { isLoading: isSwitchingFirm }] = usePortalSwitchFirmMutation();

  const user = profileData?.user;
  const client = profileData?.client;
  const practice = profileData?.practice;

  const handleFirmSwitch = async (targetFirm: any) => {
    try {
      const res = await switchFirm({ targetClientUserId: targetFirm.clientUserId }).unwrap();
      if (typeof window !== "undefined") {
        localStorage.setItem("portalAccessToken", res.accessToken);
        if (res.user) {
          localStorage.setItem("portalUser", JSON.stringify(res.user));
        }
      }
      toast.success(`Switched to ${targetFirm.firmName}`);
      router.push("/");
      window.location.reload();
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.data?.message || "Failed to switch workspace");
    }
  };

  const handleLogout = async () => {
    try {
      await portalLogout().unwrap();
    } catch {
      // ignore
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("portalAccessToken");
        localStorage.removeItem("portalUser");
      }
      router.push("/login");
    }
  };

  const initials =
    user?.name
      ?.split(" ")
      ?.map((p: string) => p[0])
      ?.slice(0, 2)
      ?.join("")
      ?.toUpperCase() || "C";

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-6 print:hidden">
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search filed documents, compliance dates, invoices..."
          className="pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {/* Client Business Context */}
        {client && (
          <div className="hidden sm:flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-xs">
            <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-semibold text-foreground truncate max-w-[160px]">
              {client.name}
            </span>
            {client.pan && (
              <span className="font-mono text-[11px] text-muted-foreground border-l pl-2">
                PAN: {client.pan}
              </span>
            )}
          </div>
        )}

        {/* Firm / Practice Workspace Switcher (Multi-Firm Support) */}
        {myFirms.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                disabled={isSwitchingFirm}
                className="flex items-center gap-2 rounded-lg border border-border/80 bg-accent/40 hover:bg-accent px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors cursor-pointer"
                title="Switch Practice Workspace"
              >
                <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate max-w-[150px]">{practice?.name || "Practice Workspace"}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Switch Practice Workspace
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {myFirms.map((f: any) => {
                const isActive = f.isCurrent;
                return (
                  <DropdownMenuItem
                    key={f.clientUserId}
                    disabled={isActive || isSwitchingFirm}
                    onClick={() => handleFirmSwitch(f)}
                    className="flex items-center justify-between py-2 cursor-pointer"
                  >
                    <div className="flex flex-col truncate pr-2">
                      <span className={`text-xs font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
                        {f.firmName}
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate">
                        {f.clientName}
                      </span>
                    </div>
                    {isActive && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span className="hidden text-sm font-medium text-muted-foreground md:inline">
            {practice?.name || "Client Portal"}
          </span>
        )}

        {/* Global Theme Switcher */}
        <ThemeToggle />

        <button
          className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md p-1 transition-colors hover:bg-accent cursor-pointer">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {initials}
              </div>
              <div className="hidden text-left md:block">
                <div className="text-sm font-medium leading-tight">
                  {user?.name || "Client User"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user?.role || "Client"}
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
