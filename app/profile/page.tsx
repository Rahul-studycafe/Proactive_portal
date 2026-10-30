"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  KeyRound,
  Lock,
  Mail,
  Phone,
  Save,
  Shield,
  User,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import {
  useGetPortalProfileQuery,
  useUpdatePortalProfileMutation,
  useChangePortalPasswordMutation
} from "@/lib/services/api";

export default function PortalProfilePage() {
  const { data: profileData, isLoading, refetch } = useGetPortalProfileQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdatePortalProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePortalPasswordMutation();

  const user = profileData?.user;
  const client = profileData?.client;

  // Profile Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      toast.error("Please fill in all profile fields");
      return;
    }

    try {
      await updateProfile({ name, email, phone }).unwrap();
      toast.success("Profile updated successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.data?.message || "Failed to update profile");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please provide both current and new password");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.data?.message || "Failed to change password");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Account Profile & Security" },
        ]}
      />

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Account Profile & Security</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your personal contact details, security credentials, and view registered business data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Representative Contact Details */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Representative Profile
            </CardTitle>
            <CardDescription className="text-xs">
              Your contact info used for filing notifications and OTP sign-in.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdateProfile}>
            <CardContent className="p-5 pt-0 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="rep-name" className="text-xs">Full Name</Label>
                <Input
                  id="rep-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rep-email" className="text-xs">Email Address</Label>
                <Input
                  id="rep-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rep-phone" className="text-xs">Mobile Number</Label>
                <Input
                  id="rep-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="p-5 pt-0">
              <Button type="submit" size="sm" className="gap-2 shadow-xs" disabled={isUpdatingProfile}>
                {isUpdatingProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Card 2: Security & Change Password */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" /> Security & Password
            </CardTitle>
            <CardDescription className="text-xs">
              Update your password used for signing in to the client portal.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleChangePassword}>
            <CardContent className="p-5 pt-0 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="current-pw" className="text-xs">Current Password</Label>
                <Input
                  id="current-pw"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-pw" className="text-xs">New Password (Min. 6 chars)</Label>
                <Input
                  id="new-pw"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-pw" className="text-xs">Confirm New Password</Label>
                <Input
                  id="confirm-pw"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="p-5 pt-0">
              <Button type="submit" size="sm" variant="outline" className="gap-2 shadow-xs" disabled={isChangingPassword}>
                {isChangingPassword ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                Update Password
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Card 3: Business Legal Profile (Read-Only Certified Info) */}
      {client && (
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Certified Legal Profile
            </CardTitle>
            <CardDescription className="text-xs">
              Master organization details maintained by your Chartered Accountant practice.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-muted/40 rounded-lg">
                <p className="text-muted-foreground font-medium">Business Name</p>
                <p className="font-semibold text-foreground mt-0.5">{client.name}</p>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg">
                <p className="text-muted-foreground font-medium">Permanent Account Number (PAN)</p>
                <p className="font-mono font-bold text-foreground mt-0.5">{client.pan || "N/A"}</p>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg">
                <p className="text-muted-foreground font-medium">Goods & Services Tax (GSTIN)</p>
                <p className="font-mono font-bold text-foreground mt-0.5">{client.gstin || "N/A"}</p>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg">
                <p className="text-muted-foreground font-medium">Legal Constitution</p>
                <p className="font-semibold text-foreground mt-0.5">{client.entityType || "N/A"}</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-muted/20 border border-border/60 rounded-lg text-xs text-muted-foreground">
              To update certified statutory details like company PAN, legal entity constitution, or GST registration numbers, please contact your accounting team.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
