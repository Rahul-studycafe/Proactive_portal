"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  KeyRound,
  Mail,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  CheckCircle2,
  Lock,
  Building2,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  usePortalLoginMutation,
  usePortalRequestOtpMutation,
  usePortalVerifyOtpMutation,
  usePortalSendMagicLinkMutation,
  useGetPortalWebsiteConfigQuery,
} from "@/lib/services/api";

export default function PortalLoginPage() {
  const router = useRouter();

  // Load agency white-label CMS branding (Phase F-121)
  const { data: websiteConfig } = useGetPortalWebsiteConfigQuery();

  const [portalLogin, { isLoading: isLoggingIn }] = usePortalLoginMutation();
  const [requestOtp, { isLoading: isRequestingOtp }] = usePortalRequestOtpMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = usePortalVerifyOtpMutation();
  const [sendMagicLink, { isLoading: isSendingMagic }] = usePortalSendMagicLinkMutation();

  // Tab state: OTP Login is default per Phase F-122
  const [activeTab, setActiveTab] = useState<"otp" | "password" | "magic">("otp");

  // Password Login state
  const [passwordEmailOrPhone, setPasswordEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP Login state
  const [otpIdentifier, setOtpIdentifier] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Magic Link state
  const [magicEmail, setMagicEmail] = useState("");
  const [magicSent, setMagicSent] = useState(false);

  // OTP Countdown timer (60s)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Handle successful login
  const handleAuthSuccess = (data: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("portalAccessToken", data.accessToken);
      if (data.user) {
        localStorage.setItem("portalUser", JSON.stringify(data.user));
      }
    }
    toast.success("Welcome back! Redirecting to your portal...");
    router.push("/");
  };

  // Password submission
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordEmailOrPhone || !password) {
      toast.error("Please enter both email/phone and your password");
      return;
    }

    try {
      const res = await portalLogin({
        emailOrPhone: passwordEmailOrPhone,
        password,
      }).unwrap();
      handleAuthSuccess(res);
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.data?.message || "Invalid credentials");
    }
  };

  // Request OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otpIdentifier) {
      toast.error("Please enter your registered email or phone number");
      return;
    }

    try {
      const res = await requestOtp({ identifier: otpIdentifier }).unwrap();
      setOtpSent(true);
      setResendCooldown(60);
      toast.success("Verification code sent!");
      if (res.debugOtp) {
        setOtpCode(res.debugOtp);
      }
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.data?.message || "Failed to send OTP");
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      toast.error("Please enter the complete 6-digit verification code");
      return;
    }

    try {
      const res = await verifyOtp({
        identifier: otpIdentifier,
        code: otpCode,
      }).unwrap();
      handleAuthSuccess(res);
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.data?.message || "Invalid or expired OTP");
    }
  };

  // Send Magic Link
  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicEmail) {
      toast.error("Please enter your registered email address");
      return;
    }

    try {
      await sendMagicLink({ email: magicEmail }).unwrap();
      setMagicSent(true);
      toast.success("Magic sign-in link dispatched to your inbox!");
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.data?.message || "Failed to send magic link");
    }
  };

  const branding = websiteConfig?.branding || {
    firmName: "Proactive Advisory",
    brandColor: "#2563eb",
    logoUrl: "",
  };
  const hero = websiteConfig?.hero || {
    title: "Client Self-Service Portal",
    subtitle: "Track statutory filings, view acknowledged tax returns, and access invoices securely.",
  };
  const contact = websiteConfig?.contact;

  return (
    <div
      className="min-h-screen bg-linear-to-br from-slate-50 via-slate-100/60 to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-between p-4 sm:p-6"
    >
      <div />

      {/* Main Container */}
      <div className="flex flex-col items-center justify-center my-auto w-full">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center space-y-3 max-w-md">
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.firmName}
              className="h-14 w-auto max-w-[200px] object-contain rounded-lg shadow-xs"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <Shield className="h-7 w-7" />
            </div>
          )}

          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-primary block">
              {branding.firmName}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-0.5">
              {hero.title}
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {hero.subtitle}
          </p>
        </div>

        {/* Main Login Card (Phase F-122) */}
        <Card className="w-full max-w-[440px] shadow-xl border-border/80 bg-card/95 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <Tabs
              value={activeTab}
              onValueChange={(val) => {
                setActiveTab(val as any);
                setOtpSent(false);
                setMagicSent(false);
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="otp" className="text-xs font-medium">OTP Login</TabsTrigger>
                <TabsTrigger value="password" className="text-xs font-medium">Password</TabsTrigger>
                <TabsTrigger value="magic" className="text-xs font-medium">Magic Link</TabsTrigger>
              </TabsList>

              {/* TAB 1: OTP Login (Default) */}
              <TabsContent value="otp" className="pt-4 space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="otp-target" className="text-xs font-medium">Mobile Number or Email</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-60" />
                        <Input
                          id="otp-target"
                          type="text"
                          placeholder="Registered mobile or email"
                          className="pl-9 text-xs"
                          value={otpIdentifier}
                          onChange={(e) => setOtpIdentifier(e.target.value)}
                          required
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        We will send a 6-digit one-time passcode valid for 10 minutes.
                      </p>
                    </div>

                    <Button type="submit" className="w-full gap-2 shadow-xs" disabled={isRequestingOtp}>
                      {isRequestingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      Send Verification Code
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                        <div>
                          <span>Code sent to <strong>{otpIdentifier}</strong></span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[11px] text-primary hover:underline font-medium shrink-0"
                      >
                        Change
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="otp-code" className="text-xs font-medium">Enter 6-Digit Code</Label>
                        {resendCooldown > 0 ? (
                          <span className="text-[11px] text-muted-foreground">
                            Resend in {resendCooldown}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRequestOtp()}
                            disabled={isRequestingOtp}
                            className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
                          >
                            <RefreshCw className="h-3 w-3" /> Resend Code
                          </button>
                        )}
                      </div>
                      <Input
                        id="otp-code"
                        type="text"
                        maxLength={6}
                        placeholder="••••••"
                        className="text-center font-mono text-lg tracking-[0.5em] h-11"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        autoFocus
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full gap-2 shadow-xs" disabled={isVerifyingOtp}>
                      {isVerifyingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      Verify Code & Sign In
                    </Button>
                  </form>
                )}
              </TabsContent>

              {/* TAB 2: Password Login */}
              <TabsContent value="password" className="pt-4 space-y-4">
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email-phone" className="text-xs font-medium">Registered Email or Phone</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-60" />
                      <Input
                        id="email-phone"
                        type="text"
                        placeholder="name@company.com or 9876543210"
                        className="pl-9 text-xs"
                        value={passwordEmailOrPhone}
                        onChange={(e) => setPasswordEmailOrPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password" className="text-xs font-medium">Password</Label>
                      <button
                        type="button"
                        onClick={() => setActiveTab("otp")}
                        className="text-[11px] text-primary hover:underline"
                      >
                        Forgot? Use OTP
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-60" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-9 pr-9 text-xs"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full gap-2 shadow-xs" disabled={isLoggingIn}>
                    {isLoggingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    Sign In with Password
                  </Button>
                </form>
              </TabsContent>

              {/* TAB 3: Magic Link */}
              <TabsContent value="magic" className="pt-4 space-y-4">
                {!magicSent ? (
                  <form onSubmit={handleSendMagicLink} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="magic-email" className="text-xs font-medium">Registered Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-60" />
                        <Input
                          id="magic-email"
                          type="email"
                          placeholder="name@company.com"
                          className="pl-9 text-xs"
                          value={magicEmail}
                          onChange={(e) => setMagicEmail(e.target.value)}
                          required
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        We will email you a secure link to sign in with a single click.
                      </p>
                    </div>

                    <Button type="submit" className="w-full gap-2 shadow-xs" disabled={isSendingMagic}>
                      {isSendingMagic ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      Send Magic Link
                    </Button>
                  </form>
                ) : (
                  <div className="py-4 text-center space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mx-auto">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h4 className="text-sm font-semibold">Check your inbox</h4>
                    <p className="text-xs text-muted-foreground">
                      We sent a magic sign-in link to <strong>{magicEmail}</strong>. Click the link in the email to log in instantly.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setMagicSent(false)}
                    >
                      Resend link
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardHeader>

          <CardFooter className="pt-0 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-center text-center p-4">
            Need access? Contact your advisory team to activate your client credentials.
          </CardFooter>
        </Card>
      </div>

      {/* Branded Footer (Phase F-121) */}
      <footer className="w-full max-w-2xl mx-auto mt-8 pt-4 border-t border-border/60 text-center text-xs text-muted-foreground space-y-1.5">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
          {contact?.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-primary" /> {contact.phone}
            </span>
          )}
          {contact?.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3 text-primary" /> {contact.email}
            </span>
          )}
          {contact?.address && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-primary" /> {contact.address}
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground/80">
          Powered by Proactive Office OS • Secure 256-Bit SSL Client Encryption
        </p>
      </footer>
    </div>
  );
}
