import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  salePrice?: number | null;
  image?: {
    url: string;
    alt: string;
  };
  isNew?: boolean;
  onSale?: boolean;
}

export function ProductCard({
  slug,
  name,
  brand,
  price,
  salePrice,
  image,
  isNew,
  onSale,
}: ProductCardProps) {
  const displayPrice = salePrice && salePrice < price ? salePrice : price;
  const discount = salePrice && salePrice < price ? Math.round(((price - salePrice) / price) * 100) : 0;

  return (
    <Link href={`/products/${slug}`}>
      <Card className="group h-full overflow-hidden transition-all hover:shadow-md">
        {/* Image Container */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {isNew && (
              <Badge className="bg-accent text-accent-foreground">New</Badge>
            )}
            {onSale && discount > 0 && (
              <Badge variant="destructive">-{discount}%</Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute bottom-3 right-3 bg-white/80 hover:bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
            {brand}
          </p>
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-accent transition-colors mb-3">
            {name}
          </h3>

          {/* Pricing */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-base">
              ${displayPrice.toFixed(2)}
            </span>
            {salePrice && salePrice < price && (
              <span className="text-xs text-muted-foreground line-through">
                ${price.toFixed(2)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
