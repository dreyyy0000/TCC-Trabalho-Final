import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CreditCard, Headphones, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { StoreLayout } from "@/components/store/StoreLayout";
import { ProductGrid } from "@/components/store/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getHomeData } from "@/lib/catalog.functions";

export const Route = createFileRoute("/")({
  loader: () => getHomeData(),
  head: () => ({
    meta: [
      { title: "NYX. — Nova coleção de streetwear premium" },
      {
        name: "description",
        content:
          "Camisetas oversized, moletons heavyweight, cargos, tênis e acessórios. Frete grátis acima de R$299 e envio para todo o Brasil.",
      },
      { property: "og:title", content: "NYX. — Street starts here." },
      { property: "og:description", content: "Peças selecionadas para quem cria o próprio estilo." },
    ],
  }),
  component: Home,
});

const BENEFITS = [
  { icon: CreditCard, title: "Pagamento seguro", text: "PIX e cartão processados pelo gateway." },
  { icon: Truck, title: "Envio nacional", text: "Entregamos para todo o Brasil." },
  { icon: ShieldCheck, title: "Compra protegida", text: "Dados criptografados e LGPD." },
  { icon: Headphones, title: "Suporte real", text: "Atendimento humano de seg a sex." },
];

function Home() {
  const { categories, offers, bestsellers, latest, banners } = Route.useLoaderData();
  const [email, setEmail] = useState("");
  const banner = banners[0];

  return (
    <StoreLayout>
      <section className="relative isolate">
        <img
          src={banner?.image_url ?? "/images/hero.jpg"}
          alt="Modelo vestindo camiseta oversized e calça cargo em cenário urbano"
          width={1920}
          height={1200}
          className="h-[78vh] min-h-[520px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="container-street absolute inset-0 flex flex-col justify-end pb-16 md:justify-center md:pb-0">
          <div className="max-w-2xl animate-fade-up text-white">
            <p className="eyebrow">{banner?.title ?? "NOVA COLEÇÃO"}</p>
            <h1 className="heading-xl mt-4 text-5xl md:text-8xl">{banner?.subtitle ?? "NYX STARTS HERE."}</h1>
            <p className="mt-6 max-w-md text-sm text-white/80 md:text-base">
              Peças selecionadas para quem cria o próprio estilo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary" className="tracking-widest">
                <Link to="/produtos">COMPRAR AGORA</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/60 bg-transparent tracking-widest text-white hover:bg-white hover:text-primary"
              >
                <Link to="/novidades">VER COLEÇÃO</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container-street py-16 md:py-24">
        <div className="flex items-end justify-between">
          <h2 className="heading-xl text-2xl md:text-4xl">Categorias</h2>
          <Link to="/produtos" className="eyebrow text-muted-foreground hover:text-foreground">
            Ver tudo
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          {categories.slice(0, 5).map((category) => (
            <Link
              key={category.id}
              to="/categoria/$slug"
              params={{ slug: category.slug }}
              className="group relative overflow-hidden bg-secondary"
            >
              <img
                src={category.image_url ?? "/images/p-tee-black.jpg"}
                alt={category.name}
                loading="lazy"
                className="aspect-3/4 w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="absolute bottom-4 left-4 font-display text-sm font-bold uppercase tracking-widest text-white">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Section title="Ofertas" href="/ofertas" products={offers} />
      <Section title="Mais vendidos" href="/produtos" products={bestsellers} />
      <Section title="Novidades" href="/novidades" products={latest} />

      <section className="bg-primary py-14 text-primary-foreground">
        <div className="container-street flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <p className="heading-xl text-2xl md:text-4xl">Frete grátis acima de R$299</p>
          <Button asChild variant="secondary" size="lg" className="tracking-widest">
            <Link to="/produtos">
              APROVEITAR <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="container-street grid gap-8 py-16 md:grid-cols-4">
        {BENEFITS.map((benefit) => (
          <div key={benefit.title} className="border-t border-border pt-5">
            <benefit.icon className="size-5" />
            <p className="mt-3 text-sm font-semibold">{benefit.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{benefit.text}</p>
          </div>
        ))}
      </section>

      <section className="container-street pb-8">
        <div className="border border-border p-8 md:p-14">
          <h2 className="heading-xl text-2xl md:text-4xl">Entre para a lista</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Receba drops, restocks e ofertas antes de todo mundo.
          </p>
          <form
            className="mt-6 flex max-w-lg flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) {
                toast.error("Informe um e-mail válido");
                return;
              }
              setEmail("");
              toast.success("Pronto! Você está na lista.");
            }}
          >
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Digite seu e-mail"
              aria-label="Seu e-mail"
            />
            <Button type="submit" className="tracking-widest">
              QUERO RECEBER
            </Button>
          </form>
        </div>
      </section>
    </StoreLayout>
  );
}

function Section({
  title,
  href,
  products,
}: {
  title: string;
  href: "/ofertas" | "/produtos" | "/novidades";
  products: Parameters<typeof ProductGrid>[0]["products"];
}) {
  if (!products.length) return null;
  return (
    <section className="container-street py-10 md:py-16">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="heading-xl text-2xl md:text-4xl">{title}</h2>
        <Link to={href} className="eyebrow text-muted-foreground hover:text-foreground">
          Ver tudo
        </Link>
      </div>
      <ProductGrid products={products.slice(0, 4)} />
    </section>
  );
}
