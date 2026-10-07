// Chave PIX da loja (telefone)
export const PIX_KEY = "+5511950910692";
export const PIX_KEY_DISPLAY = "11950910692";
export const PIX_MERCHANT_NAME = "NYX";
export const PIX_MERCHANT_CITY = "SAO PAULO";

const sanitize = (value: string, max: number) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toUpperCase()
    .slice(0, max);

const field = (id: string, value: string) => `${id}${String(value.length).padStart(2, "0")}${value}`;

const crc16 = (payload: string) => {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
};

/** Gera o BR Code (copia e cola) do PIX estático. */
export function buildPixPayload({ amount, reference }: { amount: number; reference?: string }) {
  const txid = sanitize(reference?.replace(/[^A-Za-z0-9]/g, "") ?? "", 25) || "***";
  const merchantAccount = field("00", "br.gov.bcb.pix") + field("01", PIX_KEY);
  const payload =
    field("00", "01") +
    field("26", merchantAccount) +
    field("52", "0000") +
    field("53", "986") +
    field("54", amount.toFixed(2)) +
    field("58", "BR") +
    field("59", sanitize(PIX_MERCHANT_NAME, 25)) +
    field("60", sanitize(PIX_MERCHANT_CITY, 15)) +
    field("62", field("05", txid)) +
    "6304";
  return payload + crc16(payload);
}
