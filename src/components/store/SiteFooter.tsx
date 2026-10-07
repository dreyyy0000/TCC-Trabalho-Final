import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MessageCircle } from "lucide-react";

const creators = [
  { name: "Andrey Lucas", initials: "AL", role: "Fundador" },
  { name: "Miguel Carneiro", initials: "MC", role: "Desenvolvimento" },
  { name: "Gabriel Faquinetti", initials: "GF", role: "Design" },
  { name: "Kauan de Jesus", initials: "KJ", role: "Marketing" },
  { name: "Davi Ramos", initials: "DR", role: "Operações" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="container-street grid gap-10 py-16 md:grid-cols-4">
        <div>
          <p className="font-display text-3xl font-extrabold tracking-tighter">NYX.</p>
          <p className="mt-4 max-w-xs text-sm text-primary-foreground/70">
            Peças selecionadas para quem cria o próprio estilo. Streetwear premium, produzido em lotes limitados.
          </p>
        </div>
        <div>
          <p className="eyebrow text-primary-foreground/60">Institucional</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/sobre" className="hover:underline">Sobre nós</Link></li>
            <li><Link to="/contato" className="hover:underline">Contato</Link></li>
            <li><Link to="/privacidade" className="hover:underline">Política de privacidade</Link></li>
            <li><Link to="/termos" className="hover:underline">Termos de uso</Link></li>
            <li><Link to="/trocas" className="hover:underline">Trocas e devoluções</Link></li>
            <li><Link to="/cookies" className="hover:underline">Política de cookies</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow text-primary-foreground/60">Atendimento</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2"><MessageCircle className="size-4" /> WhatsApp: (11) 90000-0000</li>
            <li className="flex items-center gap-2"><Mail className="size-4" /> contato@nyx.com.br</li>
            <li className="flex items-center gap-2"><Instagram className="size-4" /> @nyx</li>
          </ul>
        </div>
        <div>
          <p className="eyebrow text-primary-foreground/60">Formas de pagamento</p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold">
            {["PIX", "VISA", "MASTER", "ELO", "AMEX", "BOLETO"].map((brand) => (
              <span key={brand} className="rounded border border-primary-foreground/25 px-2 py-1">
                {brand}
              </span>
            ))}
          </div>
          <p className="mt-6 text-xs text-primary-foreground/60">Compra 100% segura · Envio para todo o Brasil</p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15 py-8">
        <div className="container-street space-y-6 text-xs text-primary-foreground/60">
          <p>© {new Date().getFullYear()} NYX. Todos os direitos reservados. CNPJ 00.000.000/0001-00</p>
          <div>
            <p className="eyebrow text-primary-foreground/50">Criadores do site</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {creators.map((c) => (
                <div
                  key={c.name}
                  className="group flex items-center gap-3 rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-3 transition-colors hover:border-primary-foreground/40"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/10 text-[11px] font-bold tracking-wide text-primary-foreground group-hover:bg-primary-foreground/20">
                    {c.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-primary-foreground">{c.name}</span>
                    <span className="block text-[10px] uppercase tracking-wider text-primary-foreground/50">{c.role}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
