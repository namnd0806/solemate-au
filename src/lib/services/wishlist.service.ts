import { createClient } from "@/lib/supabase/server";
import { ErrorCode } from "@/lib/constants/errors";

export interface WishlistItem {
  id: string;
  variant_id: string;
  product_name: string;
  variant_sku: string;
  colour: string;
  size: string;
  price: number;
  sale_price: number | null;
  stock_qty: number;
  image_url: string | null;
}

export interface Wishlist {
  id: string;
  user_id: string;
  items: WishlistItem[];
}

interface WishlistError {
  code: ErrorCode;
  message: string;
}

export class WishlistService {
  static async getWishlist(userId: string): Promise<Wishlist | WishlistError> {
    try {
      const supabase = await createClient();

      const { data: wishlist, error: wishlistError } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (wishlistError || !wishlist) {
        const { data: newWishlist, error: createError } = await supabase
          .from("wishlists")
          .insert({ user_id: userId })
          .select("id")
          .single();

        if (createError || !newWishlist) {
          return {
            code: ErrorCode.INTERNAL_ERROR,
            message: "Failed to create wishlist",
          };
        }

        const createdWishlist = newWishlist;
        const { data: wishlistItems, error: itemsError } = await supabase
          .from("wishlist_items")
          .select(
            `
            id, variant_id,
            product_variants (
              sku, colour, size, price, sale_price, stock_qty, status,
              products (name),
              product_images (url, is_primary)
            )
          `
          )
          .eq("wishlist_id", createdWishlist.id);

        if (itemsError) {
          return {
            code: ErrorCode.INTERNAL_ERROR,
            message: "Failed to fetch wishlist items",
          };
        }

        interface WishlistItemRow {
          id: string;
          variant_id: string;
          product_variants: {
            sku: string;
            colour: string;
            size: string;
            price: number;
            sale_price: number | null;
            stock_qty: number;
            status: string;
            products: { name: string } | null;
            product_images: Array<{ url: string; is_primary: boolean }> | null;
          } | null;
        }

        const items: WishlistItem[] = ((wishlistItems || []) as unknown as WishlistItemRow[])
          .filter((item) => item.product_variants)
          .map((item) => {
            const variant = item.product_variants!;
            const primaryImage =
              variant.product_images?.find((img) => img.is_primary) ||
              variant.product_images?.[0];

            return {
              id: item.id,
              variant_id: item.variant_id,
              product_name: variant.products?.name || "Unknown",
              variant_sku: variant.sku,
              colour: variant.colour,
              size: variant.size,
              price: variant.price,
              sale_price: variant.sale_price,
              stock_qty: variant.stock_qty,
              image_url: primaryImage?.url || null,
            };
          });

        return {
          id: createdWishlist.id,
          user_id: userId,
          items,
        };
      }

      const { data: wishlistItems, error: itemsError } = await supabase
        .from("wishlist_items")
        .select(
          `
          id, variant_id,
          product_variants (
            sku, colour, size, price, sale_price, stock_qty, status,
            products (name),
            product_images (url, is_primary)
          )
        `
        )
        .eq("wishlist_id", wishlist.id);

      if (itemsError) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Failed to fetch wishlist items",
        };
      }

      interface WishlistItemRow {
        id: string;
        variant_id: string;
        product_variants: {
          sku: string;
          colour: string;
          size: string;
          price: number;
          sale_price: number | null;
          stock_qty: number;
          status: string;
          products: { name: string } | null;
          product_images: Array<{ url: string; is_primary: boolean }> | null;
        } | null;
      }

      const items: WishlistItem[] = ((wishlistItems || []) as unknown as WishlistItemRow[])
        .filter((item) => item.product_variants)
        .map((item) => {
          const variant = item.product_variants!;
          const primaryImage =
            variant.product_images?.find((img) => img.is_primary) ||
            variant.product_images?.[0];

          return {
            id: item.id,
            variant_id: item.variant_id,
            product_name: variant.products?.name || "Unknown",
            variant_sku: variant.sku,
            colour: variant.colour,
            size: variant.size,
            price: variant.price,
            sale_price: variant.sale_price,
            stock_qty: variant.stock_qty,
            image_url: primaryImage?.url || null,
          };
        });

      return {
        id: wishlist.id,
        user_id: userId,
        items,
      };
    } catch {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Failed to fetch wishlist",
      };
    }
  }

  static async addItem(
    userId: string,
    variantId: string
  ): Promise<{ item_id: string } | WishlistError> {
    try {
      const supabase = await createClient();

      const { data: variant, error: variantError } = await supabase
        .from("product_variants")
        .select("id, status")
        .eq("id", variantId)
        .single();

      if (variantError || !variant || variant.status !== "ACTIVE") {
        return {
          code: ErrorCode.PRODUCT_NOT_FOUND,
          message: "Variant not available",
        };
      }

      let { data: wishlist } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!wishlist) {
        const { data: newWishlist, error: createError } = await supabase
          .from("wishlists")
          .insert({ user_id: userId })
          .select("id")
          .single();

        if (createError || !newWishlist) {
          return {
            code: ErrorCode.INTERNAL_ERROR,
            message: "Failed to create wishlist",
          };
        }

        wishlist = newWishlist;
      }

      const { data: existingItem } = await supabase
        .from("wishlist_items")
        .select("id")
        .eq("wishlist_id", wishlist.id)
        .eq("variant_id", variantId)
        .single();

      if (existingItem) {
        return { item_id: existingItem.id };
      }

      const { data: newItem, error: insertError } = await supabase
        .from("wishlist_items")
        .insert({
          wishlist_id: wishlist.id,
          variant_id: variantId,
        })
        .select("id")
        .single();

      if (insertError || !newItem) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Failed to add item to wishlist",
        };
      }

      return { item_id: newItem.id };
    } catch {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Failed to add item to wishlist",
      };
    }
  }

  static async removeItem(itemId: string): Promise<
    { success: boolean } | WishlistError
  > {
    try {
      const supabase = await createClient();

      const { error: deleteError } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("id", itemId);

      if (deleteError) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Failed to remove item from wishlist",
        };
      }

      return { success: true };
    } catch {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Failed to remove item from wishlist",
      };
    }
  }
}
