import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { brl } from "@/lib/format";
import { lineKey, useCart } from "@/hooks/useCart";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Carrinho | NYX." },
      { name: "description", content: "Revise as peças selecionadas e finalize sua compra na NYX." },
      { property: "og:title", content: "Carrinho | NYX." },
      { property: "og:description", content: "Revise seus itens e finalize a compra." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, subtotal, setQuantity, removeLine } = useCart();
  const shipping = subtotal >= 299 || subtotal === 0 ? 0 : 19.9;

  return (
    <StoreLayout>
      <div className="container-street py-10 md:py-16">
        <h1 className="heading-xl text-3xl md:text-5xl">Carrinho</h1>

        {!lines.length ? (
          <div className="mt-10 border border-dashed border-border py-24 text-center">
            <p className="font-display text-lg font-bold uppercase">Seu carrinho está vazio</p>
            <Button asChild className="mt-6 tracking-widest">
              <Link to="/produtos">CONTINUAR COMPRANDO</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
            <div className="divide-y divide-border border-y border-border">
              {lines.map((line) => (
                <div key={lineKey(line)} className="flex gap-4 py-6">
                  <Link to="/produto/$slug" params={{ slug: line.slug }} className="w-24 shrink-0 bg-secondary sm:w-28">
                    <img src={line.image ?? "/images/p-tee-black.jpg"} alt={line.name} loading="lazy" className="aspect-4/5 w-full object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link to="/produto/$slug" params={{ slug: line.slug }} className="text-sm font-semibold hover:underline">
                          {line.name}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {[line.size && `Tam ${line.size}`, line.color].filter(Boolean).join(" · ") || "Tamanho único"}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" aria-label="Remover" onClick={() => removeLine(lineKey(line))}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                      <div className="flex items-center border border-border">
                        <Button variant="ghost" size="icon" onClick={() => setQuantity(lineKey(line), line.quantity - 1)}>
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{line.quantity}</span>
                        <Button variant="ghost" size="icon" onClick={() => setQuantity(lineKey(line), line.quantity + 1)}>
                          <Plus className="size-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{brl(line.unitPrice)} un.</p>
                        <p className="text-sm font-bold">{brl(line.unitPrice * line.quantity)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-fit border border-border p-6">
              <p className="eyebrow">Resumo</p>
              <div className="mt-5 space-y-3 text-sm">
                <Row label="Subtotal" value={brl(subtotal)} />
                <Row label="Frete" value={shipping === 0 ? "Grátis" : brl(shipping)} />
                <Separator />
                <div className="flex items-center justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{brl(subtotal + shipping)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Cupons de desconto são aplicados no checkout.</p>
              </div>
              <Button asChild size="lg" className="mt-6 w-full tracking-widest">
                <Link to="/checkout">FINALIZAR COMPRA</Link>
              </Button>
              <Button asChild variant="ghost" className="mt-2 w-full text-xs tracking-widest">
                <Link to="/produtos">CONTINUAR COMPRANDO</Link>
              </Button>
            </aside>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
