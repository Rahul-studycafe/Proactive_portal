"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { PortalSidebar } from "@/components/layout/PortalSidebar";
import { PortalTopBar } from "@/components/layout/PortalTopBar";
import { useGetPortalWebsiteConfigQuery } from "@/lib/services/api";

export function PortalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage =
    !pathname ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/magic-login");

  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("portalAccessToken");
      setHasToken(!!token);

      if (!token && !isAuthPage) {
        router.replace("/login");
      }
    }
  }, [pathname, isAuthPage, router]);

  const { data: websiteConfig } = useGetPortalWebsiteConfigQuery(undefined, {
    skip: isAuthPage,
  });
  const brandColor = websiteConfig?.branding?.brandColor || "#2563eb";

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (hasToken === null || (!hasToken && !isAuthPage)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background print:h-auto print:overflow-visible print:bg-white print:block">
      <PortalSidebar />
      <div className="flex flex-1 flex-col overflow-hidden print:h-auto print:overflow-visible print:block">
        <PortalTopBar />
        <main className="flex-1 overflow-y-auto p-6 print:h-auto print:overflow-visible print:p-0 print:block">
          {children}
        </main>
      </div>
    </div>
  );
}
