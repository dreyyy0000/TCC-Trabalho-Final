import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { brl, discountPercent, finalPrice } from "@/lib/format";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import type { Product } from "@/lib/types";

export function productStock(product: Product) {
  const variants = product.product_variants ?? [];
  if (variants.length) return variants.reduce((sum, v) => sum + v.stock, 0);
  return product.stock;
}

export function ProductCard({ product }: { product: Product }) {
  const { addLine } = useCart();
  const { isFavorite, toggle } = useFavorites();
  const images = [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const price = finalPrice(product.price, product.sale_price);
  const off = discountPercent(product.price, product.sale_price);
  const stock = productStock(product);
  const soldOut = stock <= 0;

  const quickAdd = () => {
    const variant = (product.product_variants ?? []).find((v) => v.stock > 0) ?? null;
    addLine({
      productId: product.id,
      variantId: variant?.id ?? null,
      slug: product.slug,
      name: product.name,
      image: images[0]?.url ?? null,
      size: variant?.size ?? null,
      color: variant?.color ?? product.colors[0] ?? null,
      unitPrice: price,
      quantity: 1,
      maxStock: variant?.stock ?? stock,
    });
  };

  return (
    <article className="group relative flex flex-col">
      <Link to="/produto/$slug" params={{ slug: product.slug }} className="relative block overflow-hidden bg-secondary">
        <div className="aspect-4/5 w-full">
          <img
            src={images[0]?.url ?? "/images/p-tee-black.jpg"}
            alt={images[0]?.alt ?? product.name}
            loading="lazy"
            className={cn(
              "size-full object-cover transition-all duration-700 group-hover:scale-[1.04]",
              images[1] && "group-hover:opacity-0",
            )}
          />
          {images[1] ? (
            <img
              src={images[1].url}
              alt={`${product.name} alternativa`}
              loading="lazy"
              className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          ) : null}
        </div>
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {off > 0 ? (
            <span className="bg-sale px-2 py-1 text-[10px] font-bold tracking-widest text-sale-foreground">-{off}%</span>
          ) : null}
          {soldOut ? (
            <span className="bg-primary px-2 py-1 text-[10px] font-bold tracking-widest text-primary-foreground">
              ESGOTADO
            </span>
          ) : null}
        </div>
      </Link>

      <Button
        variant="secondary"
        size="icon"
        aria-label="Favoritar"
        onClick={() => void toggle(product.id)}
        className="absolute right-3 top-3 size-9 rounded-full opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        <Heart className={cn("size-4", isFavorite(product.id) && "fill-current")} />
      </Button>

      <div className="flex flex-1 flex-col pt-4">
        <p className="eyebrow text-muted-foreground">{product.categories?.name ?? "NYX."}</p>
        <Link to="/produto/$slug" params={{ slug: product.slug }} className="mt-1 text-sm font-semibold hover:underline">
          {product.name}
        </Link>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3 fill-current" /> {Number(product.rating).toFixed(1)}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold">{brl(price)}</span>
          {off > 0 ? <span className="text-xs text-muted-foreground line-through">{brl(product.price)}</span> : null}
        </div>
        <Button onClick={quickAdd} disabled={soldOut} className="mt-4 w-full text-xs tracking-widest">
          {soldOut ? "ESGOTADO" : "ADICIONAR AO CARRINHO"}
        </Button>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-4/5 w-full" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

export function ProductGrid({ products, loading }: { products: Product[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }
  if (!products.length) {
    return (
      <div className="border border-dashed border-border py-20 text-center">
        <p className="font-display text-lg font-bold uppercase">Nenhum produto encontrado.</p>
        <p className="mt-2 text-sm text-muted-foreground">Tente ajustar a busca ou os filtros.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
