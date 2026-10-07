import { createFileRoute } from "@tanstack/react-router";
import { StoreLayout } from "@/components/store/StoreLayout";
import { CatalogView } from "@/components/store/CatalogView";

type Search = { q?: string | undefined };

export const Route = createFileRoute("/produtos")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: typeof search['q'] === "string" && search['q'] ? search['q'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Todos os produtos | NYX." },
      { name: "description", content: "Explore camisetas, moletons, calças, tênis e acessórios streetwear da NYX." },
      { property: "og:title", content: "Todos os produtos | NYX." },
      { property: "og:description", content: "Busque e filtre por categoria, tamanho, cor e preço." },
    ],
  }),
  component: ProdutosPage,
});

function ProdutosPage() {
  const { q } = Route.useSearch();
  return (
    <StoreLayout>
      <CatalogView title="Shop" description="Todas as peças da coleção atual." initialQuery={q ?? ""} />
    </StoreLayout>
  );
}
