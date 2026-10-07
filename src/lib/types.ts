export type ProductImage = { id: string; url: string; alt: string | null; sort_order: number };
export type ProductVariant = {
  id: string;
  size: string | null;
  color: string | null;
  sku: string | null;
  stock: number;
};
export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};
export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  brand: string | null;
  price: number;
  sale_price: number | null;
  sku: string | null;
  stock: number;
  sizes: string[];
  colors: string[];
  rating: number;
  sold_count: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_active: boolean;
  created_at: string;
  categories?: { name: string; slug: string } | null;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
};

export type OrderStatus = "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type CartLine = {
  productId: string;
  variantId: string | null;
  slug: string;
  name: string;
  image: string | null;
  size: string | null;
  color: string | null;
  unitPrice: number;
  quantity: number;
  maxStock: number;
};
