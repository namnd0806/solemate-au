"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Search,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";

interface Promotion {
  id: string;
  code: string;
  type: string;
  value: number;
  min_spend: number;
  start_date: string;
  end_date: string;
  usage_limit: number | null;
  usage_count: number;
  is_enabled: boolean;
  created_at: string;
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await fetch("/api/v1/admin/promotions?page=1&limit=100");
        if (res.ok) {
          const data = await res.json();
          setPromotions(data.promotions || []);
        } else {
          setError("Failed to fetch promotions");
        }
      } catch (err) {
        setError("Error fetching promotions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  const filteredPromotions = promotions.filter(
    (p) =>
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (promotionId: string) => {
    if (!window.confirm("Are you sure you want to delete this promotion?")) {
      return;
    }

    setDeleting(promotionId);
    try {
      const res = await fetch(`/api/v1/admin/promotions/${promotionId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPromotions(promotions.filter((p) => p.id !== promotionId));
      } else {
        setError("Failed to delete promotion");
      }
    } catch (err) {
      setError("Error deleting promotion");
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const toggleEnabled = async (
    promotionId: string,
    currentState: boolean
  ) => {
    try {
      const res = await fetch(`/api/v1/admin/promotions/${promotionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_enabled: !currentState }),
      });

      if (res.ok) {
        setPromotions(
          promotions.map((p) =>
            p.id === promotionId ? { ...p, is_enabled: !currentState } : p
          )
        );
      }
    } catch (err) {
      setError("Error updating promotion");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4" />
              <p className="text-gray-600">Loading promotions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Promotions
            </h1>
            <p className="text-gray-600">Manage promotional codes and discounts</p>
          </div>
          <Button
            asChild
            className="bg-accent hover:bg-accent/90 text-white font-semibold h-10"
          >
            <Link href="/admin/promotions/new">
              <Plus className="h-4 w-4 mr-2" />
              New Promotion
            </Link>
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by code or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-1">Total Promotions</p>
              <p className="text-2xl font-bold text-gray-900">
                {promotions.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-1">Active Now</p>
              <p className="text-2xl font-bold text-green-600">
                {promotions.filter((p) => p.is_enabled).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-1">Disabled</p>
              <p className="text-2xl font-bold text-gray-500">
                {promotions.filter((p) => !p.is_enabled).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Promotions Table */}
        {filteredPromotions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-600 text-center mb-4">
                {searchTerm
                  ? "No promotions match your search"
                  : "No promotions yet"}
              </p>
              {!searchTerm && (
                <Button
                  asChild
                  className="bg-accent hover:bg-accent/90 text-white"
                >
                  <Link href="/admin/promotions/new">Create First Promotion</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Code
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Value
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Min Spend
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Valid Period
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Usage
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPromotions.map((promo) => (
                      <tr
                        key={promo.id}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="font-mono font-semibold text-accent">
                            {promo.code}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={
                              promo.type === "PERCENTAGE"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-green-50 text-green-700 border-green-200"
                            }
                          >
                            {promo.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {promo.type === "PERCENTAGE"
                            ? `${promo.value}%`
                            : `$${promo.value.toFixed(2)}`}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          ${promo.min_spend.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(promo.start_date).toLocaleDateString(
                            "en-AU"
                          )}{" "}
                          -{" "}
                          {new Date(promo.end_date).toLocaleDateString("en-AU")}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {promo.usage_limit ? (
                            <span>
                              {promo.usage_count} / {promo.usage_limit}
                            </span>
                          ) : (
                            <span>{promo.usage_count} (Unlimited)</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() =>
                              toggleEnabled(promo.id, promo.is_enabled)
                            }
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                              promo.is_enabled
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {promo.is_enabled ? "Enabled" : "Disabled"}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              asChild
                              size="sm"
                              variant="ghost"
                              className="text-accent hover:bg-accent/10"
                            >
                              <Link href={`/admin/promotions/${promo.id}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(promo.id)}
                              disabled={deleting === promo.id}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
