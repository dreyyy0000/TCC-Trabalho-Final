import { createFileRoute } from "@tanstack/react-router";
import { StoreLayout } from "@/components/store/StoreLayout";
import { CatalogView } from "@/components/store/CatalogView";

export const Route = createFileRoute("/novidades")({
  head: () => ({
    meta: [
      { title: "Novidades | NYX." },
      { name: "description", content: "Os lançamentos mais recentes da coleção NYX." },
      { property: "og:title", content: "Novidades | NYX." },
      { property: "og:description", content: "Confira os drops mais recentes." },
    ],
  }),
  component: () => (
    <StoreLayout>
      <CatalogView title="Novidades" description="Últimos lançamentos da coleção." base={{ sort: "recent" }} />
    </StoreLayout>
  ),
});
