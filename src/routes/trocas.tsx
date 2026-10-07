import { createFileRoute } from "@tanstack/react-router";
import { StoreLayout } from "@/components/store/StoreLayout";

export const Route = createFileRoute("/trocas")({
  head: () => ({
    meta: [
      { title: "Trocas e Devoluções | NYX." },
      { name: "description", content: "Prazos, condições e passo a passo para trocar ou devolver uma peça comprada na NYX." },
      { property: "og:title", content: "Trocas e Devoluções | NYX." },
      { property: "og:description", content: "Prazos, condições e passo a passo para trocar ou devolver uma peça comprada na NYX." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <StoreLayout>
      <div className="container-street max-w-3xl py-14 md:py-20">
        <p className="eyebrow">NYX.</p>
        <h1 className="heading-xl mt-3 text-3xl md:text-5xl">Trocas e Devoluções</h1>
        <p className="mt-4 text-sm text-muted-foreground">Prazos, condições e passo a passo para trocar ou devolver uma peça comprada na NYX.</p>
        <div className="mt-10 space-y-8">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">Arrependimento (7 dias)</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Conforme o Código de Defesa do Consumidor, você pode desistir da compra em até 7 dias corridos após o recebimento, com reembolso integral.</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">Troca por tamanho (30 dias)</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Primeira troca por tamanho é gratuita em até 30 dias, desde que a peça esteja sem uso, com etiquetas e embalagem original.</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">Como solicitar</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Acesse Minha conta &gt; Pedidos, escolha o pedido e fale com o atendimento por trocas@nyx.com.br informando o número do pedido.</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">Reembolso</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Cartão: estorno em até 2 faturas. PIX: devolução em até 5 dias úteis na mesma chave.</p>
          </section>
        </div>
      </div>
    </StoreLayout>
  );
}
