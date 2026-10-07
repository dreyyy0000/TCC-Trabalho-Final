import { createFileRoute } from "@tanstack/react-router";
import { StoreLayout } from "@/components/store/StoreLayout";
import { CatalogView } from "@/components/store/CatalogView";

export const Route = createFileRoute("/ofertas")({
  head: () => ({
    meta: [
      { title: "Ofertas | NYX." },
      { name: "description", content: "Peças streetwear com desconto por tempo limitado na NYX." },
      { property: "og:title", content: "Ofertas | NYX." },
      { property: "og:description", content: "Descontos reais em camisetas, moletons e tênis." },
    ],
  }),
  component: () => (
    <StoreLayout>
      <CatalogView title="Ofertas" description="Descontos por tempo limitado." base={{ onlySale: true }} />
    </StoreLayout>
  ),
});
