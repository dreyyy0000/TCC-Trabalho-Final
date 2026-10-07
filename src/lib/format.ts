export const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));

export const discountPercent = (price: number, sale: number | null) =>
  sale && sale < price ? Math.round((1 - sale / price) * 100) : 0;

export const finalPrice = (price: number, sale: number | null) => (sale && sale < price ? sale : price);

export const maskCpf = (cpf?: string | null) => {
  if (!cpf) return "—";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return "***";
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
};

export const isValidCpf = (input: string) => {
  const cpf = input.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
};

export const orderStatusLabel: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  PROCESSING: "Preparando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
};

export const paymentStatusLabel: Record<string, string> = {
  PENDING: "Aguardando",
  PAID: "Aprovado",
  FAILED: "Recusado",
  REFUNDED: "Estornado",
};

export const ADMIN_EMAIL = "andreyyllucas@gmail.com";

export const isAdminEmail = (email?: string | null) =>
  (email ?? "").trim().toLowerCase() === ADMIN_EMAIL;

export const MIN_AGE = 18;

export const ageFrom = (birthDate: string) => {
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return -1;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
};

export const isAdult = (birthDate?: string | null) =>
  Boolean(birthDate) && ageFrom(birthDate as string) >= MIN_AGE;
