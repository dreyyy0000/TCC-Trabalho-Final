import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { StoreLayout } from "@/components/store/StoreLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { isAdult, isValidCpf } from "@/lib/format";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar | NYX." },
      { name: "description", content: "Acesse sua conta NYX. para acompanhar pedidos e favoritos." },
      { property: "og:title", content: "Entrar | NYX." },
      { property: "og:description", content: "Acesse sua conta NYX." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      void navigate({ to: isAdmin ? "/admin" : "/minha-conta", replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setSubmitting(false);
      toast.error(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha inválidos. Se ainda não criou esta conta, use \"Criar conta\"."
          : error.message,
      );
      return;
    }
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("cpf,birth_date")
        .eq("id", userId)
        .maybeSingle();
      const cpf = profile?.cpf ?? "";
      if (cpf && !isValidCpf(cpf)) {
        await supabase.auth.signOut();
        setSubmitting(false);
        toast.error("O CPF cadastrado é inválido. Fale com o suporte para atualizar seus dados.");
        return;
      }
      if (profile?.birth_date && !isAdult(profile.birth_date)) {
        await supabase.auth.signOut();
        setSubmitting(false);
        toast.error("Acesso permitido apenas para maiores de 18 anos.");
        return;
      }
    }
    setSubmitting(false);
    toast.success("Login realizado");
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("Não foi possível entrar com Google.");
      return;
    }
    if (result.redirected) return;
  };

  return (
    <StoreLayout>
      <div className="container-street flex justify-center py-16">
        <div className="w-full max-w-md border border-border p-8">
          <h1 className="heading-xl text-3xl">Entrar</h1>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" size="lg" className="w-full tracking-widest" disabled={submitting}>
              {submitting ? "ENTRANDO..." : "ENTRAR"}
            </Button>
          </form>
          <Button variant="outline" className="mt-3 w-full" onClick={() => void handleGoogle()}>
            Entrar com Google
          </Button>
          <div className="mt-6 flex justify-between text-xs text-muted-foreground">
            <Link to="/esqueci-senha" className="hover:text-foreground">Esqueci minha senha</Link>
            <Link to="/cadastro" className="hover:text-foreground">Não tenho uma conta</Link>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
