import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, LogOut, Menu, Search, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

const NAV: { label: string; to: string }[] = [
  { label: "SHOP", to: "/produtos" },
  { label: "ROUPAS", to: "/categoria/camisetas" },
  { label: "TÊNIS", to: "/categoria/tenis" },
  { label: "OFERTAS", to: "/ofertas" },
  { label: "NOVIDADES", to: "/novidades" },
];

export function SiteHeader() {
  const { count } = useCart();
  const { user, profile, isAdmin, signOut } = useAuth();
  const displayName =
    profile?.name?.trim() ||
    (user?.user_metadata?.["name"] as string | undefined) ||
    user?.email?.split("@")[0] ||
    "";
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    void navigate({ to: "/produtos", search: term ? { q: term } : {} });
    setOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    await navigate({ to: "/", replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="container-street flex h-16 items-center gap-4 md:h-20">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Abrir menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetTitle className="font-display text-2xl font-extrabold tracking-tight">NYX.</SheetTitle>
            <form onSubmit={submitSearch} className="mt-6 px-4">
              <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Buscar produtos" />
            </form>
            <nav className="mt-4 flex flex-col">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to as never}
                  onClick={() => setOpen(false)}
              className="border-b border-border px-4 py-4 text-sm font-semibold tracking-widest transition-colors hover:bg-accent hover:pl-6"
                >
                  {item.label}
                </Link>
              ))}
              <Link to="/favoritos" onClick={() => setOpen(false)} className="px-4 py-4 text-sm font-semibold tracking-widest">
                FAVORITOS
              </Link>
              <Link to="/minha-conta" onClick={() => setOpen(false)} className="px-4 py-4 text-sm font-semibold tracking-widest">
                MINHA CONTA
              </Link>
              {user ? (
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="border-t border-border px-4 py-4 text-left text-sm font-semibold tracking-widest text-muted-foreground hover:text-foreground"
                >
                  SAIR ({displayName})
                </button>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)} className="px-4 py-4 text-sm font-semibold tracking-widest">
                  ENTRAR
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="font-display text-2xl font-extrabold tracking-tighter md:text-3xl">
          NYX.
        </Link>

        <nav className="ml-8 hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to as never}
              className="group nav-link text-xs font-semibold tracking-[0.18em] text-muted-foreground hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
              <span className="nav-link-underline group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden max-w-xs flex-1 items-center lg:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar"
              aria-label="Buscar produtos"
              className="pl-9"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size={user ? "sm" : "icon"} aria-label="Minha conta" className="gap-2">
                <User className="size-5" />
                {user ? (
                  <span className="hidden max-w-32 truncate text-xs font-semibold sm:inline">{displayName}</span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {user ? (
                <>
                  <div className="px-2 py-2">
                    <p className="truncate text-sm font-semibold">{displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/minha-conta">Minha conta</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/minha-conta" search={{ tab: "pedidos" }}>Meus pedidos</Link>
                  </DropdownMenuItem>
                  {isAdmin ? (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">Painel administrativo</Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => void handleSignOut()}>
                    <LogOut className="mr-2 size-4" /> Sair e entrar em outra conta
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/login">Entrar</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/cadastro">Criar conta</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" asChild aria-label="Favoritos" className="hidden sm:inline-flex">
            <Link to="/favoritos">
              <Heart className="size-5" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild aria-label="Carrinho" className="relative">
            <Link to="/carrinho">
              <ShoppingBag className="size-5" />
              {count > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              ) : null}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
