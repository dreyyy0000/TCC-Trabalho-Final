import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { StoreLayout } from "@/components/store/StoreLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/esqueci-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha | NYX." },
      { name: "description", content: "Receba um link para redefinir a senha da sua conta NYX." },
      { property: "og:title", content: "Recuperar senha | NYX." },
      { property: "og:description", content: "Redefina a senha da sua conta." },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  return (
    <StoreLayout>
      <div className="container-street flex justify-center py-16">
        <form
          className="w-full max-w-md border border-border p-8"
          onSubmit={async (event) => {
            event.preventDefault();
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
              redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) toast.error(error.message);
            else toast.success("Enviamos um link de recuperação para seu e-mail.");
          }}
        >
          <h1 className="heading-xl text-3xl">Recuperar senha</h1>
          <div className="mt-8 space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" size="lg" className="mt-6 w-full tracking-widest">
            ENVIAR LINK
          </Button>
        </form>
      </div>
    </StoreLayout>
  );
}
