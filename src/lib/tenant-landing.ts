import api from "@/lib/api";

export interface TenantLandingSeo {
  MetaTitle: string;
  MetaDescription: string;
  UrlSlug: string;
  MetaKeywords: string;
}

export interface TenantLandingData {
  YoutubeEmbededLink: string;
  HeaderImageRequest: number;
  HeaderImagePath: string;
  FooterImageRequest: number;
  FooterImagePath: string;
  FaviconImageRequest: number;
  FaviconImagePath: string;
  Seo: TenantLandingSeo;
}

interface TenantLandingResponse {
  Data: TenantLandingData;
  Message: string;
  Type: string;
  HttpStatusCode: number;
}

export interface TenantBanner {
  BannerId: number;
  Name: string | null;
  ImageName: string;
  SortOrder: number;
  Status: number;
  PlateForm: number;
  Clickable: boolean;
  CategoryId: number;
  ImagePath: string;
  ProductId: number | null;
  TargetURL: number;
  BannerText: string | null;
  BannerSubText: string | null;
}

export interface TenantBannersData {
  WebPlateFormBanners: TenantBanner[];
  MobilePlateFormBanners: TenantBanner[];
}

interface TenantBannersResponse {
  Data: TenantBannersData;
  Message: string;
  Type: string;
  HttpStatusCode: number;
}

export function getActiveBanners(
  banners: TenantBanner[] | undefined,
): TenantBanner[] {
  return (banners ?? [])
    .filter(
      (banner) => Number(banner.Status) === 1 && Boolean(banner.ImagePath),
    )
    .sort((a, b) => Number(a.SortOrder) - Number(b.SortOrder));
}

export function getBannerLink(banner: TenantBanner): string | null {
  if (!banner.Clickable) return null;

  if (banner.ProductId) {
    return `/product/default?productId=${banner.ProductId}`;
  }

  if (banner.CategoryId > 0) {
    return `/category/${banner.CategoryId}`;
  }

  return null;
}

export function isLandingImageEnabled(flag: number | undefined): boolean {
  return flag === 1;
}

export function getYoutubeEmbedUrl(url: string): string {
  if (!url?.trim()) return "";

  const trimmed = url.trim();

  if (trimmed.includes("/embed/")) {
    return trimmed;
  }

  const watchMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([^&?/]+)/i,
  );

  if (watchMatch?.[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  const pathId = trimmed.replace(/\/$/, "").split("/").pop();
  if (pathId) {
    return `https://www.youtube.com/embed/${pathId}`;
  }

  return trimmed;
}

export async function fetchTenantLanding(): Promise<TenantLandingData | null> {
  try {
    const res = await api.get<TenantLandingResponse>(
      "/api/v1/TenantLanding/landingpage",
    );
    return res.data?.Data ?? null;
  } catch (error) {
    console.error("Failed to fetch tenant landing:", error);
    return null;
  }
}

export async function fetchTenantBanners(): Promise<TenantBanner[] | null> {
  try {
    const response = await api.get<TenantBannersResponse>(
      "/api/v1/TenantLanding/banners",
    );
    
    // Sirf Web Banners return karein
    const webBanners = response.data?.Data?.WebPlateFormBanners ?? [];
    console.log("Using Web Banners Only:", webBanners);
    
    return webBanners;
  } catch (error) {
    console.error("Failed to fetch tenant banners:", error);
    return null;
  }
}
