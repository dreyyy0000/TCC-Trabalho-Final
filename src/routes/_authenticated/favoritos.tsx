import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { StoreLayout } from "@/components/store/StoreLayout";
import { ProductGrid } from "@/components/store/ProductCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useFavorites } from "@/hooks/useFavorites";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/favoritos")({
  head: () => ({
    meta: [
      { title: "Favoritos | NYX." },
      { name: "description", content: "As peças que você salvou para depois na NYX." },
      { property: "og:title", content: "Favoritos | NYX." },
      { property: "og:description", content: "Suas peças salvas na NYX." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { favoriteIds: ids } = useFavorites();

  const { data: products } = useQuery({
    queryKey: ["favorite-products", ids],
    queryFn: async () => {
      if (!ids.length) return [];
      const { data } = await supabase
        .from("products")
        .select("*, categories(name,slug), product_images(id,url,alt,sort_order)")
        .in("id", ids)
        .eq("is_active", true);
      return (data ?? []) as unknown as Product[];
    },
  });

  return (
    <StoreLayout>
      <div className="container-street py-10 md:py-16">
        <h1 className="heading-xl text-3xl md:text-5xl">Favoritos</h1>
        {products && products.length ? (
          <div className="mt-10">
            <ProductGrid products={products} />
          </div>
        ) : (
          <div className="mt-10 border border-dashed border-border py-24 text-center">
            <p className="font-display text-lg font-bold uppercase">Nenhum favorito ainda</p>
            <Button asChild className="mt-6 tracking-widest">
              <Link to="/produtos">EXPLORAR CATÁLOGO</Link>
            </Button>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
