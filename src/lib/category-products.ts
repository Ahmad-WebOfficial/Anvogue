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
  MinDiscountedPrice?: number;
  MaxDiscountedPrice?: number;
  ThumbnailImagePath?: string;
  IconImagePath?: string;
  LargeImagePath?: string;
  IsNewProduct?: boolean;
  IsFeaturedProduct?: boolean;
  IsProductInStock?: boolean;
  IsPromotionalProduct?: boolean;
  IsCampaignApplied?: boolean;
  Discount?: number;
  DiscountValueType?: number;
  Category?: {
    CategoryId: number;
    CategoryName: string;
  };
}

export type HomeProductTab = "best sellers" | "on sale" | "new arrivals";

interface ByCategoryResponse {
  Data?: {
    productListViewModel?: LandingPageProduct[];
    ProductListViewModel?: LandingPageProduct[];
    TotalRecords?: number;
  };
  Message: string;
  Type: string;
  HttpStatusCode: number;
}

function getBrandId(): number {
  const brandId = Number(process.env.NEXT_PUBLIC_BRAND_ID?.trim());
  return Number.isFinite(brandId) && brandId > 0 ? brandId : 1;
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

function getProductImage(product: LandingPageProduct): string {
  return (
    product.LargeImagePath ||
    product.ThumbnailImagePath ||
    product.IconImagePath ||
    "/images/product/1000x1000.png"
  );
}

export interface ResolvedProductPricing {
  price: number;
  originPrice: number;
  hasDiscount: boolean;
  discountPercent: number;
}

export function resolveLandingProductPricing(
  product: LandingPageProduct,
): ResolvedProductPricing {
  const basePrice = product.MinPrice ?? 0;
  const minDiscounted = product.MinDiscountedPrice ?? 0;
  const discountValue = product.Discount ?? 0;
  const discountValueType = product.DiscountValueType ?? 0;

  let price = basePrice;
  let originPrice = basePrice;

  // API sends MinDiscountedPrice when a real discount exists.
  if (minDiscounted > 0 && basePrice > 0 && minDiscounted < basePrice) {
    price = minDiscounted;
    originPrice = basePrice;
  } else if (minDiscounted > 0 && basePrice <= 0) {
    price = minDiscounted;
    originPrice = product.MaxPrice ?? minDiscounted;
  } else if (discountValue > 0 && basePrice > 0) {
    originPrice = basePrice;
    price =
      discountValueType === 1
        ? Math.max(0, basePrice - discountValue)
        : Math.round(basePrice * (1 - discountValue / 100));

    if (price <= 0 || price >= originPrice) {
      price = basePrice;
      originPrice = basePrice;
    }
  }

  const hasDiscount = originPrice > price && price > 0 && originPrice > 0;
  const discountPercent = hasDiscount
    ? Math.round(((originPrice - price) / originPrice) * 100)
    : 0;

  return { price, originPrice, hasDiscount, discountPercent };
}

export function mapLandingProductToProductType(
  product: LandingPageProduct,
  categoryName = "",
): ProductType {
  const image = getProductImage(product);
  const pricing = resolveLandingProductPricing(product);

  return {
    id: String(product.ProductId),
    productDetailId: product.ProductDetailId,
    category: product.Category?.CategoryName || categoryName,
    type: "product",
    name: product.ProductName,
    gender: "",
    new: Boolean(product.IsNewProduct),
    sale: pricing.hasDiscount,
    rate: 5,
    price: pricing.price,
    originPrice: pricing.originPrice,
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

function extractProductListFromByCategory(
  data: ByCategoryResponse["Data"] | LandingPageProduct[] | LandingPageProduct | null | undefined,
): LandingPageProduct[] {
  if (!data) return [];

  if (Array.isArray(data)) {
    return normalizeProductList(data);
  }

  return normalizeProductList(
    data.productListViewModel ?? data.ProductListViewModel ?? [],
  );
}

export async function fetchProductsByBrand(
  pageNumber = 1,
  pageSize = 50,
): Promise<LandingPageProduct[]> {
  const res = await api.get<ByCategoryResponse>("/api/v1/Product/by-category", {
    params: {
      BrandId: getBrandId(),
      PageNumber: pageNumber,
      PageSize: pageSize,
      SortBy: "name",
    },
  });

  return extractProductListFromByCategory(res.data?.Data).filter((product) =>
    Boolean(product?.ProductId),
  );
}

export function filterProductsForHomeTab(
  products: LandingPageProduct[],
  tab: HomeProductTab,
): LandingPageProduct[] {
  switch (tab) {
    case "best sellers":
      return products.filter((product) => product.IsFeaturedProduct);
    case "new arrivals":
      return products.filter((product) => product.IsNewProduct);
    case "on sale": {
      const remaining = products.filter(
        (product) => !product.IsNewProduct && !product.IsFeaturedProduct,
      );

      if (remaining.length > 0) {
        return remaining;
      }

      // Agar sab products new/featured hon, to jo featured nahi wo on sale me
      return products.filter((product) => !product.IsFeaturedProduct);
    }
    default:
      return products;
  }
}

export async function fetchHomeTabProducts(
  tab: HomeProductTab,
  pageSize = 50,
): Promise<ProductType[]> {
  const products = await fetchProductsByBrand(1, pageSize);
  return filterProductsForHomeTab(products, tab).map((product) =>
    mapLandingProductToProductType(product),
  );
}

async function fetchFromCategoryProductApi(
  categoryId: number,
): Promise<ProductType[]> {
  const res = await api.get<ByCategoryResponse>("/api/v1/Product/by-category", {
    params: {
      CategoryId: categoryId,
      BrandId: getBrandId(),
      PageNumber: 1,
      PageSize: 50,
      SortBy: "name",
    },
  });

  return extractProductListFromByCategory(res.data?.Data)
    .filter((product) => Boolean(product?.ProductId))
    .map((product) => mapLandingProductToProductType(product));
}

export async function fetchAllLandingProducts(): Promise<ProductType[]> {
  const res = await api.get<LandingPageResponse>("/api/v1/Product/landing-page");
  const products: ProductType[] = [];
  const seen = new Set<number>();

  for (const group of res.data?.Data ?? []) {
    const categoryName =
      group.Category?.CategoryName || "";

    for (const product of group.ProductList ?? []) {
      if (!product?.ProductId || seen.has(product.ProductId)) continue;

      seen.add(product.ProductId);
      products.push(
        mapLandingProductToProductType(
          product,
          product.Category?.CategoryName || categoryName,
        ),
      );
    }
  }

  return products;
}

export function filterProductsByQuery(
  products: ProductType[],
  query: string,
): ProductType[] {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return products;

  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(keyword) ||
      product.category.toLowerCase().includes(keyword) ||
      product.description.toLowerCase().includes(keyword),
  );
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


