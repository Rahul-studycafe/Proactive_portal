"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usePortalVerifyMagicLinkMutation } from "@/lib/services/api";

export default function MagicLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [verifyMagicLink, { isLoading }] = usePortalVerifyMagicLinkMutation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setErrorMsg("No magic link token provided in URL.");
      return;
    }

    const verify = async () => {
      try {
        const res = await verifyMagicLink({ token }).unwrap();
        if (typeof window !== "undefined") {
          localStorage.setItem("portalAccessToken", res.accessToken);
          if (res.user) {
            localStorage.setItem("portalUser", JSON.stringify(res.user));
          }
        }
        setSuccess(true);
        setTimeout(() => {
          router.replace("/");
        }, 1200);
      } catch (err: any) {
        setErrorMsg(
          err?.data?.error?.message ||
          err?.data?.message ||
          "Magic sign-in link is invalid or has expired."
        );
      }
    };

    verify();
  }, [token, verifyMagicLink, router]);

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-[400px] text-center shadow-lg border-border">
        <CardHeader>
          <CardTitle className="text-lg">Magic Link Verification</CardTitle>
          <CardDescription className="text-xs">
            Authenticating your client portal session...
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6 flex flex-col items-center justify-center space-y-4">
          {isLoading && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Verifying security token...</p>
            </>
          )}

          {success && (
            <>
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="text-sm font-semibold text-emerald-600">
                Verified! Redirecting to your dashboard...
              </p>
            </>
          )}

          {errorMsg && (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="text-xs text-destructive max-w-xs">{errorMsg}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-xs"
                onClick={() => router.push("/portal/login")}
              >
                Back to Sign In
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
