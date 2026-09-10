"use client";

import { useCallback, useEffect, useState } from "react";
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

  const fetchAddresses = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Address Book</h1>
          <p className="text-muted-foreground">Manage your delivery addresses</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Address"}
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Address</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Label</label>
                  <Input
                    name="label"
                    value={formData.label}
                    onChange={handleChange}
                    placeholder="Home"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0412345678"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Street Address</label>
                  <Input
                    name="line1"
                    value={formData.line1}
                    onChange={handleChange}
                    placeholder="123 Main St"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Street Address 2</label>
                <Input
                  name="line2"
                  value={formData.line2}
                  onChange={handleChange}
                  placeholder="Apt 4B (optional)"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Suburb</label>
                  <Input
                    name="suburb"
                    value={formData.suburb}
                    onChange={handleChange}
                    placeholder="Sydney"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">State</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                  <label className="text-sm font-medium">Postcode</label>
                  <Input
                    name="postcode"
                    value={formData.postcode}
                    onChange={handleChange}
                    placeholder="2000"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                  className="rounded"
                />
                <label className="text-sm font-medium">Set as default</label>
              </div>

              <Button type="submit" className="w-full">
                Add Address
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No addresses yet. Add one to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          addresses.map((address) => (
            <Card key={address.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {address.label}
                      {address.is_default && (
                        <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                          Default
                        </span>
                      )}
                    </CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(address.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">{address.full_name}</span>
                </p>
                <p>{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>
                  {address.suburb}, {address.state} {address.postcode}
                </p>
                <p>{address.phone}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
