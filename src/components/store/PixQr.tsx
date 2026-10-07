import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { brl } from "@/lib/format";
import { buildPixPayload, PIX_KEY_DISPLAY, PIX_MERCHANT_NAME } from "@/lib/pix";

export function PixQr({ amount, reference }: { amount: number; reference?: string }) {
  const code = buildPixPayload({ amount, ...(reference ? { reference } : {}) });
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void import("qrcode").then(async (mod) => {
      const url = await mod.default.toDataURL(code, { width: 360, margin: 1 });
      if (active) setQr(url);
    });
    return () => {
      active = false;
    };
  }, [code]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        {qr ? (
          <img src={qr} alt={`QR Code PIX de ${brl(amount)}`} className="size-44 bg-white p-2" />
        ) : (
          <div className="size-44 animate-pulse bg-secondary" />
        )}
        <div className="text-sm">
          <p className="font-bold">{brl(amount)}</p>
          <p className="mt-1 text-muted-foreground">Chave PIX (celular): {PIX_KEY_DISPLAY}</p>
          <p className="text-muted-foreground">Favorecido: {PIX_MERCHANT_NAME}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Escaneie o QR Code no app do seu banco ou use o PIX copia e cola abaixo.
          </p>
        </div>
      </div>
      <p className="break-all rounded bg-secondary p-3 text-xs">{code}</p>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          void navigator.clipboard.writeText(code);
          toast.success("Código PIX copiado");
        }}
      >
        <Copy className="mr-2 size-4" /> Copiar código PIX
      </Button>
    </div>
  );
}
