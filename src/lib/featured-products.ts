import api from "@/lib/api";
import { ProductType } from "@/type/ProductType";

export interface FeaturedProductCategory {
  CategoryId: number;
  CategoryName: string;
  CategoryDescription: string;
}

export interface FeaturedProductSeo {
  MetaTitle: string | null;
  MetaDescription: string | null;
  UrlSlug: string | null;
  MetaKeywords: string | null;
}

export interface FeaturedProduct {
  ProductId: number;
  ProductName: string;
  Description: string;
  Price: number;
  IconImagePath: string;
  LargeImagePath: string;
  ThumbnailImagePath: string;
  IsFeaturedProduct: boolean;
  IsNewProduct: boolean;
  IsProductInStock: boolean;
  IsPromotionalProduct: boolean;
  ProductDetailId?: number;
  Category: FeaturedProductCategory;
  Seo: FeaturedProductSeo;
  Tags: string;
}

interface FeaturedProductResponse {
  Data: FeaturedProduct[];
  Message: string;
  Type: string;
  HttpStatusCode: number;
}

export function getProductImage(product: FeaturedProduct): string {
  return (
    product.LargeImagePath ||
    product.ThumbnailImagePath ||
    product.IconImagePath ||
    "/images/product/1000x1000.png"
  );
}

export function getProductDetailUrl(productId: number | string): string {
  return `/product/default?id=${productId}`;
}

export function mapFeaturedProductToProductType(
  product: FeaturedProduct,
): ProductType {
  const image = getProductImage(product);

  return {
    id: String(product.ProductId),
    productDetailId: product.ProductDetailId,
    category: product.Category?.CategoryName || "",
    type: "product",
    name: product.ProductName,
    gender: "",
    new: product.IsNewProduct,
    sale: product.IsPromotionalProduct,
    rate: 5,
    price: product.Price,
    originPrice: product.Price,
    brand: "",
    sold: 0,
    quantity: product.IsProductInStock ? 100 : 0,
    quantityPurchase: 1,
    sizes: [],
    variation: [],
    thumbImage: [image],
    images: [image],
    description: product.Description,
    action: "add to cart",
    slug: product.Seo?.UrlSlug || String(product.ProductId),
  };
}

export async function fetchFeaturedProducts(): Promise<FeaturedProduct[]> {
  const res = await api.get<FeaturedProductResponse>(
    "/api/v1/Product/featured",
    {
      params: {
        IsNew: true,
        IsFeatured: true,
      },
    },
  );

  return res.data?.Data ?? [];
}
