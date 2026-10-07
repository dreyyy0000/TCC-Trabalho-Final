import { createFileRoute } from "@tanstack/react-router";
import { StoreLayout } from "@/components/store/StoreLayout";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade | NYX." },
      { name: "description", content: "Como a NYX. coleta, usa e protege seus dados pessoais em conformidade com a LGPD (Lei 13.709/2018)." },
      { property: "og:title", content: "Política de Privacidade | NYX." },
      { property: "og:description", content: "Como a NYX. coleta, usa e protege seus dados pessoais em conformidade com a LGPD (Lei 13.709/2018)." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <StoreLayout>
      <div className="container-street max-w-3xl py-14 md:py-20">
        <p className="eyebrow">NYX.</p>
        <h1 className="heading-xl mt-3 text-3xl md:text-5xl">Política de Privacidade</h1>
        <p className="mt-4 text-sm text-muted-foreground">Como a NYX. coleta, usa e protege seus dados pessoais em conformidade com a LGPD (Lei 13.709/2018).</p>
        <div className="mt-10 space-y-8">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">Dados coletados</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Coletamos nome, e-mail, CPF, telefone e endereço para processar pedidos, emitir notas fiscais e realizar entregas. Dados de navegação são usados de forma agregada para melhorar a loja.</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">Base legal e finalidade</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Tratamos dados com base na execução de contrato (compra), no cumprimento de obrigação legal (fiscal) e no legítimo interesse (prevenção a fraudes).</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">Compartilhamento</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Compartilhamos apenas o necessário com transportadoras e o processador de pagamento. Nunca vendemos dados pessoais.</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">Seus direitos</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Você pode solicitar acesso, correção, portabilidade, anonimização ou exclusão dos seus dados a qualquer momento pelo e-mail privacidade@nyx.com.br. Respondemos em até 15 dias.</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">Retenção</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Dados de pedidos são mantidos pelo prazo legal de 5 anos. Depois disso são anonimizados.</p>
          </section>
        </div>
      </div>
    </StoreLayout>
  );
}
