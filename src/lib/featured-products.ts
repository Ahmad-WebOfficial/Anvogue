import api from "@/lib/api";
import { ProductType } from "@/type/ProductType";
import { RelatedProduct } from "@/lib/product-details";

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

export function getProductDetailUrl(
  productId: number | string,
  productDetailId?: number | string,
): string {
  const params = new URLSearchParams({ id: String(productId) });
  if (productDetailId) {
    params.set("detailId", String(productDetailId));
  }
  return `/product/default?${params.toString()}`;
}

export function mapProductDetailToProductType(
  detail: import("@/lib/product-details").ProductDetailData,
  selectedVariant?: import("@/lib/product-details").ProductVariantCombination,
): ProductType {
  const image =
    detail.ProductImages?.[0]?.LargeImagePath ||
    detail.ProductImages?.[0]?.OriginalImagePath ||
    selectedVariant?.ImageName ||
    "/images/product/1000x1000.png";

  const price = selectedVariant
    ? selectedVariant.DiscountedPrice > 0
      ? selectedVariant.DiscountedPrice
      : selectedVariant.Price
    : detail.MinPrice;

  return {
    id: String(detail.ProductId),
    productDetailId:
      selectedVariant?.ProductDetailId ?? detail.ProductDetailId,
    category: detail.Category || "",
    type: detail.Category || "product",
    name: detail.Name,
    gender: "",
    new: detail.IsPromotional,
    sale: detail.Discount > 0 || detail.IsPromotional,
    rate: detail.AverageRating || 5,
    price,
    originPrice: selectedVariant?.Price ?? detail.MaxPrice ?? price,
    brand: detail.BrandName || "",
    sold: 0,
    quantity: detail.InStock ? 100 : 0,
    quantityPurchase: 1,
    sizes:
      detail.ProductVariantDetail?.productVariantCombinationList?.map(
        (v) => v.VariantName,
      ) ?? [],
    variation: [],
    thumbImage: [image],
    images:
      detail.ProductImages?.map(
        (img) => img.LargeImagePath || img.OriginalImagePath || img.IconImagePath,
      ).filter(Boolean) ?? [image],
    description: detail.Description,
    action: "add to cart",
    slug: detail.Seo?.UrlSlug || String(detail.ProductId),
  };
}

export function mapRelatedProductToProductType(
  product: RelatedProduct,
): ProductType {
  const image =
    product.ThumbnailImagePath &&
    !product.ThumbnailImagePath.includes("noImage")
      ? product.ThumbnailImagePath
      : "/images/product/1000x1000.png";

  return {
    id: String(product.ProductId),
    category: product.Category?.CategoryName || "",
    type: "product",
    name: product.ProductName,
    gender: "",
    new: product.IsNewProduct,
    sale: product.IsPromotionalProduct,
    rate: 5,
    price: 0,
    originPrice: 0,
    brand: "",
    sold: 0,
    quantity: 100,
    quantityPurchase: 1,
    sizes: [],
    variation: [],
    thumbImage: [image],
    images: [image],
    description: product.Category?.CategoryDescription || "",
    action: "add to cart",
    slug: product.Seo?.UrlSlug || String(product.ProductId),
  };
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
