import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const addressSchema = z.object({
  zip: z.string().min(8).max(9),
  street: z.string().min(2).max(120),
  number: z.string().min(1).max(12),
  complement: z.string().max(80).optional().nullable(),
  district: z.string().min(2).max(80),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(2),
});

const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().nullable(),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(30),
  address: addressSchema,
  couponCode: z.string().max(40).optional().nullable(),
  paymentMethod: z.enum(["pix", "card"]),
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().max(30).optional().nullable(),
});

export const validateCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { code: string; subtotal: number }) =>
    z.object({ code: z.string().min(1).max(40), subtotal: z.number().min(0) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: coupon } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", data.code.trim().toUpperCase())
      .maybeSingle();

    if (!coupon || !coupon.is_active) return { valid: false as const, message: "Cupom inválido." };
    const now = Date.now();
    if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now)
      return { valid: false as const, message: "Cupom ainda não está válido." };
    if (coupon.ends_at && new Date(coupon.ends_at).getTime() < now)
      return { valid: false as const, message: "Cupom expirado." };
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit)
      return { valid: false as const, message: "Cupom esgotado." };
    if (data.subtotal < Number(coupon.min_order_total))
      return { valid: false as const, message: `Pedido mínimo de R$ ${Number(coupon.min_order_total).toFixed(2)}.` };

    const discount =
      coupon.type === "PERCENT"
        ? Number(((data.subtotal * Number(coupon.value)) / 100).toFixed(2))
        : Math.min(Number(coupon.value), data.subtotal);

    return { valid: true as const, code: coupon.code, discount, message: "Cupom aplicado." };
  });

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => orderSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    const productIds = [...new Set(data.items.map((item) => item.productId))];
    const { data: products } = await supabaseAdmin
      .from("products")
      .select("id,name,slug,price,sale_price,stock,is_active,product_images(url,sort_order)")
      .in("id", productIds);
    const { data: variants } = await supabaseAdmin
      .from("product_variants")
      .select("id,product_id,size,color,stock")
      .in("product_id", productIds);

    let subtotal = 0;
    const orderItems: Record<string, unknown>[] = [];

    for (const item of data.items) {
      const product = products?.find((p) => p.id === item.productId);
      if (!product || !product.is_active) throw new Error("Produto indisponível no carrinho.");
      const variant = item.variantId ? variants?.find((v) => v.id === item.variantId) : null;
      if (item.variantId && !variant) throw new Error("Variação indisponível.");
      const available = variant ? variant.stock : product.stock;
      if (available < item.quantity) throw new Error(`Estoque insuficiente para ${product.name}.`);

      const unitPrice =
        product.sale_price && Number(product.sale_price) < Number(product.price)
          ? Number(product.sale_price)
          : Number(product.price);
      subtotal += unitPrice * item.quantity;

      const image = [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? null;
      orderItems.push({
        product_id: product.id,
        variant_id: variant?.id ?? null,
        product_name: product.name,
        product_image: image,
        size: variant?.size ?? null,
        color: variant?.color ?? null,
        unit_price: unitPrice,
        quantity: item.quantity,
      });
    }

    subtotal = Number(subtotal.toFixed(2));

    const { data: settings } = await supabaseAdmin.from("store_settings").select("*").eq("id", 1).maybeSingle();
    const flat = Number(settings?.flat_shipping ?? 19.9);
    const freeFrom = Number(settings?.free_shipping_threshold ?? 299);
    const shipping = subtotal >= freeFrom ? 0 : flat;

    let discount = 0;
    let couponRow: { id: string; code: string; used_count: number } | null = null;
    if (data.couponCode) {
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", data.couponCode.trim().toUpperCase())
        .maybeSingle();
      const now = Date.now();
      const valid =
        coupon &&
        coupon.is_active &&
        (!coupon.starts_at || new Date(coupon.starts_at).getTime() <= now) &&
        (!coupon.ends_at || new Date(coupon.ends_at).getTime() >= now) &&
        (!coupon.usage_limit || coupon.used_count < coupon.usage_limit) &&
        subtotal >= Number(coupon.min_order_total);
      if (valid) {
        discount =
          coupon.type === "PERCENT"
            ? Number(((subtotal * Number(coupon.value)) / 100).toFixed(2))
            : Math.min(Number(coupon.value), subtotal);
        couponRow = coupon;
      }
    }

    const pixDiscount =
      data.paymentMethod === "pix" ? Number(((subtotal - discount) * 0.05).toFixed(2)) : 0;
    discount = Number((discount + pixDiscount).toFixed(2));
    const total = Number(Math.max(0, subtotal - discount + shipping).toFixed(2));

    const { data: profile } = await supabaseAdmin.from("profiles").select("email").eq("id", userId).maybeSingle();

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        subtotal,
        discount,
        shipping,
        total,
        coupon_code: couponRow?.code ?? null,
        payment_method: data.paymentMethod,
        shipping_address: data.address,
        customer_name: data.customerName,
        customer_email: profile?.email ?? null,
        customer_phone: data.customerPhone ?? null,
      })
      .select("id,order_number,total")
      .single();
    if (error || !order) throw new Error("Não foi possível criar o pedido.");

    await supabaseAdmin
      .from("order_items")
      .insert(orderItems.map((item) => ({ ...item, order_id: order.id })) as never);

    for (const item of data.items) {
      if (item.variantId) {
        const variant = variants?.find((v) => v.id === item.variantId);
        if (variant) {
          await supabaseAdmin
            .from("product_variants")
            .update({ stock: Math.max(0, variant.stock - item.quantity) })
            .eq("id", variant.id);
        }
      }
      const product = products?.find((p) => p.id === item.productId);
      if (product) {
        await supabaseAdmin
          .from("products")
          .update({ stock: Math.max(0, product.stock - item.quantity) })
          .eq("id", product.id);
      }
    }

    if (couponRow) {
      await supabaseAdmin.from("coupons").update({ used_count: couponRow.used_count + 1 }).eq("id", couponRow.id);
      await supabaseAdmin.from("coupon_usages").insert({ coupon_id: couponRow.id, user_id: userId, order_id: order.id });
    }

    await supabaseAdmin.from("payments").insert({
      order_id: order.id,
      provider: "mercadopago",
      method: data.paymentMethod,
      amount: total,
      status: "PENDING",
    });

    return { orderId: order.id, orderNumber: order.order_number, total: Number(order.total) };
  });

export const startPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { orderId: string }) => z.object({ orderId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const token = process.env["MERCADOPAGO_ACCESS_TOKEN"];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id,user_id,total,payment_method,customer_email,customer_name,order_number")
      .eq("id", data.orderId)
      .maybeSingle();
    if (!order || order.user_id !== context.userId) throw new Error("Pedido não encontrado.");

    if (!token) {
      return {
        configured: false as const,
        message:
          "Pagamento real ainda não configurado. Adicione a credencial MERCADOPAGO_ACCESS_TOKEN (Mercado Pago > Suas integrações > Credenciais) para ativar PIX e cartão.",
      };
    }

    try {
      const response = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": order.id,
        },
        body: JSON.stringify({
          transaction_amount: Number(order.total),
          description: `Pedido ${order.order_number} - NYX.`,
          payment_method_id: order.payment_method === "pix" ? "pix" : undefined,
          payer: { email: order.customer_email ?? undefined, first_name: order.customer_name ?? undefined },
          external_reference: order.id,
        }),
      });
      const payload = (await response.json()) as {
        id?: number;
        status?: string;
        point_of_interaction?: { transaction_data?: { qr_code?: string; qr_code_base64?: string } };
        message?: string;
      };
      if (!response.ok) throw new Error(payload.message ?? "Falha ao criar pagamento.");

      const qr = payload.point_of_interaction?.transaction_data;
      await supabaseAdmin
        .from("payments")
        .update({
          provider_payment_id: String(payload.id ?? ""),
          qr_code: qr?.qr_code ?? null,
          qr_code_base64: qr?.qr_code_base64 ?? null,
          raw: payload as never,
        })
        .eq("order_id", order.id);

      return {
        configured: true as const,
        qrCode: qr?.qr_code ?? null,
        qrCodeBase64: qr?.qr_code_base64 ?? null,
        status: payload.status ?? "pending",
      };
    } catch (error) {
      return {
        configured: true as const,
        error: error instanceof Error ? error.message : "Erro ao processar pagamento.",
        qrCode: null,
        qrCodeBase64: null,
        status: "error",
      };
    }
  });

export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) return { granted: false as const, message: "Já existe um administrador nesta loja." };
    await supabaseAdmin.from("user_roles").insert({ user_id: context.userId, role: "admin" });
    return { granted: true as const, message: "Você agora é o administrador da loja." };
  });
