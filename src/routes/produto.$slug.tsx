import { useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Heart, Minus, Plus, Ruler, Star, Truck } from "lucide-react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { ProductGrid } from "@/components/store/ProductCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { brl, discountPercent, finalPrice } from "@/lib/format";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { getProductBySlug } from "@/lib/catalog.functions";

export const Route = createFileRoute("/produto/$slug")({
  loader: async ({ params }) => {
    const result = await getProductBySlug({ data: { slug: params.slug } });
    if (!result.product) throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    if (!loaderData?.product) {
      return { meta: [{ title: "Produto não encontrado | NYX." }, { name: "robots", content: "noindex" }] };
    }
    const { product } = loaderData;
    const description = (product.description ?? product.name).slice(0, 155);
    return {
      meta: [
        { title: `${product.name} | NYX.` },
        { name: "description", content: description },
        { property: "og:title", content: `${product.name} | NYX.` },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
      ],
    };
  },
  notFoundComponent: ProductNotFound,
  component: ProductPage,
});

function ProductNotFound() {
  return (
    <StoreLayout>
      <div className="container-street py-32 text-center">
        <h1 className="heading-xl text-3xl">Produto não encontrado</h1>
        <Button asChild className="mt-6">
          <Link to="/produtos">Voltar para a loja</Link>
        </Button>
      </div>
    </StoreLayout>
  );
}

function ProductPage() {
  const { product, related } = Route.useLoaderData();
  const navigate = useNavigate();
  const { addLine } = useCart();
  const { isFavorite, toggle } = useFavorites();

  const images = [...(product!.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const variants = product!.product_variants ?? [];
  const colors = product!.colors.length ? product!.colors : [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[];

  const [activeImage, setActiveImage] = useState(0);
  const [color, setColor] = useState<string | null>(colors[0] ?? null);
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const price = finalPrice(product!.price, product!.sale_price);
  const off = discountPercent(product!.price, product!.sale_price);

  const sizeOptions = product!.sizes.length ? product!.sizes : [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[];
  const variantFor = (value: string | null) =>
    variants.find((v) => v.size === value && (!color || !v.color || v.color === color)) ?? null;
  const selectedVariant = size ? variantFor(size) : null;
  const availableStock = selectedVariant
    ? selectedVariant.stock
    : variants.length
      ? variants.reduce((sum, v) => sum + v.stock, 0)
      : product!.stock;
  const soldOut = availableStock <= 0;

  const buildLine = () => ({
    productId: product!.id,
    variantId: selectedVariant?.id ?? null,
    slug: product!.slug,
    name: product!.name,
    image: images[0]?.url ?? null,
    size,
    color,
    unitPrice: price,
    quantity,
    maxStock: availableStock,
  });

  const requireSize = sizeOptions.length > 0;
  const canBuy = !soldOut && (!requireSize || Boolean(size));

  return (
    <StoreLayout>
      <div className="container-street py-10 md:py-14">
        <nav className="mb-8 text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">Home</Link> / <Link to="/produtos" className="hover:underline">Shop</Link> /{" "}
          <span className="text-foreground">{product!.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col-reverse gap-4 md:flex-row">
            <div className="flex gap-3 md:flex-col">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setActiveImage(index)}
                  className={cn("size-20 overflow-hidden border", activeImage === index ? "border-primary" : "border-border")}
                  aria-label={`Ver imagem ${index + 1}`}
                >
                  <img src={image.url} alt={image.alt ?? product!.name} loading="lazy" className="size-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex-1 bg-secondary">
              <img
                src={images[activeImage]?.url ?? "/images/p-tee-black.jpg"}
                alt={images[activeImage]?.alt ?? product!.name}
                width={1024}
                height={1280}
                className="aspect-4/5 w-full object-cover"
              />
            </div>
          </div>

          <div>
            <p className="eyebrow text-muted-foreground">{product!.categories?.name}</p>
            <h1 className="heading-xl mt-2 text-3xl md:text-5xl">{product!.name}</h1>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="size-4 fill-current" /> {Number(product!.rating).toFixed(1)} · {product!.sold_count} vendidos
            </div>

            <div className="mt-6 flex items-end gap-3">
              <span className="font-display text-3xl font-extrabold">{brl(price)}</span>
              {off > 0 ? (
                <>
                  <span className="text-sm text-muted-foreground line-through">{brl(product!.price)}</span>
                  <span className="bg-sale px-2 py-1 text-[10px] font-bold tracking-widest text-sale-foreground">-{off}%</span>
                </>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Em até 6x sem juros no cartão ou 5% OFF no PIX.</p>

            {colors.length ? (
              <div className="mt-8">
                <p className="eyebrow">Cor</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {colors.map((item) => (
                    <button
                      key={item}
                      onClick={() => setColor(item)}
                      className={cn(
                        "border px-4 py-2 text-xs font-semibold",
                        color === item ? "border-primary bg-primary text-primary-foreground" : "border-border",
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {sizeOptions.length ? (
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <p className="eyebrow">Tamanho</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                        <Ruler className="size-3" /> Guia de tamanhos
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Guia de tamanhos</DialogTitle>
                      </DialogHeader>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-left">
                            <th className="py-2">Tamanho</th>
                            <th>Largura</th>
                            <th>Comprimento</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[["P", "52 cm", "70 cm"], ["M", "55 cm", "72 cm"], ["G", "58 cm", "74 cm"], ["GG", "61 cm", "76 cm"]].map(
                            (row) => (
                              <tr key={row[0]} className="border-b border-border">
                                <td className="py-2">{row[0]}</td>
                                <td>{row[1]}</td>
                                <td>{row[2]}</td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                      <p className="text-xs text-muted-foreground">
                        Tênis: numeração brasileira padrão. Em dúvida entre dois tamanhos, escolha o maior.
                      </p>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizeOptions.map((item) => {
                    const variant = variantFor(item);
                    const unavailable = variants.length ? !variant || variant.stock <= 0 : false;
                    return (
                      <button
                        key={item}
                        disabled={unavailable}
                        onClick={() => { setSize(item); setQuantity(1); }}
                        className={cn(
                          "min-w-14 border px-4 py-2 text-xs font-semibold transition-colors",
                          size === item ? "border-primary bg-primary text-primary-foreground" : "border-border",
                          unavailable && "cursor-not-allowed text-muted-foreground line-through opacity-50",
                        )}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center border border-border">
                <Button variant="ghost" size="icon" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  <Minus className="size-4" />
                </Button>
                <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.min(availableStock || 1, q + 1))}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              <span className="text-xs text-muted-foreground">
                {soldOut ? "Produto esgotado" : `${availableStock} em estoque`}
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="flex-1 tracking-widest"
                disabled={!canBuy}
                onClick={() => addLine(buildLine())}
              >
                {soldOut ? "ESGOTADO" : requireSize && !size ? "SELECIONE UM TAMANHO" : "ADICIONAR AO CARRINHO"}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="flex-1 tracking-widest"
                disabled={!canBuy}
                onClick={() => {
                  addLine(buildLine());
                  void navigate({ to: "/checkout" });
                }}
              >
                COMPRAR AGORA
              </Button>
              <Button size="lg" variant="outline" aria-label="Favoritar" onClick={() => void toggle(product!.id)}>
                <Heart className={cn("size-4", isFavorite(product!.id) && "fill-current")} />
              </Button>
            </div>

            <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <Truck className="size-4" /> Frete grátis para pedidos acima de R$299.
            </p>

            <div className="mt-8 border-t border-border pt-6">
              <p className="eyebrow">Descrição</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {product!.description}
              </p>
              <p className="mt-4 text-xs text-muted-foreground">SKU: {product!.sku ?? "—"} · Marca: {product!.brand ?? "NYX."}</p>
            </div>
          </div>
        </div>

        {related.length ? (
          <section className="mt-20">
            <h2 className="heading-xl mb-8 text-2xl md:text-3xl">Você também pode gostar</h2>
            <ProductGrid products={related} />
          </section>
        ) : null}
      </div>
    </StoreLayout>
  );
}
