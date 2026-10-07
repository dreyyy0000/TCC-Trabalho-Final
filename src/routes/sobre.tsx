import { createFileRoute } from "@tanstack/react-router";
import { StoreLayout } from "@/components/store/StoreLayout";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a NYX. | NYX." },
      { name: "description", content: "Somos uma loja brasileira de streetwear autoral: peças de tiragem limitada, materiais premium e um jeito urbano de vestir." },
      { property: "og:title", content: "Sobre a NYX. | NYX." },
      { property: "og:description", content: "Somos uma loja brasileira de streetwear autoral: peças de tiragem limitada, materiais premium e um jeito urbano de vestir." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <StoreLayout>
      <div className="container-street max-w-3xl py-14 md:py-20">
        <p className="eyebrow">NYX.</p>
        <h1 className="heading-xl mt-3 text-3xl md:text-5xl">Sobre a NYX.</h1>
        <p className="mt-4 text-sm text-muted-foreground">Somos uma loja brasileira de streetwear autoral: peças de tiragem limitada, materiais premium e um jeito urbano de vestir.</p>
        <div className="mt-10 space-y-8">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">Nossa história</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">A NYX. nasceu em 2019 numa oficina no centro de São Paulo com uma ideia simples: roupa de rua feita com padrão de alfaiataria. Hoje somos um marketplace com curadoria própria, produção em pequenos lotes e uma comunidade que dita o que entra em cada drop.</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">Curadoria</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Cada peça passa por prova de caimento, lavagem e uso real antes de entrar no catálogo. Trabalhamos com algodão pesado, malhas 100% naturais e couros de origem rastreada.</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">Compromisso</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Produção consciente, embalagens recicláveis e logística reversa para peças usadas. Menos coleção, mais durabilidade.</p>
          </section>
        </div>
      </div>
    </StoreLayout>
  );
}
