import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { CartLine } from "@/lib/types";

const STORAGE_KEY = "street-cart-v1";

type CartValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  addLine: (line: CartLine) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeLine: (key: string) => void;
  clear: () => void;
};

export const lineKey = (line: CartLine) => `${line.productId}:${line.variantId ?? "-"}`;

const CartContext = createContext<CartValue>({
  lines: [],
  count: 0,
  subtotal: 0,
  addLine: () => {},
  setQuantity: () => {},
  removeLine: () => {},
  clear: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  // Sync with the database for signed-in users.
  useEffect(() => {
    if (!hydrated || !user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("carts").select("items").eq("user_id", user.id).maybeSingle();
      if (cancelled) return;
      const remote = (data?.items as CartLine[] | undefined) ?? [];
      const merged = [...remote];
      for (const local of lines) {
        const existing = merged.find((item) => lineKey(item) === lineKey(local));
        if (existing) existing.quantity = Math.max(existing.quantity, local.quantity);
        else merged.push(local);
      }
      setLines(merged);
      await supabase.from("carts").upsert({ user_id: user.id, items: merged }, { onConflict: "user_id" });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, hydrated]);

  useEffect(() => {
    if (!hydrated || !user) return;
    const timeout = setTimeout(() => {
      void supabase.from("carts").upsert({ user_id: user.id, items: lines }, { onConflict: "user_id" });
    }, 600);
    return () => clearTimeout(timeout);
  }, [lines, user, hydrated]);

  const addLine = useCallback((line: CartLine) => {
    setLines((current) => {
      const next = [...current];
      const existing = next.find((item) => lineKey(item) === lineKey(line));
      if (existing) existing.quantity = Math.min(existing.quantity + line.quantity, line.maxStock || 99);
      else next.push(line);
      return next;
    });
    toast.success("Produto adicionado ao carrinho");
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((current) =>
      current.map((item) =>
        lineKey(item) === key ? { ...item, quantity: Math.max(1, Math.min(quantity, item.maxStock || 99)) } : item,
      ),
    );
  }, []);

  const removeLine = useCallback((key: string) => {
    setLines((current) => current.filter((item) => lineKey(item) !== key));
    toast("Produto removido do carrinho");
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartValue>(
    () => ({
      lines,
      count: lines.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: lines.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
      addLine,
      setQuantity,
      removeLine,
      clear,
    }),
    [lines, addLine, setQuantity, removeLine, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
