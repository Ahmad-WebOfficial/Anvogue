import api from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { ProductType } from "@/type/ProductType";

export interface ApiCartItem {
  CartId?: number | string;
  CartItemId?: number | string;
  ProductId: number;
  ProductDetailId?: number;
  ProductName?: string;
  Name?: string;
  Quantity?: number;
  Price?: number;
  UnitPrice?: number;
  DiscountedPrice?: number;
  ThumbnailImagePath?: string;
  IconImagePath?: string;
  LargeImagePath?: string;
  VariantName?: string;
  SKU?: string;
}

export interface CartSummary {
  items: ApiCartItem[];
  subTotal: number;
  totalAmount: number;
  totalItems: number;
}

const SESSION_STORAGE_KEY = "cart_session_id";

export function getCartSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    sessionId = Array.from(
      { length: 32 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }

  return sessionId;
}

function extractCartItems(data: unknown): ApiCartItem[] {
  if (!data || typeof data !== "object") return [];

  const body = data as Record<string, unknown>;
  const nested =
    body.Data && typeof body.Data === "object"
      ? (body.Data as Record<string, unknown>)
      : null;

  const list =
    nested?.CartItemList ??
    nested?.CartItems ??
    body.CartItemList ??
    body.CartItems;

  return Array.isArray(list) ? (list as ApiCartItem[]) : [];
}

function extractCartSummary(data: unknown, items: ApiCartItem[]): CartSummary {
  const body = (data as Record<string, unknown>) ?? {};
  const nested =
    body.Data && typeof body.Data === "object"
      ? (body.Data as Record<string, unknown>)
      : null;

  const subTotal = Number(
    nested?.SubTotal ?? nested?.Subtotal ?? nested?.CartSubTotal ?? 0,
  );
  const totalAmount = Number(
    nested?.TotalAmount ?? nested?.GrandTotal ?? nested?.Total ?? subTotal,
  );

  const calculatedSubTotal = items.reduce((total, item) => {
    const price = item.Price ?? item.UnitPrice ?? 0;
    const qty = item.Quantity ?? 1;
    return total + price * qty;
  }, 0);

  return {
    items,
    subTotal: subTotal || calculatedSubTotal,
    totalAmount: totalAmount || calculatedSubTotal,
    totalItems: items.reduce((count, item) => count + (item.Quantity ?? 1), 0),
  };
}

export async function addProductToCart(
  productId: number,
  productDetailId: number,
  quantity: number,
): Promise<void> {
  await api.post("/api/v1/Cart/AddToCart/add-product", null, {
    params: {
      ProductId: productId,
      ProductDetailId: productDetailId,
      Quantity: quantity,
      SessionId: getCartSessionId(),
    },
  });
}

export async function fetchCurrentCart(): Promise<CartSummary> {
  if (isAuthenticated()) {
    const response = await api.get("/api/v1/Cart/GetCart/current");
    const items = extractCartItems(response.data);
    return extractCartSummary(response.data, items);
  }

  const sessionId = getCartSessionId();
  const response = await api.get(`/api/v1/Cart/GetCart/session/${sessionId}`);
  const items = extractCartItems(response.data);
  return extractCartSummary(response.data, items);
}

export function mapApiCartItemToProductType(item: ApiCartItem): ProductType {
  const image =
    item.ThumbnailImagePath ||
    item.IconImagePath ||
    item.LargeImagePath ||
    "/images/product/1000x1000.png";

  const price = item.Price ?? item.UnitPrice ?? 0;

  return {
    id: String(item.ProductId),
    productDetailId: item.ProductDetailId,
    category: "",
    type: "product",
    name: item.ProductName || item.Name || "Product",
    gender: "",
    new: false,
    sale: Boolean(item.DiscountedPrice && item.DiscountedPrice < price),
    rate: 5,
    price,
    originPrice: price,
    brand: "",
    sold: 0,
    quantity: item.Quantity ?? 1,
    quantityPurchase: item.Quantity ?? 1,
    sizes: item.VariantName ? [item.VariantName] : [],
    variation: [],
    thumbImage: [image],
    images: [image],
    description: item.VariantName || "",
    action: "add to cart",
    slug: String(item.ProductId),
  };
}

export function getCartItemId(item: ApiCartItem): string {
  return String(item.CartId ?? item.CartItemId ?? item.ProductId);
}

export function getCartItemImage(item: ApiCartItem): string {
  return (
    item.ThumbnailImagePath ||
    item.IconImagePath ||
    item.LargeImagePath ||
    "/images/product/1000x1000.png"
  );
}

export function getCartItemName(item: ApiCartItem): string {
  return item.ProductName || item.Name || "Product";
}

export function getCartItemPrice(item: ApiCartItem): number {
  return item.DiscountedPrice && item.DiscountedPrice > 0
    ? item.DiscountedPrice
    : item.Price ?? item.UnitPrice ?? 0;
}

export function getCartItemQuantity(item: ApiCartItem): number {
  return item.Quantity ?? 1;
}
