import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { z } from "zod";
import { StoreLayout } from "@/components/store/StoreLayout";
import { PixQr } from "@/components/store/PixQr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { brl, isAdult } from "@/lib/format";
import { lineKey, useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { createOrder, validateCoupon } from "@/lib/orders.functions";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | NYX." },
      { name: "description", content: "Finalize sua compra com PIX ou cartão de crédito com segurança." },
      { property: "og:title", content: "Checkout | NYX." },
      { property: "og:description", content: "Finalize sua compra na NYX." },
    ],
  }),
  component: CheckoutPage,
});

const addressSchema = z.object({
  zip: z.string().trim().min(8, "CEP inválido").max(9),
  street: z.string().trim().min(3, "Informe a rua").max(120),
  number: z.string().trim().min(1, "Informe o número").max(12),
  complement: z.string().trim().max(80),
  district: z.string().trim().min(2, "Informe o bairro").max(80),
  city: z.string().trim().min(2, "Informe a cidade").max(80),
  state: z.string().trim().length(2, "UF com 2 letras"),
  name: z.string().trim().min(3, "Informe o nome completo").max(120),
  phone: z.string().trim().min(10, "Telefone inválido").max(20),
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { lines, subtotal, clear } = useCart();
  const submitOrder = useServerFn(createOrder);
  const checkCoupon = useServerFn(validateCoupon);

  const [form, setForm] = useState({
    zip: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
    name: profile?.name ?? "",
    phone: profile?.phone ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [method, setMethod] = useState<"pix" | "card">("pix");
  const [submitting, setSubmitting] = useState(false);

  const discount = coupon?.discount ?? 0;
  const shipping = subtotal >= 299 || subtotal === 0 ? 0 : 19.9;
  const pixDiscount = method === "pix" ? Number(((subtotal - discount) * 0.05).toFixed(2)) : 0;
  const total = Math.max(0, subtotal - discount - pixDiscount + shipping);

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    const result = await checkCoupon({ data: { code: couponCode, subtotal } });
    if (!result.valid) {
      setCoupon(null);
      toast.error(result.message);
      return;
    }
    setCoupon({ code: result.code, discount: result.discount });
    toast.success(result.message);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!lines.length) {
      toast.error("Seu carrinho está vazio.");
      return;
    }
    if (!isAdult(profile?.birth_date)) {
      toast.error(
        profile?.birth_date
          ? "Compras permitidas apenas para maiores de 18 anos."
          : "Informe sua data de nascimento em Minha conta para finalizar a compra (mínimo 18 anos).",
      );
      return;
    }
    const parsed = addressSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
      setErrors(fieldErrors);
      toast.error("Confira os dados de entrega.");
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const order = await submitOrder({
        data: {
          items: lines.map((line) => ({
            productId: line.productId,
            variantId: line.variantId,
            quantity: line.quantity,
          })),
          address: {
            zip: parsed.data.zip,
            street: parsed.data.street,
            number: parsed.data.number,
            complement: parsed.data.complement,
            district: parsed.data.district,
            city: parsed.data.city,
            state: parsed.data.state.toUpperCase(),
          },
          couponCode: coupon?.code ?? null,
          paymentMethod: method,
          customerName: parsed.data.name,
          customerPhone: parsed.data.phone,
        },
      });
      clear();
      toast.success(`Pedido ${order.orderNumber} criado`);
      void navigate({ to: "/pedido/$id", params: { id: order.orderId } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível concluir o pedido.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!lines.length) {
    return (
      <StoreLayout>
        <div className="container-street py-24 text-center">
          <h1 className="heading-xl text-3xl">Checkout</h1>
          <p className="mt-4 text-sm text-muted-foreground">Seu carrinho está vazio.</p>
          <Button asChild className="mt-6 tracking-widest">
            <Link to="/produtos">VER PRODUTOS</Link>
          </Button>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <form onSubmit={handleSubmit} className="container-street grid gap-12 py-10 md:py-16 lg:grid-cols-[1fr_380px]" noValidate>
        <div className="space-y-10">
          <div>
            <h1 className="heading-xl text-3xl md:text-4xl">Checkout</h1>
            <p className="mt-2 text-sm text-muted-foreground">Entrega e pagamento em um só passo.</p>
          </div>

          <section className="space-y-4">
            <p className="eyebrow">1. Dados de entrega</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Nome completo" value={form.name} onChange={update("name")} error={errors["name"]} />
              <Field id="phone" label="Telefone" value={form.phone} onChange={update("phone")} error={errors["phone"]} />
              <Field id="zip" label="CEP" value={form.zip} onChange={update("zip")} error={errors["zip"]} />
              <Field id="street" label="Rua" value={form.street} onChange={update("street")} error={errors["street"]} />
              <Field id="number" label="Número" value={form.number} onChange={update("number")} error={errors["number"]} />
              <Field id="complement" label="Complemento" value={form.complement} onChange={update("complement")} />
              <Field id="district" label="Bairro" value={form.district} onChange={update("district")} error={errors["district"]} />
              <Field id="city" label="Cidade" value={form.city} onChange={update("city")} error={errors["city"]} />
              <Field id="state" label="UF" value={form.state} onChange={update("state")} error={errors["state"]} />
            </div>
          </section>

          <section className="space-y-4">
            <p className="eyebrow">2. Pagamento</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <PaymentOption
                active={method === "pix"}
                title="PIX"
                subtitle="5% de desconto · aprovação imediata"
                onClick={() => setMethod("pix")}
              />
              <PaymentOption
                active={method === "card"}
                title="Cartão de crédito"
                subtitle="Até 6x sem juros"
                onClick={() => setMethod("card")}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Nenhum dado de cartão é armazenado pela NYX.
            </p>
            {method === "pix" ? (
              <div className="border border-border p-4">
                <p className="eyebrow">PIX do valor total</p>
                <div className="mt-4">
                  <PixQr amount={total} />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Pague pelo QR Code e finalize o pedido para registrarmos o pagamento.
                </p>
              </div>
            ) : null}
          </section>
        </div>

        <aside className="h-fit border border-border p-6 lg:sticky lg:top-28">
          <p className="eyebrow">Resumo do pedido</p>
          <ul className="mt-5 space-y-3">
            {lines.map((line) => (
              <li key={lineKey(line)} className="flex justify-between gap-3 text-sm">
                <span className="text-muted-foreground">
                  {line.quantity}× {line.name}
                  {line.size ? ` · ${line.size}` : ""}
                </span>
                <span>{brl(line.unitPrice * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-5" />
          <div className="flex gap-2">
            <Input
              placeholder="Cupom"
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
            />
            <Button type="button" variant="outline" onClick={() => void applyCoupon()}>
              Aplicar
            </Button>
          </div>
          <div className="mt-5 space-y-2 text-sm">
            <Row label="Subtotal" value={brl(subtotal)} />
            {discount > 0 ? <Row label={`Cupom ${coupon?.code}`} value={`- ${brl(discount)}`} /> : null}
            {pixDiscount > 0 ? <Row label="Desconto PIX (5%)" value={`- ${brl(pixDiscount)}`} /> : null}
            <Row label="Frete" value={shipping === 0 ? "Grátis" : brl(shipping)} />
            <Separator />
            <div className="flex items-center justify-between text-base font-bold">
              <span>Total</span>
              <span>{brl(total)}</span>
            </div>
          </div>
          <Button type="submit" size="lg" className="mt-6 w-full tracking-widest" disabled={submitting}>
            {submitting ? "PROCESSANDO..." : "PAGAR AGORA"}
          </Button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">Ambiente seguro · dados protegidos pela LGPD</p>
        </aside>
      </form>
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

function PaymentOption({
  active,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border p-4 text-left transition-colors ${active ? "border-foreground bg-secondary" : "border-border hover:border-foreground"}`}
    >
      <p className="font-display text-sm font-bold uppercase tracking-wide">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
    </button>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | undefined;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={onChange} />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
