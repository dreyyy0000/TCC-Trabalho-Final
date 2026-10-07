import { createFileRoute } from "@tanstack/react-router";
import { StoreLayout } from "@/components/store/StoreLayout";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Política de Cookies | NYX." },
      { name: "description", content: "Entenda quais cookies a NYX. utiliza, para quê servem e como você pode gerenciá-los." },
      { property: "og:title", content: "Política de Cookies | NYX." },
      { property: "og:description", content: "Entenda quais cookies a NYX. utiliza, para quê servem e como você pode gerenciá-los." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <StoreLayout>
      <div className="container-street max-w-3xl py-14 md:py-20">
        <p className="eyebrow">NYX.</p>
        <h1 className="heading-xl mt-3 text-3xl md:text-5xl">Política de Cookies</h1>
        <p className="mt-4 text-sm text-muted-foreground">Entenda quais cookies a NYX. utiliza, para quê servem e como você pode gerenciá-los.</p>
        <div className="mt-10 space-y-8">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">Essenciais</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Mantêm sua sessão, carrinho e preferências de segurança. Sem eles a loja não funciona.</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">Desempenho</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Ajudam a entender páginas mais visitadas e a corrigir erros. Dados agregados e anônimos.</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">Gerenciamento</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Você pode bloquear cookies nas configurações do navegador. Cookies essenciais permanecem necessários para concluir compras.</p>
          </section>
        </div>
      </div>
    </StoreLayout>
  );
}
