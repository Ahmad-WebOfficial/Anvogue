import api from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { RelatedProduct } from "@/lib/product-details";
import { ProductType } from "@/type/ProductType";

export interface CartItemVariant {
  VariantGroupId: number;
  VariantId: number;
  VariantName: string;
  VariantGroup: string;
}

export interface ApiCartItem {
  CartId?: number | string;
  CartItemId?: number | string;
  CampaignId?: number;
  DiscountValueType?: number;
  Discount?: number;
  IsCampaignApplied?: boolean;
  ProductId: number;
  CategoryId?: number;
  ProductName?: string;
  Name?: string;
  ProductImage?: string;
  ThumbnailImagePath?: string;
  IconImagePath?: string;
  LargeImagePath?: string;
  Category?: {
    CategoryId: number;
    CategoryName: string;
    CategoryDescription: string;
  };
  relatedProductList?: RelatedProduct[];
  cartItemVariantList?: CartItemVariant[];
  Quantity?: number;
  Price?: number;
  UnitPrice?: number;
  DiscountedPrice?: number;
  TotalAmount?: number;
  IsPromotional?: boolean;
  ProductDetailId?: number;
  ProductVariants?: string;
  VariantName?: string;
  SKU?: string;
  IsProductAvailableInStock?: boolean;
  IsAvailableQuantity?: boolean;
  InventoryManagement?: boolean;
}

export interface CartSummary {
  items: ApiCartItem[];
  subTotal: number;
  totalDiscount: number;
  netTotal: number;
  totalAmount: number;
  totalItems: number;
  relatedProducts: RelatedProduct[];
  homeDeliveryEnable: boolean;
}

const SESSION_STORAGE_KEY = "cart_session_id";

export function getCartSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    sessionId = Array.from(
      { length: 48 },
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

export function collectRelatedProductsFromCart(
  items: ApiCartItem[],
): RelatedProduct[] {
  const seen = new Set<number>();
  const related: RelatedProduct[] = [];

  for (const item of items) {
    for (const product of item.relatedProductList ?? []) {
      if (!seen.has(product.ProductId)) {
        seen.add(product.ProductId);
        related.push(product);
      }
    }
  }

  return related;
}

function extractCartSummary(data: unknown, items: ApiCartItem[]): CartSummary {
  const body = (data as Record<string, unknown>) ?? {};
  const nested =
    body.Data && typeof body.Data === "object"
      ? (body.Data as Record<string, unknown>)
      : null;

  const calculatedSubTotal = items.reduce((total, item) => {
    return total + getCartItemLineTotal(item);
  }, 0);

  const subTotal = Number(nested?.TotalPrice ?? calculatedSubTotal);
  const totalDiscount = Number(nested?.TotalDiscount ?? 0);
  const netTotal = Number(nested?.NetTotal ?? subTotal - totalDiscount);

  return {
    items,
    subTotal,
    totalDiscount,
    netTotal,
    totalAmount: netTotal,
    totalItems: items.reduce((count, item) => count + (item.Quantity ?? 1), 0),
    relatedProducts: collectRelatedProductsFromCart(items),
    homeDeliveryEnable: Boolean(nested?.HomeDeliveryEnable),
  };
}

export async function addProductToCart(
  productId: number,
  productDetailId: number,
  quantity: number,
): Promise<void> {
  const params = {
    ProductId: productId,
    ProductDetailId: productDetailId,
    Quantity: quantity,
  };

  if (isAuthenticated()) {
    await api.post("/api/v1/Cart/AddToCart/add-product", null, { params });
    return;
  }

  const sessionId = getCartSessionId();
  await api.post(
    `/api/v1/Cart/AddToCartGuest/session/${sessionId}/add`,
    null,
    { params },
  );
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

export function formatRsPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

export function getCartItemId(item: ApiCartItem): string {
  return String(item.CartId ?? item.CartItemId ?? item.ProductId);
}

export function getCartItemImage(item: ApiCartItem): string {
  const image =
    item.ProductImage ||
    item.ThumbnailImagePath ||
    item.IconImagePath ||
    item.LargeImagePath;

  if (!image || image.includes("noImage")) {
    return "/images/product/1000x1000.png";
  }

  return image;
}

export function getCartItemName(item: ApiCartItem): string {
  return item.ProductName || item.Name || "Product";
}

export function getCartItemUnitPrice(item: ApiCartItem): number {
  if (item.DiscountedPrice && item.DiscountedPrice > 0) {
    return item.DiscountedPrice;
  }
  return item.Price ?? item.UnitPrice ?? 0;
}

export function getCartItemQuantity(item: ApiCartItem): number {
  return item.Quantity ?? 1;
}

export function getCartItemLineTotal(item: ApiCartItem, quantity?: number): number {
  const qty = quantity ?? getCartItemQuantity(item);
  if (item.TotalAmount && item.Quantity && quantity === undefined) {
    return item.TotalAmount;
  }
  return getCartItemUnitPrice(item) * qty;
}

export function getCartItemVariantsLabel(item: ApiCartItem): string {
  if (item.ProductVariants) {
    return item.ProductVariants.replace(/,/g, ", ");
  }

  if (item.cartItemVariantList?.length) {
    return item.cartItemVariantList
      .map((variant) => `${variant.VariantGroup}: ${variant.VariantName}`)
      .join(" · ");
  }

  return item.VariantName || "";
}

export function mapApiCartItemToProductType(item: ApiCartItem): ProductType {
  const image = getCartItemImage(item);
  const price = getCartItemUnitPrice(item);

  return {
    id: String(item.ProductId),
    productDetailId: item.ProductDetailId,
    category: item.Category?.CategoryName || "",
    type: "product",
    name: getCartItemName(item),
    gender: "",
    new: false,
    sale: Boolean(item.DiscountedPrice && item.DiscountedPrice < price),
    rate: 5,
    price,
    originPrice: item.Price ?? price,
    brand: "",
    sold: 0,
    quantity: getCartItemQuantity(item),
    quantityPurchase: getCartItemQuantity(item),
    sizes: item.ProductVariants ? [item.ProductVariants] : [],
    variation: [],
    thumbImage: [image],
    images: [image],
    description: item.Category?.CategoryDescription || getCartItemVariantsLabel(item),
    action: "add to cart",
    slug: String(item.ProductId),
  };
}
