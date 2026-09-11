"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: string;
  status: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/v1/me");
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to load profile");
          setLoading(false);
          return;
        }

        setProfile(data);
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone || "",
        });
        setLoading(false);
      } catch {
        setError("Failed to load profile");
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/v1/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Update failed");
        return;
      }

      setProfile(data);
      setEditing(false);
      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold tracking-tight">Account Profile</h1>
          <p className="text-muted-foreground">Manage your personal information</p>
        </div>

        {error && (
          <div className="mb-6 flex gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 flex gap-3 rounded-lg border border-green-500/50 bg-green-50 p-4">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Personal Information Card */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                {!editing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                    className="font-semibold"
                  >
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {!editing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        First Name
                      </p>
                      <p className="text-base font-semibold">{profile?.first_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Last Name
                      </p>
                      <p className="text-base font-semibold">{profile?.last_name}</p>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Email Address
                    </p>
                    <p className="text-base font-semibold text-accent">{profile?.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your primary contact email
                    </p>
                  </div>

                  <div className="border-t pt-6">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Phone Number
                    </p>
                    <p className="text-base font-semibold">
                      {profile?.phone || "Not provided"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Used for delivery and order updates
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="first_name" className="text-sm font-semibold">
                        First Name
                      </label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="last_name" className="text-sm font-semibold">
                        Last Name
                      </label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6 space-y-2">
                    <label className="text-sm font-semibold">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={profile?.email}
                      disabled
                      className="h-10 bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>

                  <div className="border-t pt-6 space-y-2">
                    <label htmlFor="phone" className="text-sm font-semibold">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0412345678"
                      className="h-10"
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional. Used for delivery and order updates.
                    </p>
                  </div>

                  <div className="border-t pt-6 flex gap-3">
                    <Button
                      type="submit"
                      className="bg-accent hover:bg-accent/90 text-white font-semibold"
                    >
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          first_name: profile?.first_name || "",
                          last_name: profile?.last_name || "",
                          phone: profile?.phone || "",
                        });
                      }}
                      className="font-semibold"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Account Status Card */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                    {profile?.status === "ACTIVE" ? "Active" : profile?.status}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-sm font-medium text-muted-foreground">Account Type</span>
                  <span className="text-sm font-semibold capitalize">{profile?.role.toLowerCase()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
