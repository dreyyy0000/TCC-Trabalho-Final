import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { StoreLayout } from "@/components/store/StoreLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail, isAdult, isValidCpf } from "@/lib/format";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta | NYX." },
      { name: "description", content: "Crie sua conta NYX. e acompanhe pedidos, favoritos e endereços." },
      { property: "og:title", content: "Criar conta | NYX." },
      { property: "og:description", content: "Crie sua conta na NYX." },
    ],
  }),
  component: SignUpPage,
});

const schema = z
  .object({
    name: z.string().trim().min(3, "Informe seu nome completo").max(120),
    email: z.string().trim().email("E-mail inválido").max(255),
    cpf: z.string().refine(isValidCpf, "CPF inválido"),
    birthDate: z.string().refine(isAdult, "É necessário ter 18 anos ou mais para comprar na NYX."),
    phone: z.string().trim().min(10, "Telefone inválido").max(20),
    password: z.string().min(8, "A senha deve ter ao menos 8 caracteres").max(72),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, { path: ["confirm"], message: "As senhas não conferem" });

function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", cpf: "", birthDate: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
      setErrors(fieldErrors);
      toast.error("Verifique os campos do formulário.");
      return;
    }
    setErrors({});
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          name: parsed.data.name,
          cpf: parsed.data.cpf.replace(/\D/g, ""),
          phone: parsed.data.phone,
          birth_date: parsed.data.birthDate,
        },
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message.includes("already") ? "Este e-mail já está cadastrado." : error.message);
      return;
    }
    if (!data.session) {
      toast.success("Conta criada! Confirme seu e-mail para entrar.");
      return;
    }
    toast.success("Conta criada com sucesso");
    void navigate({ to: isAdminEmail(parsed.data.email) ? "/admin" : "/minha-conta" });
  };

  return (
    <StoreLayout>
      <div className="container-street flex justify-center py-16">
        <div className="w-full max-w-md border border-border p-8">
          <h1 className="heading-xl text-3xl">Criar conta</h1>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <Field id="name" label="Nome completo" value={form.name} onChange={update("name")} error={errors["name"]} />
            <Field id="email" label="E-mail" type="email" value={form.email} onChange={update("email")} error={errors["email"]} />
            <Field id="cpf" label="CPF" value={form.cpf} onChange={update("cpf")} error={errors["cpf"]} placeholder="000.000.000-00" />
            <Field id="birthDate" label="Data de nascimento" type="date" value={form.birthDate} onChange={update("birthDate")} error={errors["birthDate"]} />
            <Field id="phone" label="Telefone" value={form.phone} onChange={update("phone")} error={errors["phone"]} placeholder="(11) 90000-0000" />
            <Field id="password" label="Senha" type="password" value={form.password} onChange={update("password")} error={errors["password"]} />
            <Field id="confirm" label="Confirmar senha" type="password" value={form.confirm} onChange={update("confirm")} error={errors["confirm"]} />
            <Button type="submit" size="lg" className="w-full tracking-widest" disabled={submitting}>
              {submitting ? "CRIANDO..." : "CRIAR CONTA"}
            </Button>
          </form>
          <p className="mt-6 text-xs text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/login" className="underline">Entrar</Link>. Ao criar sua conta você aceita nossos{" "}
            <Link to="/termos" className="underline">termos</Link> e a{" "}
            <Link to="/privacidade" className="underline">política de privacidade</Link>.
          </p>
        </div>
      </div>
    </StoreLayout>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | undefined;
  type?: string | undefined;
  placeholder?: string | undefined;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
