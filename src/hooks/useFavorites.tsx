import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: ids = [] } = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase.from("favorites").select("product_id").eq("user_id", user!.id);
      if (error) throw error;
      return data.map((row: { product_id: string }) => row.product_id);
    },
  });

  const toggle = async (productId: string) => {
    if (!user) {
      toast.error("Entre na sua conta para favoritar produtos");
      return;
    }
    if (ids.includes(productId)) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", productId);
      toast("Removido dos favoritos");
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, product_id: productId });
      toast.success("Adicionado aos favoritos");
    }
    void queryClient.invalidateQueries({ queryKey: ["favorites"] });
  };

  return { favoriteIds: ids, isFavorite: (id: string) => ids.includes(id), toggle };
}
