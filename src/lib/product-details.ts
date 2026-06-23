import api from "@/lib/api";
import { fetchFeaturedProducts } from "@/lib/featured-products";

export interface ProductVariantCombination {
  ProductDetailId: number;
  VariantId: number;
  VariantGroupId: number;
  VariantName: string;
  Price: number;
  DiscountedPrice: number;
  SKU: string;
  ProductVariantCombinationId: number;
  ProductId: number;
  IsPromotional: boolean;
  IsCampaignApplied: boolean;
  Discount: number;
  DiscountType: number;
  SortOrder: number;
  InStock: boolean;
  ImageName: string;
  TotalStock: number;
  AvailableStock: number | null;
  InventoryManagement: boolean;
}

export interface ProductImage {
  ProductImageId: number;
  ImageName: string;
  IconImagePath: string;
  LargeImagePath: string;
  OriginalImagePath: string;
  IsDefault: boolean;
  SortOrder: number;
}

export interface ProductVariantGroup {
  VariantGroupId: number;
  VariantGroupName: string;
  ProductDetails: unknown[];
}

export interface ProductDetailData {
  ProductId: number;
  ProductDetailId: number;
  Name: string;
  Description: string;
  LongDescription: string;
  UnitShortName: string | null;
  ProductVariantDetail: {
    productVariantCombinationList: ProductVariantCombination[];
  };
  RelatedProductIds: number[];
  relatedProductList: unknown[];
  ProductImages: ProductImage[];
  WishItemList: unknown[];
  InStock: boolean;
  Category: string;
  CategoryId: number;
  ProductImageCount: number;
  DiscountValueType: number;
  Discount: number;
  IsCampaignApplied: boolean;
  IsPromotional: boolean;
  IsCustomProduct: boolean;
  Status: number;
  ProductVariantGroups: ProductVariantGroup[];
  MinPrice: number;
  MaxPrice: number;
  noImage: string | null;
  AverageRating: number;
  EnableSubmitRatingReviews: boolean;
  EnableRatingReviewsFromSettings: boolean;
  Tags: string;
  BrandId: number;
  BrandName: string | null;
  DefaultSKU: string;
  IsAvaliableForSelectedLocation: boolean;
  InventoryManagement: boolean;
  SizeChartImageUrl: string | null;
  Seo: {
    MetaTitle: string | null;
    MetaDescription: string | null;
    UrlSlug: string | null;
    MetaKeywords: string | null;
  };
  TenantInventoryManagementFlag: boolean;
  ComingSoon: boolean;
}

interface ProductDetailResponse {
  Data: ProductDetailData;
  Message: string;
  Type: string;
  HttpStatusCode: number;
}

type LandingPageProduct = {
  ProductId: number;
  ProductDetailId?: number;
};

export function getProductImages(detail: ProductDetailData): string[] {
  const galleryImages = (detail.ProductImages ?? [])
    .map((image) => image.LargeImagePath || image.OriginalImagePath || image.IconImagePath)
    .filter(Boolean);

  if (galleryImages.length > 0) {
    return galleryImages;
  }

  const variantImage =
    detail.ProductVariantDetail?.productVariantCombinationList?.[0]?.ImageName;

  if (variantImage) {
    return [variantImage];
  }

  return ["/images/product/1000x1000.png"];
}

export function getVariantPrice(variant: ProductVariantCombination): number {
  return variant.DiscountedPrice > 0 ? variant.DiscountedPrice : variant.Price;
}

export async function resolveProductDetailId(
  productId: number,
  preferredDetailId?: number,
): Promise<number> {
  if (preferredDetailId && preferredDetailId > 0) {
    return preferredDetailId;
  }

  try {
    const landingRes = await api.get("/api/v1/Product/landing-page");
    for (const category of landingRes.data?.Data ?? []) {
      const product = (category.ProductList as LandingPageProduct[] | undefined)?.find(
        (item) => item.ProductId === productId,
      );
      if (product?.ProductDetailId && product.ProductDetailId > 0) {
        return product.ProductDetailId;
      }
    }
  } catch {
    // Continue to featured fallback
  }

  try {
    const featuredProducts = await fetchFeaturedProducts();
    const featuredProduct = featuredProducts.find(
      (item) => item.ProductId === productId,
    ) as LandingPageProduct | undefined;

    if (featuredProduct?.ProductDetailId && featuredProduct.ProductDetailId > 0) {
      return featuredProduct.ProductDetailId;
    }
  } catch {
    // Continue to details fallback
  }

  try {
    const response = await api.get<ProductDetailResponse>(
      "/api/v1/Product/details",
      {
        params: {
          ProductId: productId,
          ProductDetailId: 0,
        },
      },
    );

    const detail = response.data?.Data;
    const firstVariant =
      detail?.ProductVariantDetail?.productVariantCombinationList?.[0];

    if (firstVariant?.ProductDetailId) {
      return firstVariant.ProductDetailId;
    }

    if (detail?.ProductDetailId) {
      return detail.ProductDetailId;
    }
  } catch {
    // Final fallback failed
  }

  throw new Error("Unable to resolve product detail id.");
}

export async function fetchProductDetails(
  productId: number,
  productDetailId?: number,
): Promise<ProductDetailData> {
  const resolvedDetailId = await resolveProductDetailId(productId, productDetailId);

  const response = await api.get<ProductDetailResponse>(
    "/api/v1/Product/details",
    {
      params: {
        ProductId: productId,
        ProductDetailId: resolvedDetailId,
      },
    },
  );

  if (!response.data?.Data) {
    throw new Error("Product details not found.");
  }

  return response.data.Data;
}
