import { createFileRoute } from "@tanstack/react-router";
import { StoreLayout } from "@/components/store/StoreLayout";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso | NYX." },
      { name: "description", content: "Condições gerais de uso da loja NYX., compras, pagamentos, prazos e responsabilidades." },
      { property: "og:title", content: "Termos de Uso | NYX." },
      { property: "og:description", content: "Condições gerais de uso da loja NYX., compras, pagamentos, prazos e responsabilidades." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <StoreLayout>
      <div className="container-street max-w-3xl py-14 md:py-20">
        <p className="eyebrow">NYX.</p>
        <h1 className="heading-xl mt-3 text-3xl md:text-5xl">Termos de Uso</h1>
        <p className="mt-4 text-sm text-muted-foreground">Condições gerais de uso da loja NYX., compras, pagamentos, prazos e responsabilidades.</p>
        <div className="mt-10 space-y-8">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">Uso da plataforma</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Ao criar uma conta você declara ser maior de 18 anos e responsável pelas informações fornecidas. É proibido usar a loja para fins ilícitos ou revenda não autorizada.</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">Preços e disponibilidade</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Preços e estoque podem mudar sem aviso prévio. Em caso de erro evidente de precificação, o pedido pode ser cancelado com reembolso integral.</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">Pagamentos</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Pagamentos são processados por parceiro certificado (Mercado Pago). Não armazenamos dados de cartão nos nossos servidores.</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">Entrega</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">O prazo começa após a confirmação do pagamento. Atrasos de transportadora ou greves são comunicados por e-mail.</p>
          </section>
        </div>
      </div>
    </StoreLayout>
  );
}
