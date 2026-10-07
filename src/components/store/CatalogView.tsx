import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ProductGrid } from "@/components/store/ProductCard";
import { listProducts, type ProductFilters } from "@/lib/catalog.functions";

const SIZES = ["P", "M", "G", "GG", "38", "39", "40", "41", "42", "43", "44", "Único"];
const COLORS = ["Preto", "Branco", "Off-White", "Cinza", "Grafite"];

type Props = {
  title: string;
  description?: string | undefined;
  base?: ProductFilters | undefined;
  initialQuery?: string | undefined;
  showSearch?: boolean | undefined;
};

export function CatalogView({ title, description, base = {}, initialQuery = "", showSearch = true }: Props) {
  const [q, setQ] = useState(initialQuery);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [inStock, setInStock] = useState(false);
  const [onlySale, setOnlySale] = useState(false);
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setQ(initialQuery);
    setPage(1);
  }, [initialQuery]);

  const filters: ProductFilters = {
    ...base,
    q: q || undefined,
    min: min ? Number(min) : undefined,
    max: max ? Number(max) : undefined,
    size: size || undefined,
    color: color || undefined,
    inStock: inStock || undefined,
    onlySale: onlySale || base.onlySale,
    sort,
    page,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => listProducts({ data: filters }),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1;

  const filtersPanel = (
    <div className="space-y-6">
      {showSearch ? (
        <div className="space-y-2">
          <Label htmlFor="q">Buscar</Label>
          <Input id="q" value={q} onChange={(event) => { setQ(event.target.value); setPage(1); }} placeholder="camiseta preta" />
        </div>
      ) : null}
      <div className="space-y-2">
        <Label>Preço</Label>
        <div className="flex gap-2">
          <Input inputMode="numeric" value={min} onChange={(e) => { setMin(e.target.value); setPage(1); }} placeholder="Mín" />
          <Input inputMode="numeric" value={max} onChange={(e) => { setMax(e.target.value); setPage(1); }} placeholder="Máx" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Tamanho</Label>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => { setSize(size === item ? "" : item); setPage(1); }}
              className={`border px-3 py-1.5 text-xs font-semibold transition-colors ${
                size === item ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Cor</Label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => { setColor(color === item ? "" : item); setPage(1); }}
              className={`border px-3 py-1.5 text-xs font-semibold transition-colors ${
                color === item ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={inStock} onCheckedChange={(value) => { setInStock(Boolean(value)); setPage(1); }} />
          Somente disponíveis
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={onlySale} onCheckedChange={(value) => { setOnlySale(Boolean(value)); setPage(1); }} />
          Somente promoções
        </label>
      </div>
    </div>
  );

  return (
    <div className="container-street py-10 md:py-16">
      <header className="mb-8">
        <h1 className="heading-xl text-3xl md:text-5xl">{title}</h1>
        {description ? <p className="mt-3 max-w-xl text-sm text-muted-foreground">{description}</p> : null}
      </header>

      <div className="mb-6 flex items-center justify-between gap-4">
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 size-4" /> Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetTitle className="px-4">Filtros</SheetTitle>
            <div className="p-4">{filtersPanel}</div>
          </SheetContent>
        </Sheet>
        <p className="hidden text-sm text-muted-foreground lg:block">{data?.total ?? 0} produtos</p>
        <Select value={sort} onValueChange={(value) => { setSort(value); setPage(1); }}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Mais recentes</SelectItem>
            <SelectItem value="bestseller">Mais vendidos</SelectItem>
            <SelectItem value="price_asc">Menor preço</SelectItem>
            <SelectItem value="price_desc">Maior preço</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">{filtersPanel}</aside>
        <div>
          {isError ? (
            <div className="border border-dashed border-destructive py-20 text-center text-sm text-destructive">
              Não foi possível carregar os produtos.
            </div>
          ) : (
            <ProductGrid products={data?.products ?? []} loading={isLoading} />
          )}

          {totalPages > 1 ? (
            <div className="mt-12 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Próxima
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
