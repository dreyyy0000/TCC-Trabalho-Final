import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { PixQr } from "@/components/store/PixQr";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { brl, formatDate, orderStatusLabel } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/pedido/$id")({
  head: () => ({
    meta: [
      { title: "Pedido confirmado | NYX." },
      { name: "description", content: "Acompanhe o status e o pagamento do seu pedido NYX." },
      { property: "og:title", content: "Pedido | NYX." },
      { property: "og:description", content: "Acompanhe seu pedido NYX." },
    ],
  }),
  component: OrderPage,
});

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  payment_method: string;
  created_at: string;
  shipping_address: Record<string, string> | null;
  order_items: { id: string; product_name: string; quantity: number; unit_price: number; size: string | null }[];
};

function OrderPage() {
  const { id } = Route.useParams();

  const { data: order } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(id,product_name,quantity,unit_price,size)")
        .eq("id", id)
        .maybeSingle();
      return data as unknown as OrderRow | null;
    },
  });

  if (!order) {
    return (
      <StoreLayout>
        <div className="container-street py-24 text-center text-sm text-muted-foreground">Carregando pedido...</div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="container-street max-w-3xl py-12 md:py-20">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="size-7" />
          <h1 className="heading-xl text-3xl">Pedido confirmado</h1>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {order.order_number} · {formatDate(order.created_at)} · {orderStatusLabel[order.status] ?? order.status}
        </p>

        {order.payment_method === "pix" ? (
          <div className="mt-8 border border-border p-6">
            <p className="eyebrow">Pagamento via PIX</p>
            <div className="mt-4">
              <PixQr amount={Number(order.total)} reference={order.order_number} />
            </div>
          </div>
        ) : (
          <div className="mt-8 border border-border p-6 text-sm text-muted-foreground">
            Pagamento com cartão em processamento. Você receberá a confirmação por e-mail assim que for aprovado.
          </div>
        )}

        <div className="mt-8 border border-border p-6">
          <p className="eyebrow">Itens</p>
          <ul className="mt-4 space-y-3 text-sm">
            {order.order_items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {item.quantity}× {item.product_name}
                  {item.size ? ` · ${item.size}` : ""}
                </span>
                <span>{brl(Number(item.unit_price) * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-5" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{brl(Number(order.subtotal))}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Descontos</span><span>- {brl(Number(order.discount))}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Frete</span><span>{Number(order.shipping) === 0 ? "Grátis" : brl(Number(order.shipping))}</span></div>
            <div className="flex justify-between text-base font-bold"><span>Total</span><span>{brl(Number(order.total))}</span></div>
          </div>
        </div>

        {order.shipping_address ? (
          <div className="mt-8 border border-border p-6 text-sm text-muted-foreground">
            <p className="eyebrow text-foreground">Entrega</p>
            <p className="mt-3">
              {order.shipping_address["street"]}, {order.shipping_address["number"]}
              {order.shipping_address["complement"] ? ` · ${order.shipping_address["complement"]}` : ""} —{" "}
              {order.shipping_address["district"]}, {order.shipping_address["city"]}/{order.shipping_address["state"]} ·{" "}
              {order.shipping_address["zip"]}
            </p>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="outline"><Link to="/minha-conta">Meus pedidos</Link></Button>
          <Button asChild><Link to="/produtos">Continuar comprando</Link></Button>
        </div>
      </div>
    </StoreLayout>
  );
}
