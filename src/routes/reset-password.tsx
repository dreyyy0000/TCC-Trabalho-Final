import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { StoreLayout } from "@/components/store/StoreLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nova senha | NYX." },
      { name: "description", content: "Defina uma nova senha para sua conta NYX." },
      { property: "og:title", content: "Nova senha | NYX." },
      { property: "og:description", content: "Defina uma nova senha." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <StoreLayout>
      <div className="container-street flex justify-center py-16">
        <form
          className="w-full max-w-md border border-border p-8"
          onSubmit={async (event) => {
            event.preventDefault();
            if (password.length < 8) {
              toast.error("A senha deve ter ao menos 8 caracteres.");
              return;
            }
            if (password !== confirm) {
              toast.error("As senhas não conferem.");
              return;
            }
            const { error } = await supabase.auth.updateUser({ password });
            if (error) {
              toast.error(error.message);
              return;
            }
            toast.success("Senha atualizada");
            void navigate({ to: "/minha-conta" });
          }}
        >
          <h1 className="heading-xl text-3xl">Nova senha</h1>
          <div className="mt-8 space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="confirm">Confirmar senha</Label>
            <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <Button type="submit" size="lg" className="mt-6 w-full tracking-widest">
            SALVAR
          </Button>
        </form>
      </div>
    </StoreLayout>
  );
}
