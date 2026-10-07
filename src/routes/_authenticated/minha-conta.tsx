import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { StoreLayout } from "@/components/store/StoreLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { brl, formatDate, isAdult, maskCpf, orderStatusLabel } from "@/lib/format";
import { claimAdmin } from "@/lib/orders.functions";

export const Route = createFileRoute("/_authenticated/minha-conta")({
  head: () => ({
    meta: [
      { title: "Minha conta | NYX." },
      { name: "description", content: "Gerencie seus dados, pedidos e privacidade na NYX." },
      { property: "og:title", content: "Minha conta | NYX." },
      { property: "og:description", content: "Seus pedidos e dados na NYX." },
    ],
  }),
  component: AccountPage,
});

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  order_items: { id: string; product_name: string; quantity: number }[];
};

function AccountPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, profile, isAdmin, signOut, refresh } = useAuth();
  const becomeAdmin = useServerFn(claimAdmin);
  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [birthDate, setBirthDate] = useState(profile?.birth_date ?? "");

  const { data: orders } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id,order_number,status,total,created_at,order_items(id,product_name,quantity)")
        .order("created_at", { ascending: false });
      return (data ?? []) as unknown as OrderRow[];
    },
  });

  const saveProfile = async () => {
    if (!user) return;
    if (birthDate && !isAdult(birthDate)) {
      toast.error("É necessário ter 18 anos ou mais.");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), phone: phone.trim(), birth_date: birthDate || null })
      .eq("id", user.id);
    if (error) {
      toast.error("Não foi possível salvar seus dados.");
      return;
    }
    await refresh();
    toast.success("Dados atualizados");
  };

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    void navigate({ to: "/", replace: true });
  };

  return (
    <StoreLayout>
      <div className="container-street py-10 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Olá, {profile?.name?.split(" ")[0] ?? "cliente"}</p>
            <h1 className="heading-xl mt-2 text-3xl md:text-5xl">Minha conta</h1>
          </div>
          <div className="flex gap-2">
            {isAdmin ? (
              <Button asChild variant="outline"><Link to="/admin">Painel admin</Link></Button>
            ) : null}
            <Button variant="ghost" onClick={() => void handleSignOut()}>Sair</Button>
          </div>
        </div>

        <Tabs defaultValue="orders" className="mt-10">
          <TabsList>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="profile">Dados</TabsTrigger>
            <TabsTrigger value="privacy">Privacidade</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-8">
            {orders?.length ? (
              <div className="divide-y divide-border border-y border-border">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    to="/pedido/$id"
                    params={{ id: order.id }}
                    className="flex flex-wrap items-center justify-between gap-3 py-5 transition-colors hover:bg-secondary/60"
                  >
                    <div>
                      <p className="text-sm font-semibold">{order.order_number}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(order.created_at)} · {order.order_items.length} item(ns)
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary">{orderStatusLabel[order.status] ?? order.status}</Badge>
                      <span className="text-sm font-bold">{brl(Number(order.total))}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
                Você ainda não fez pedidos.
              </p>
            )}
          </TabsContent>

          <TabsContent value="profile" className="mt-8 max-w-md space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de nascimento (mínimo 18 anos)</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={profile?.email ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input value={maskCpf(profile?.cpf)} disabled />
            </div>
            <Button onClick={() => void saveProfile()} className="tracking-widest">SALVAR</Button>
          </TabsContent>

          <TabsContent value="privacy" className="mt-8 max-w-2xl space-y-4 text-sm text-muted-foreground">
            <p>
              Tratamos seus dados conforme a LGPD. Você pode solicitar acesso, correção, portabilidade ou exclusão dos
              seus dados a qualquer momento pelo e-mail privacidade@nyx.com.br.
            </p>
            <p>
              Leia nossa <Link to="/privacidade" className="underline">Política de Privacidade</Link> e a{" "}
              <Link to="/cookies" className="underline">Política de Cookies</Link>.
            </p>
            {!isAdmin ? (
              <div className="border border-dashed border-border p-4">
                <p className="text-foreground">Loja ainda sem administrador?</p>
                <p className="mt-1">O primeiro usuário pode assumir a administração da loja.</p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={async () => {
                    const result = await becomeAdmin({});
                    if (!result.granted) {
                      toast.error(result.message);
                      return;
                    }
                    await refresh();
                    toast.success(result.message);
                  }}
                >
                  Tornar-me administrador
                </Button>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </StoreLayout>
  );
}
