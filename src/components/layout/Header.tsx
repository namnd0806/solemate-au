"use client";

import Link from "next/link";
import { ShoppingCart, Heart, User, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock data for PHASE 1
  const cartCount = 2;
  const isLoggedIn = false;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold">SoleMate</div>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Australia
            </span>
          </Link>

          {/* Search bar - Desktop */}
          <div className="hidden flex-1 max-w-xl md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for shoes..."
                className="w-full pl-10"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search - Mobile */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-[10px]">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User */}
            {isLoggedIn ? (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/account/profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/login">Sign In</Link>
              </Button>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden border-t py-3 md:block">
          <ul className="flex items-center gap-6 text-sm">
            <li>
              <Link href="/products" className="hover:underline">
                All Shoes
              </Link>
            </li>
            <li>
              <Link href="/brands/nike" className="hover:underline">
                Nike
              </Link>
            </li>
            <li>
              <Link href="/brands/adidas" className="hover:underline">
                Adidas
              </Link>
            </li>
            <li>
              <Link href="/brands/new-balance" className="hover:underline">
                New Balance
              </Link>
            </li>
            <li>
              <Link href="/brands/asics" className="hover:underline">
                ASICS
              </Link>
            </li>
            <li>
              <Link href="/brands/converse" className="hover:underline">
                Converse
              </Link>
            </li>
          </ul>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="border-t py-4 md:hidden">
            <ul className="flex flex-col gap-4 text-sm">
              <li>
                <Link href="/products" className="block hover:underline">
                  All Shoes
                </Link>
              </li>
              <li>
                <Link href="/brands/nike" className="block hover:underline">
                  Nike
                </Link>
              </li>
              <li>
                <Link href="/brands/adidas" className="block hover:underline">
                  Adidas
                </Link>
              </li>
              <li>
                <Link href="/brands/new-balance" className="block hover:underline">
                  New Balance
                </Link>
              </li>
              <li>
                <Link href="/brands/asics" className="block hover:underline">
                  ASICS
                </Link>
              </li>
              <li>
                <Link href="/brands/converse" className="block hover:underline">
                  Converse
                </Link>
              </li>
              {!isLoggedIn && (
                <li className="pt-2 border-t">
                  <Link href="/login" className="block hover:underline">
                    Sign In
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
