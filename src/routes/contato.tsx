import { createFileRoute } from "@tanstack/react-router";
import { StoreLayout } from "@/components/store/StoreLayout";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato | NYX." },
      { name: "description", content: "Fale com o time NYX. por e-mail, WhatsApp ou pelas redes. Atendimento de segunda a sexta, das 9h às 18h." },
      { property: "og:title", content: "Contato | NYX." },
      { property: "og:description", content: "Fale com o time NYX. por e-mail, WhatsApp ou pelas redes. Atendimento de segunda a sexta, das 9h às 18h." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <StoreLayout>
      <div className="container-street max-w-3xl py-14 md:py-20">
        <p className="eyebrow">NYX.</p>
        <h1 className="heading-xl mt-3 text-3xl md:text-5xl">Contato</h1>
        <p className="mt-4 text-sm text-muted-foreground">Fale com o time NYX. por e-mail, WhatsApp ou pelas redes. Atendimento de segunda a sexta, das 9h às 18h.</p>
        <div className="mt-10 space-y-8">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">Atendimento</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">E-mail: contato@nyx.com.br · WhatsApp: (11) 90000-0000 · Segunda a sexta, das 9h às 18h (exceto feriados).</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">Trocas e pedidos</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Para assuntos de pedidos, informe o número do pedido (formato STR-XXXXXX) no primeiro contato para agilizar o atendimento.</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">Imprensa e parcerias</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">press@nyx.com.br para imprensa, colabs e propostas comerciais.</p>
          </section>
        </div>
      </div>
    </StoreLayout>
  );
}
