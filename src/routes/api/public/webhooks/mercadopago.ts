import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/webhooks/mercadopago")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env["MERCADOPAGO_ACCESS_TOKEN"];
        if (!token) return new Response("not configured", { status: 503 });

        const body = (await request.json().catch(() => null)) as { data?: { id?: string } } | null;
        const paymentId = body?.data?.id;
        if (!paymentId) return new Response("ignored", { status: 200 });

        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return new Response("payment lookup failed", { status: 202 });
        const payment = (await response.json()) as { status?: string; external_reference?: string };
        if (!payment.external_reference) return new Response("ok");

        const status =
          payment.status === "approved" ? "PAID" : payment.status === "refunded" ? "REFUNDED" : payment.status === "rejected" ? "FAILED" : "PENDING";

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin
          .from("payments")
          .update({ status, provider_payment_id: String(paymentId) })
          .eq("order_id", payment.external_reference);
        if (status === "PAID") {
          await supabaseAdmin.from("orders").update({ status: "PAID" }).eq("id", payment.external_reference);
        }
        return new Response("ok");
      },
    },
  },
});
