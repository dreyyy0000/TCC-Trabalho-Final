import { createFileRoute } from "@tanstack/react-router";
import { StoreLayout } from "@/components/store/StoreLayout";
import { CatalogView } from "@/components/store/CatalogView";
import { getCategories } from "@/lib/catalog.functions";

export const Route = createFileRoute("/categoria/$slug")({
  loader: async ({ params }) => {
    const categories = await getCategories();
    return { category: categories.find((item) => item.slug === params.slug) ?? null, slug: params.slug };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.category?.name ?? "Categoria";
    return {
      meta: [
        { title: `${name} | NYX.` },
        { name: "description", content: loaderData?.category?.description ?? `Confira as peças de ${name} da NYX.` },
        { property: "og:title", content: `${name} | NYX.` },
        { property: "og:description", content: loaderData?.category?.description ?? `Peças de ${name} streetwear.` },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category, slug } = Route.useLoaderData();
  return (
    <StoreLayout>
      <CatalogView
        title={category?.name ?? "Categoria"}
        description={category?.description ?? ""}
        base={{ category: slug }}
      />
    </StoreLayout>
  );
}
