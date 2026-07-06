import api from "@/lib/api";
import { ProductType } from "@/type/ProductType";
import {
  fetchFeaturedProducts,
  mapFeaturedProductToProductType,
} from "@/lib/featured-products";

export interface LandingPageProduct {
  ProductId: number;
  ProductDetailId?: number;
  ProductName: string;
  Description?: string;
  MinPrice?: number;
  MaxPrice?: number;
  ThumbnailImagePath?: string;
  IconImagePath?: string;
  LargeImagePath?: string;
  IsNewProduct?: boolean;
  IsPromotionalProduct?: boolean;
  Discount?: number;
  Category?: {
    CategoryId: number;
    CategoryName: string;
  };
}

export interface LandingPageCategoryGroup {
  Category?: {
    CategoryId: number;
    CategoryName: string;
    CategoryDescription?: string;
  };
  ProductList?: LandingPageProduct[];
}

interface LandingPageResponse {
  Data: LandingPageCategoryGroup[];
  Message: string;
  Type: string;
  HttpStatusCode: number;
}

interface CategoryProductResponse {
  Data: LandingPageProduct[] | LandingPageProduct;
  Message: string;
  Type: string;
  HttpStatusCode: number;
}

function getProductImage(product: LandingPageProduct): string {
  return (
    product.LargeImagePath ||
    product.ThumbnailImagePath ||
    product.IconImagePath ||
    "/images/product/1000x1000.png"
  );
}

export function mapLandingProductToProductType(
  product: LandingPageProduct,
  categoryName = "",
): ProductType {
  const image = getProductImage(product);
  const minPrice = product.MinPrice ?? 0;
  const maxPrice = product.MaxPrice ?? minPrice;

  return {
    id: String(product.ProductId),
    productDetailId: product.ProductDetailId,
    category: product.Category?.CategoryName || categoryName,
    type: "product",
    name: product.ProductName,
    gender: "",
    new: Boolean(product.IsNewProduct),
    sale:
      Boolean(product.IsPromotionalProduct) ||
      (product.Discount ?? 0) > 0 ||
      (maxPrice > 0 && minPrice < maxPrice),
    rate: 5,
    price: minPrice,
    originPrice: maxPrice > minPrice ? maxPrice : minPrice,
    brand: "",
    sold: 0,
    quantity: 100,
    quantityPurchase: 1,
    sizes: [],
    variation: [],
    thumbImage: [image],
    images: [image],
    description: product.Description || "",
    action: "add to cart",
    slug: String(product.ProductId),
  };
}

function normalizeProductList(
  data: LandingPageProduct[] | LandingPageProduct | null | undefined,
): LandingPageProduct[] {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
}

async function fetchFromLandingPage(
  categoryId: number,
): Promise<ProductType[]> {
  const res = await api.get<LandingPageResponse>("/api/v1/Product/landing-page");
  const products: ProductType[] = [];
  const seen = new Set<number>();

  for (const group of res.data?.Data ?? []) {
    for (const product of group.ProductList ?? []) {
      if (!product?.ProductId || seen.has(product.ProductId)) continue;

      const productCategoryId =
        product.Category?.CategoryId ?? group.Category?.CategoryId;

      if (productCategoryId !== categoryId) continue;

      seen.add(product.ProductId);
      products.push(
        mapLandingProductToProductType(
          product,
          group.Category?.CategoryName || product.Category?.CategoryName || "",
        ),
      );
    }
  }

  return products;
}

async function fetchFromFeatured(categoryId: number): Promise<ProductType[]> {
  const featured = await fetchFeaturedProducts();
  return featured
    .filter((product) => product.Category?.CategoryId === categoryId)
    .map(mapFeaturedProductToProductType);
}

async function fetchFromCategoryProductApi(
  categoryId: number,
): Promise<ProductType[]> {
  const res = await api.get<CategoryProductResponse>(
    "/api/v1/Product/current",
    {
      params: { CategoryId: categoryId },
    },
  );

  return normalizeProductList(res.data?.Data)
    .filter((product) => Boolean(product?.ProductId))
    .map((product) => mapLandingProductToProductType(product));
}

export async function fetchProductsByCategoryId(
  categoryId: number,
): Promise<ProductType[]> {
  const seen = new Set<string>();
  const merged: ProductType[] = [];

  const sources = [
    () => fetchFromLandingPage(categoryId),
    () => fetchFromCategoryProductApi(categoryId),
    () => fetchFromFeatured(categoryId),
  ];

  for (const load of sources) {
    try {
      const items = await load();
      for (const item of items) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        merged.push(item);
      }
    } catch {
      // Try next source
    }
  }

  return merged;
}


