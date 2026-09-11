import { createClient } from "@/lib/supabase/server";
import { ErrorCode } from "@/lib/constants/errors";

export interface ProductVariant {
  id: string;
  sku: string;
  colour: string;
  size: string;
  price: number;
  sale_price: number | null;
  stock_qty: number;
  status: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand_id: string;
  brand: {
    name: string;
    slug: string;
  };
  variants: ProductVariant[];
  images: Array<{
    id: string;
    url: string;
    alt_text: string;
    is_primary: boolean;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

interface CatalogError {
  code: ErrorCode;
  message: string;
}

export class CatalogService {
  static async getHome(): Promise<{
    featured_products: Product[];
    categories: Category[];
    brands: Brand[];
  } | CatalogError> {
    try {
      const supabase = await createClient();

      // Get featured products (limit 8, only ACTIVE)
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select(
          `
          id, name, slug, description, brand_id,
          brands (id, name, slug),
          product_variants (id, sku, colour, size, price, sale_price, stock_qty, status),
          product_images (id, url, alt_text, is_primary),
          product_categories (categories (id, name, slug))
        `
        )
        .eq("status", "ACTIVE")
        .limit(8);

      if (productsError) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Failed to fetch products",
        };
      }

      // Get all categories
      const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name, slug, parent_id")
        .order("name");

      if (categoriesError) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Failed to fetch categories",
        };
      }

      // Get all brands
      const { data: brands, error: brandsError } = await supabase
        .from("brands")
        .select("id, name, slug")
        .order("name");

      if (brandsError) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Failed to fetch brands",
        };
      }

      return {
        featured_products: this.formatProducts(products),
        categories: categories || [],
        brands: brands || [],
      };
    } catch {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Failed to fetch home data",
      };
    }
  }

  static async searchProducts(
    query: string,
    brand_id?: string,
    min_price?: number,
    max_price?: number,
    category_id?: string,
    sort_by: string = "newest",
    page: number = 1,
    limit: number = 20,
    in_stock?: boolean
  ): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
  } | CatalogError> {
    try {
      const supabase = await createClient();
      const offset = (page - 1) * limit;

      let queryBuilder = supabase
        .from("products")
        .select(
          `
          id, name, slug, description, brand_id,
          brands (id, name, slug),
          product_variants (id, sku, colour, size, price, sale_price, stock_qty, status),
          product_images (id, url, alt_text, is_primary),
          product_categories (categories (id, name, slug))
        `,
          { count: "exact" }
        )
        .eq("status", "ACTIVE");

      if (query) {
        queryBuilder = queryBuilder.ilike("name", `%${query}%`);
      }

      if (brand_id) {
        queryBuilder = queryBuilder.eq("brand_id", brand_id);
      }

      if (sort_by === "price_asc") {
        queryBuilder = queryBuilder.order("id");
      } else if (sort_by === "price_desc") {
        queryBuilder = queryBuilder.order("id", { ascending: false });
      } else {
        queryBuilder = queryBuilder.order("created_at", { ascending: false });
      }

      queryBuilder = queryBuilder.range(offset, offset + limit - 1);

      const { data: products, error, count } = await queryBuilder;

      if (error) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Failed to search products",
        };
      }

      let filtered = products || [];

      if (min_price !== undefined || max_price !== undefined) {
        filtered = filtered.filter((product) => {
          const prices = product.product_variants
            .filter((v) => v.status === "ACTIVE")
            .map((v) => (v.sale_price !== null ? v.sale_price : v.price));
          if (!prices.length) return false;
          const minVariantPrice = Math.min(...prices);
          if (min_price !== undefined && minVariantPrice < min_price) return false;
          if (max_price !== undefined && minVariantPrice > max_price) return false;
          return true;
        });
      }

      if (in_stock) {
        filtered = filtered.filter((product) =>
          product.product_variants.some((v) => v.status === "ACTIVE" && v.stock_qty > 0)
        );
      }

      return {
        products: this.formatProducts(filtered),
        total: filtered.length,
        page,
        limit,
      };
    } catch {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Failed to search products",
      };
    }
  }

  static async getProductBySlug(slug: string): Promise<Product | CatalogError> {
    try {
      const supabase = await createClient();

      const { data: product, error } = await supabase
        .from("products")
        .select(
          `
          id, name, slug, description, brand_id,
          brands (id, name, slug),
          product_variants (id, sku, colour, size, price, sale_price, stock_qty, status),
          product_images (id, url, alt_text, is_primary),
          product_categories (categories (id, name, slug))
        `
        )
        .eq("slug", slug)
        .eq("status", "ACTIVE")
        .single();

      if (error || !product) {
        return {
          code: ErrorCode.PRODUCT_NOT_FOUND,
          message: "Product not found",
        };
      }

      return this.formatProduct(product);
    } catch {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Failed to fetch product",
      };
    }
  }

  static async getCategories(): Promise<Category[] | CatalogError> {
    try {
      const supabase = await createClient();

      const { data: categories, error } = await supabase
        .from("categories")
        .select("id, name, slug, parent_id")
        .order("name");

      if (error) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Failed to fetch categories",
        };
      }

      return categories || [];
    } catch {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Failed to fetch categories",
      };
    }
  }

  static async getBrands(): Promise<Brand[] | CatalogError> {
    try {
      const supabase = await createClient();

      const { data: brands, error } = await supabase
        .from("brands")
        .select("id, name, slug")
        .order("name");

      if (error) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Failed to fetch brands",
        };
      }

      return brands || [];
    } catch {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Failed to fetch brands",
      };
    }
  }

  private static formatProduct(data: {
    id: string;
    name: string;
    slug: string;
    description: string;
    brand_id: string;
    brands: { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[];
    product_variants: ProductVariant[];
    product_images: Array<{
      id: string;
      url: string;
      alt_text: string;
      is_primary: boolean;
    }>;
    product_categories: Array<{
      categories: { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[];
    }>;
  }): Product {
    const brand = Array.isArray(data.brands) ? data.brands[0] : data.brands;
    const categories = data.product_categories?.map((pc) => {
      const cat = Array.isArray(pc.categories) ? pc.categories[0] : pc.categories;
      return cat;
    }) || [];
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      brand_id: data.brand_id,
      brand,
      variants: data.product_variants || [],
      images: data.product_images || [],
      categories,
    };
  }

  private static formatProducts(
    data: Array<{
      id: string;
      name: string;
      slug: string;
      description: string;
      brand_id: string;
      brands: { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[];
      product_variants: ProductVariant[];
      product_images: Array<{
        id: string;
        url: string;
        alt_text: string;
        is_primary: boolean;
      }>;
      product_categories: Array<{
        categories: { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[];
      }>;
    }>
  ): Product[] {
    return data.map((p) => this.formatProduct(p));
  }
}
