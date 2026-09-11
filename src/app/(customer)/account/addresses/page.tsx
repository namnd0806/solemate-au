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

interface Address {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  suburb: string;
  state: string;
  postcode: string;
  is_default: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    label: "",
    full_name: "",
    phone: "",
    line1: "",
    line2: "",
    suburb: "",
    state: "NSW",
    postcode: "",
    is_default: false,
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch("/api/v1/addresses");
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to load addresses");
          setLoading(false);
          return;
        }

        setAddresses(data.addresses || []);
        setLoading(false);
      } catch {
        setError("Failed to load addresses");
        setLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? !formData.is_default : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/v1/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to add address");
        return;
      }

      setAddresses([...addresses, data]);
      setFormData({
        label: "",
        full_name: "",
        phone: "",
        line1: "",
        line2: "",
        suburb: "",
        state: "NSW",
        postcode: "",
        is_default: false,
      });
      setShowForm(false);
    } catch {
      setError("Failed to add address");
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("Delete this address?")) return;

    try {
      const res = await fetch(`/api/v1/addresses/${addressId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        setError("Failed to delete address");
        return;
      }

      setAddresses(addresses.filter((a) => a.id !== addressId));
    } catch {
      setError("Failed to delete address");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">Loading addresses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold tracking-tight">Address Book</h1>
            <p className="text-muted-foreground">Manage your delivery addresses</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className={`font-semibold h-10 ${showForm ? "variant-outline" : "bg-accent hover:bg-accent/90 text-white"}`}
          >
            {showForm ? "Cancel" : "+ Add Address"}
          </Button>
        </div>

        {error && (
          <div className="mb-6 flex gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <div className="flex-1">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          </div>
        )}

        {showForm && (
          <Card className="mb-8 ring-1 ring-accent/20">
            <CardHeader className="border-b">
              <CardTitle>Add New Address</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="label" className="text-sm font-semibold">
                      Label
                    </label>
                    <Input
                      id="label"
                      name="label"
                      value={formData.label}
                      onChange={handleChange}
                      placeholder="e.g., Home"
                      required
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="full_name" className="text-sm font-semibold">
                      Full Name
                    </label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-semibold">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0412345678"
                      required
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="line1" className="text-sm font-semibold">
                      Street Address
                    </label>
                    <Input
                      id="line1"
                      name="line1"
                      value={formData.line1}
                      onChange={handleChange}
                      placeholder="123 Main St"
                      required
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="line2" className="text-sm font-semibold">
                    Street Address Line 2 (Optional)
                  </label>
                  <Input
                    id="line2"
                    name="line2"
                    value={formData.line2}
                    onChange={handleChange}
                    placeholder="Apt 4B, Suite 200, etc."
                    className="h-10"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="suburb" className="text-sm font-semibold">
                      Suburb
                    </label>
                    <Input
                      id="suburb"
                      name="suburb"
                      value={formData.suburb}
                      onChange={handleChange}
                      placeholder="Sydney"
                      required
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="state" className="text-sm font-semibold">
                      State
                    </label>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="h-10 rounded-md border px-3 py-2 bg-white text-sm font-medium"
                    >
                      <option value="NSW">NSW</option>
                      <option value="VIC">VIC</option>
                      <option value="QLD">QLD</option>
                      <option value="WA">WA</option>
                      <option value="SA">SA</option>
                      <option value="TAS">TAS</option>
                      <option value="ACT">ACT</option>
                      <option value="NT">NT</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="postcode" className="text-sm font-semibold">
                      Postcode
                    </label>
                    <Input
                      id="postcode"
                      name="postcode"
                      value={formData.postcode}
                      onChange={handleChange}
                      placeholder="2000"
                      required
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-accent/5 rounded-lg p-3 border border-accent/20">
                  <input
                    type="checkbox"
                    id="is_default"
                    name="is_default"
                    checked={formData.is_default}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <label htmlFor="is_default" className="text-sm font-medium cursor-pointer">
                    Set as default address for deliveries
                  </label>
                </div>

                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white font-semibold h-10" size="lg">
                  Add Address
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {addresses.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-center">
                  No addresses yet. Add your first delivery address to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            addresses.map((address) => (
              <Card key={address.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        {address.label}
                        {address.is_default && (
                          <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent border border-accent/20">
                            Default
                          </span>
                        )}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
                      className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 font-semibold"
                    >
                      Delete
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="border-t pt-4 space-y-2 text-sm">
                  <div>
                    <p className="font-semibold text-foreground">{address.full_name}</p>
                    <p className="text-muted-foreground">{address.phone}</p>
                  </div>
                  <div className="text-muted-foreground">
                    <p>{address.line1}</p>
                    {address.line2 && <p>{address.line2}</p>}
                    <p>
                      {address.suburb} {address.state} {address.postcode}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
