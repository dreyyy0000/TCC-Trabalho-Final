import { createServerFn } from "@tanstack/react-start";
import type { Category, Product } from "./types";

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const { publicSupabase, PRODUCT_SELECT } = await import("./catalog.server");
  const db = publicSupabase();
  const [categories, offers, bestsellers, latest, banners] = await Promise.all([
    db.from("categories").select("*").eq("is_active", true).order("sort_order"),
    db.from("products").select(PRODUCT_SELECT).eq("is_active", true).not("sale_price", "is", null).limit(8),
    db.from("products").select(PRODUCT_SELECT).eq("is_active", true).eq("is_bestseller", true).limit(8),
    db.from("products").select(PRODUCT_SELECT).eq("is_active", true).order("created_at", { ascending: false }).limit(8),
    db.from("banners").select("*").eq("is_active", true).order("sort_order"),
  ]);
  return {
    categories: (categories.data ?? []) as Category[],
    offers: (offers.data ?? []) as unknown as Product[],
    bestsellers: (bestsellers.data ?? []) as unknown as Product[],
    latest: (latest.data ?? []) as unknown as Product[],
    banners: (banners.data ?? []) as { title: string; subtitle: string | null; image_url: string | null; button_label: string | null; link: string | null }[],
  };
});

export type ProductFilters = {
  category?: string | undefined;
  q?: string | undefined;
  min?: number | undefined;
  max?: number | undefined;
  size?: string | undefined;
  color?: string | undefined;
  brand?: string | undefined;
  sort?: string | undefined;
  onlySale?: boolean | undefined;
  inStock?: boolean | undefined;
  page?: number | undefined;
};

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((data: ProductFilters) => data ?? {})
  .handler(async ({ data }) => {
    const { publicSupabase, PRODUCT_SELECT } = await import("./catalog.server");
    const db = publicSupabase();
    const perPage = 12;
    const page = Math.max(1, Number(data.page) || 1);
    let query = db.from("products").select(PRODUCT_SELECT, { count: "exact" }).eq("is_active", true);

    if (data.category) {
      const { data: cat } = await db.from("categories").select("id").eq("slug", data.category).maybeSingle();
      query = query.eq("category_id", cat?.id ?? "00000000-0000-0000-0000-000000000000");
    }
    if (data.q) query = query.or(`name.ilike.%${data.q}%,description.ilike.%${data.q}%,brand.ilike.%${data.q}%`);
    if (data.min) query = query.gte("price", data.min);
    if (data.max) query = query.lte("price", data.max);
    if (data.brand) query = query.eq("brand", data.brand);
    if (data.size) query = query.contains("sizes", [data.size]);
    if (data.color) query = query.contains("colors", [data.color]);
    if (data.onlySale) query = query.not("sale_price", "is", null);
    if (data.inStock) query = query.gt("stock", 0);

    switch (data.sort) {
      case "price_asc": query = query.order("price", { ascending: true }); break;
      case "price_desc": query = query.order("price", { ascending: false }); break;
      case "bestseller": query = query.order("sold_count", { ascending: false }); break;
      default: query = query.order("created_at", { ascending: false });
    }

    const { data: rows, count } = await query.range((page - 1) * perPage, page * perPage - 1);
    return { products: (rows ?? []) as unknown as Product[], total: count ?? 0, page, perPage };
  });

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const { publicSupabase, PRODUCT_SELECT } = await import("./catalog.server");
    const db = publicSupabase();
    const { data: product } = await db
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", data.slug)
      .eq("is_active", true)
      .maybeSingle();
    if (!product) return { product: null, related: [] as Product[] };
    const { data: related } = await db
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .eq("category_id", (product as { category_id: string | null }).category_id ?? "")
      .neq("id", (product as { id: string }).id)
      .limit(4);
    return { product: product as unknown as Product, related: (related ?? []) as unknown as Product[] };
  });

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { publicSupabase } = await import("./catalog.server");
  const db = publicSupabase();
  const { data } = await db.from("categories").select("*").eq("is_active", true).order("sort_order");
  return (data ?? []) as Category[];
});
