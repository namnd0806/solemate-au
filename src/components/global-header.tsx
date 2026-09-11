"use client";

import Link from "next/link";
import { Search, Heart, LogIn, ShoppingCart, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function GlobalHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      {/* Announcement Bar */}
      <div className="bg-accent text-accent-foreground py-2 text-center text-sm font-medium">
        Free shipping on orders over $150 within Australia
      </div>

      {/* Main Header */}
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-8">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold tracking-tight">SOLE MATE</span>
              <span className="text-xs text-muted-foreground ml-1">AU</span>
            </Link>

            {/* Search - Center */}
            <form onSubmit={handleSearch} className="hidden flex-1 max-w-md lg:block">
              <div className="relative">
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/wishlist" title="Wishlist">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Wishlist</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/account" title="Account">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Account</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/cart" title="Cart">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="sr-only">Cart</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 overflow-x-auto">
            <Link
              href="/products?category=mens"
              className="py-3 px-1 border-b-2 border-transparent hover:border-accent text-sm font-medium transition-colors whitespace-nowrap"
            >
              Men
            </Link>
            <Link
              href="/products?category=womens"
              className="py-3 px-1 border-b-2 border-transparent hover:border-accent text-sm font-medium transition-colors whitespace-nowrap"
            >
              Women
            </Link>
            <Link
              href="/products?category=kids"
              className="py-3 px-1 border-b-2 border-transparent hover:border-accent text-sm font-medium transition-colors whitespace-nowrap"
            >
              Kids
            </Link>
            <Link
              href="/products"
              className="py-3 px-1 border-b-2 border-transparent hover:border-accent text-sm font-medium transition-colors whitespace-nowrap"
            >
              Brands
            </Link>
            <Link
              href="/products?sort=newest"
              className="py-3 px-1 border-b-2 border-transparent hover:border-accent text-sm font-medium transition-colors whitespace-nowrap"
            >
              New
            </Link>
            <Link
              href="/products?on_sale=true"
              className="py-3 px-1 border-b-2 border-transparent hover:border-accent text-sm font-medium transition-colors whitespace-nowrap"
            >
              Sale
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Search */}
      <form onSubmit={handleSearch} className="border-b lg:hidden px-4 py-3">
        <div className="relative">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>
    </header>
  );
}
