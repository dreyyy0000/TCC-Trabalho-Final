import { createClient } from "@supabase/supabase-js";

export function publicSupabase() {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const PRODUCT_SELECT =
  "id,name,slug,description,category_id,brand,price,sale_price,sku,stock,sizes,colors,rating,sold_count,is_featured,is_bestseller,is_active,created_at,categories(name,slug),product_images(id,url,alt,sort_order),product_variants(id,size,color,sku,stock)";
