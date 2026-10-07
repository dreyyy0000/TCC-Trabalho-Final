import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { StoreLayout } from "@/components/store/StoreLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { brl, formatDate, isAdminEmail, orderStatusLabel } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Painel administrativo | NYX." },
      { name: "description", content: "Gerencie produtos, estoque, pedidos e cupons da loja NYX." },
      { property: "og:title", content: "Painel administrativo | NYX." },
      { property: "og:description", content: "Gestão da loja NYX." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"];

function AdminPage() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <StoreLayout>
        <div className="container-street py-24 text-center text-sm text-muted-foreground">Carregando painel...</div>
      </StoreLayout>
    );
  }

  if (!isAdmin) {
    return (
      <StoreLayout>
        <div className="container-street py-24 text-center">
          <h1 className="heading-xl text-3xl">Acesso restrito</h1>
          <p className="mt-3 text-sm text-muted-foreground">Esta área é exclusiva para administradores da loja.</p>
          <Button asChild className="mt-6"><Link to="/minha-conta">Voltar para minha conta</Link></Button>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="container-street py-10 md:py-16">
        <p className="eyebrow">NYX. admin</p>
        <h1 className="heading-xl mt-2 text-3xl md:text-5xl">Painel administrativo</h1>

        <Tabs defaultValue="dashboard" className="mt-10">
          <TabsList className="flex-wrap">
            <TabsTrigger value="dashboard">Visão geral</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="data">Dados dos pedidos</TabsTrigger>
            <TabsTrigger value="products">Produtos e estoque</TabsTrigger>
            <TabsTrigger value="coupons">Cupons</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="mt-8"><DashboardTab /></TabsContent>
          <TabsContent value="orders" className="mt-8"><OrdersTab /></TabsContent>
          <TabsContent value="customers" className="mt-8"><CustomersTab /></TabsContent>
          <TabsContent value="data" className="mt-8"><OrderDataTab /></TabsContent>
          <TabsContent value="products" className="mt-8"><ProductsTab /></TabsContent>
          <TabsContent value="coupons" className="mt-8"><CouponsTab /></TabsContent>
        </Tabs>
      </div>
    </StoreLayout>
  );
}

function DashboardTab() {
  const { data } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: async () => {
      const [orders, products, customers] = await Promise.all([
        supabase.from("orders").select("id,total,status,created_at"),
        supabase.from("products").select("id,stock,is_active"),
        supabase.from("profiles").select("id,email"),
      ]);
      const rows = orders.data ?? [];
      const revenue = rows
        .filter((order) => order.status !== "CANCELED")
        .reduce((sum, order) => sum + Number(order.total), 0);
      return {
        revenue,
        orders: rows.length,
        pending: rows.filter((order) => order.status === "PENDING").length,
        products: (products.data ?? []).length,
        lowStock: (products.data ?? []).filter((product) => product.stock <= 5).length,
        customers: (customers.data ?? []).filter((p) => !isAdminEmail(p.email)).length,
      };
    },
  });

  const cards = [
    { label: "Faturamento", value: brl(data?.revenue ?? 0) },
    { label: "Pedidos", value: String(data?.orders ?? 0) },
    { label: "Aguardando pagamento", value: String(data?.pending ?? 0) },
    { label: "Produtos ativos", value: String(data?.products ?? 0) },
    { label: "Estoque baixo", value: String(data?.lowStock ?? 0) },
    { label: "Clientes", value: String(data?.customers ?? 0) },
  ];

  return (
    <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="bg-background p-6">
          <p className="eyebrow">{card.label}</p>
          <p className="mt-3 font-display text-3xl font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

type AdminOrder = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
  payment_method: string | null;
};

function OrdersTab() {
  const queryClient = useQueryClient();
  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id,order_number,status,total,created_at,customer_name,customer_email,payment_method")
        .order("created_at", { ascending: false })
        .limit(100);
      return (data ?? []) as AdminOrder[];
    },
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: status as "PENDING" })
      .eq("id", id);
    if (error) {
      toast.error("Não foi possível atualizar o pedido.");
      return;
    }
    toast.success("Status atualizado");
    void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-secondary text-left">
          <tr>
            <Th>Pedido</Th><Th>Cliente</Th><Th>Data</Th><Th>Pagamento</Th><Th>Total</Th><Th>Status</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders?.map((order) => (
            <tr key={order.id}>
              <Td>{order.order_number}</Td>
              <Td>
                <span className="block">{order.customer_name ?? "—"}</span>
                <span className="text-xs text-muted-foreground">{order.customer_email ?? ""}</span>
              </Td>
              <Td>{formatDate(order.created_at)}</Td>
              <Td className="uppercase">{order.payment_method ?? "—"}</Td>
              <Td>{brl(Number(order.total))}</Td>
              <Td>
                <Select value={order.status} onValueChange={(value) => void updateStatus(order.id, value)}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>{orderStatusLabel[status] ?? status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Td>
            </tr>
          ))}
          {!orders?.length ? (
            <tr><Td>Nenhum pedido ainda.</Td></tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
};

type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  cpf: string | null;
  phone: string | null;
  created_at: string;
};

function CustomersTab() {
  return <CustomersTable />;
}

function OrderDataTab() {
  const { data } = useQuery({
    queryKey: ["admin-order-data"],
    queryFn: async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select(
          "id,order_number,status,payment_status,payment_method,total,created_at,customer_name,customer_email,customer_phone,shipping_address",
        )
        .order("created_at", { ascending: false })
        .limit(100);
      const ids = (orders ?? []).map((o) => o.id);
      const { data: items } = ids.length
        ? await supabase
            .from("order_items")
            .select("order_id,product_name,size,color,quantity,unit_price,created_at")
            .in("order_id", ids)
        : { data: [] };
      return { orders: orders ?? [], items: items ?? [] };
    },
  });

  const orders = data?.orders ?? [];

  if (!orders.length) {
    return <p className="text-sm text-muted-foreground">Nenhum pedido registrado ainda.</p>;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const items = (data?.items ?? []).filter((i) => i.order_id === order.id);
        const address = order.shipping_address as Record<string, string> | null;
        return (
          <div key={order.id} className="border border-border p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-lg font-bold">{order.order_number}</p>
                <p className="text-xs text-muted-foreground">
                  Feito em {formatDate(order.created_at)} · {orderStatusLabel[order.status] ?? order.status}
                </p>
              </div>
              <p className="font-display text-xl font-bold">{brl(Number(order.total))}</p>
            </div>

            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="eyebrow text-muted-foreground">Cliente</p>
                <p>{order.customer_name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{order.customer_email ?? ""}</p>
                <p className="text-xs text-muted-foreground">{order.customer_phone ?? ""}</p>
              </div>
              <div>
                <p className="eyebrow text-muted-foreground">Entrega e pagamento</p>
                <p className="text-xs text-muted-foreground">
                  {address
                    ? `${address['street'] ?? ""}, ${address['number'] ?? ""} — ${address['city'] ?? ""}/${address['state'] ?? ""}`
                    : "—"}
                </p>
                <p className="text-xs uppercase text-muted-foreground">
                  {order.payment_method ?? "—"} · {order.payment_status}
                </p>
              </div>
            </div>

            <ul className="mt-4 divide-y divide-border border-t border-border text-sm">
              {items.map((item, index) => (
                <li key={`${order.id}-${index}`} className="flex flex-wrap justify-between gap-2 py-2">
                  <span>
                    {item.quantity}x {item.product_name}
                    <span className="text-xs text-muted-foreground">
                      {item.size ? ` · ${item.size}` : ""}{item.color ? ` · ${item.color}` : ""}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(item.created_at)}</span>
                  <span>{brl(Number(item.unit_price) * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function CustomersTable() {
  const { data } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const [profiles, addresses, orders] = await Promise.all([
        supabase
          .from("profiles")
          .select("id,name,email,cpf,phone,created_at")
          .order("created_at", { ascending: false }),
        supabase.from("addresses").select("user_id,street,number,district,city,state,zip,is_default"),
        supabase.from("orders").select("user_id,total,status,created_at"),
      ]);
      return {
        customers: ((profiles.data ?? []) as AdminCustomer[]).filter((c) => !isAdminEmail(c.email)),
        addresses: addresses.data ?? [],
        orders: orders.data ?? [],
      };
    },
  });

  const customers = data?.customers ?? [];

  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-secondary text-left">
          <tr><Th>Cliente</Th><Th>Contato</Th><Th>CPF</Th><Th>Endereço</Th><Th>Pedidos</Th><Th>Total gasto</Th><Th>Cadastro</Th></tr>
        </thead>
        <tbody className="divide-y divide-border">
          {customers.map((customer) => {
            const address =
              (data?.addresses ?? []).find((a) => a.user_id === customer.id && a.is_default) ??
              (data?.addresses ?? []).find((a) => a.user_id === customer.id);
            const userOrders = (data?.orders ?? []).filter((o) => o.user_id === customer.id);
            const spent = userOrders
              .filter((o) => o.status !== "CANCELED")
              .reduce((sum, o) => sum + Number(o.total), 0);
            return (
              <tr key={customer.id}>
                <Td className="font-semibold">{customer.name || "—"}</Td>
                <Td>
                  <span className="block">{customer.email}</span>
                  <span className="text-xs text-muted-foreground">{customer.phone ?? ""}</span>
                </Td>
                <Td>{customer.cpf ?? "—"}</Td>
                <Td className="text-xs text-muted-foreground">
                  {address
                    ? `${address.street}, ${address.number} — ${address.district}, ${address.city}/${address.state} · ${address.zip}`
                    : "—"}
                </Td>
                <Td>{userOrders.length}</Td>
                <Td>{brl(spent)}</Td>
                <Td>{formatDate(customer.created_at)}</Td>
              </tr>
            );
          })}
          {!customers.length ? <tr><Td>Nenhum cliente cadastrado ainda.</Td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}

function ProductsTab() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Record<string, { price: string; sale: string; stock: string }>>({});

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id,name,slug,price,sale_price,stock,is_active,is_featured")
        .order("name");
      return (data ?? []) as AdminProduct[];
    },
  });

  const save = async (product: AdminProduct) => {
    const values = draft[product.id];
    const price = Number(values?.price ?? product.price);
    const sale = values?.sale === "" ? null : Number(values?.sale ?? product.sale_price ?? 0);
    const stock = Number(values?.stock ?? product.stock);
    if (Number.isNaN(price) || price <= 0 || Number.isNaN(stock) || stock < 0) {
      toast.error("Valores inválidos.");
      return;
    }
    const { error } = await supabase
      .from("products")
      .update({ price, sale_price: sale && sale > 0 ? sale : null, stock })
      .eq("id", product.id);
    if (error) {
      toast.error("Não foi possível salvar o produto.");
      return;
    }
    toast.success("Produto atualizado");
    void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const toggle = async (product: AdminProduct, key: "is_active" | "is_featured", value: boolean) => {
    const patch = key === "is_active" ? { is_active: value } : { is_featured: value };
    const { error } = await supabase.from("products").update(patch).eq("id", product.id);
    if (error) {
      toast.error("Não foi possível atualizar.");
      return;
    }
    void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
  };

  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full min-w-[860px] text-sm">
        <thead className="bg-secondary text-left">
          <tr><Th>Produto</Th><Th>Preço</Th><Th>Promo</Th><Th>Estoque</Th><Th>Ativo</Th><Th>Destaque</Th><Th /></tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products?.map((product) => (
            <tr key={product.id}>
              <Td>
                <Link to="/produto/$slug" params={{ slug: product.slug }} className="hover:underline">{product.name}</Link>
                {product.stock <= 5 ? <Badge variant="destructive" className="ml-2">Estoque baixo</Badge> : null}
              </Td>
              <Td>
                <Input
                  className="w-24"
                  defaultValue={String(product.price)}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [product.id]: {
                        price: event.target.value,
                        sale: current[product.id]?.sale ?? String(product.sale_price ?? ""),
                        stock: current[product.id]?.stock ?? String(product.stock),
                      },
                    }))
                  }
                />
              </Td>
              <Td>
                <Input
                  className="w-24"
                  defaultValue={product.sale_price ? String(product.sale_price) : ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [product.id]: {
                        price: current[product.id]?.price ?? String(product.price),
                        sale: event.target.value,
                        stock: current[product.id]?.stock ?? String(product.stock),
                      },
                    }))
                  }
                />
              </Td>
              <Td>
                <Input
                  className="w-20"
                  defaultValue={String(product.stock)}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [product.id]: {
                        price: current[product.id]?.price ?? String(product.price),
                        sale: current[product.id]?.sale ?? String(product.sale_price ?? ""),
                        stock: event.target.value,
                      },
                    }))
                  }
                />
              </Td>
              <Td><Switch checked={product.is_active} onCheckedChange={(value) => void toggle(product, "is_active", value)} /></Td>
              <Td><Switch checked={product.is_featured} onCheckedChange={(value) => void toggle(product, "is_featured", value)} /></Td>
              <Td><Button size="sm" variant="outline" onClick={() => void save(product)}>Salvar</Button></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type AdminCoupon = {
  id: string;
  code: string;
  type: string;
  value: number;
  min_order_total: number;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
};

function CouponsTab() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ code: "", type: "PERCENT", value: "10", min: "0", limit: "" });

  const { data: coupons } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const { data } = await supabase
        .from("coupons")
        .select("id,code,type,value,min_order_total,usage_limit,used_count,is_active")
        .order("created_at", { ascending: false });
      return (data ?? []) as AdminCoupon[];
    },
  });

  const create = async () => {
    const code = form.code.trim().toUpperCase();
    const value = Number(form.value);
    if (code.length < 3) {
      toast.error("Código muito curto.");
      return;
    }
    if (Number.isNaN(value) || value <= 0) {
      toast.error("Valor inválido.");
      return;
    }
    const { error } = await supabase.from("coupons").insert({
      code,
      type: form.type as "PERCENT" | "FIXED",
      value,
      min_order_total: Number(form.min) || 0,
      usage_limit: form.limit ? Number(form.limit) : null,
      is_active: true,
    });
    if (error) {
      toast.error("Não foi possível criar o cupom (código duplicado?).");
      return;
    }
    toast.success("Cupom criado");
    setForm({ code: "", type: "PERCENT", value: "10", min: "0", limit: "" });
    void queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[360px_1fr]">
      <div className="h-fit border border-border p-6">
        <p className="eyebrow">Novo cupom</p>
        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código</Label>
            <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENT">Percentual (%)</SelectItem>
                <SelectItem value="FIXED">Valor fixo (R$)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Valor</Label>
            <Input id="value" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="min">Pedido mínimo (R$)</Label>
            <Input id="min" value={form.min} onChange={(e) => setForm({ ...form, min: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="limit">Limite de usos (opcional)</Label>
            <Input id="limit" value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value })} />
          </div>
          <Button className="w-full tracking-widest" onClick={() => void create()}>CRIAR CUPOM</Button>
        </div>
      </div>

      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-secondary text-left">
            <tr><Th>Código</Th><Th>Desconto</Th><Th>Mínimo</Th><Th>Usos</Th><Th>Ativo</Th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons?.map((coupon) => (
              <tr key={coupon.id}>
                <Td className="font-semibold">{coupon.code}</Td>
                <Td>{coupon.type === "PERCENT" ? `${Number(coupon.value)}%` : brl(Number(coupon.value))}</Td>
                <Td>{brl(Number(coupon.min_order_total))}</Td>
                <Td>{coupon.used_count}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ""}</Td>
                <Td>
                  <Switch
                    checked={coupon.is_active}
                    onCheckedChange={async (value) => {
                      await supabase.from("coupons").update({ is_active: value }).eq("id", coupon.id);
                      void queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
                    }}
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">{children}</th>;
}

function Td({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}
