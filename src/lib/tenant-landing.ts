import api from "@/lib/api";
import { getProductDetailUrl } from "@/lib/featured-products";

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

export function isBannerClickable(banner: TenantBanner): boolean {
  const value = banner.Clickable as unknown;
  return value === true || value === 1 || value === "true";
}

export function getBannerLink(banner: TenantBanner): string | null {
  if (!isBannerClickable(banner)) return null;

  if (banner.ProductId) {
    return getProductDetailUrl(banner.ProductId);
  }

  if (banner.CategoryId > 0) {
    return `/category/${banner.CategoryId}`;
  }

  return null;
}

export function getAllPlatformBanners(
  data: TenantBannersData | null | undefined,
): TenantBanner[] {
  const web = getActiveBanners(data?.WebPlateFormBanners);
  const mobile = getActiveBanners(data?.MobilePlateFormBanners);

  return [...web, ...mobile].sort(
    (a, b) =>
      Number(a.SortOrder) - Number(b.SortOrder) || a.BannerId - b.BannerId,
  );
}

export async function fetchTenantBannersData(): Promise<TenantBannersData | null> {
  try {
    const response = await api.get<TenantBannersResponse>(
      "/api/v1/TenantLanding/banners",
    );
    return response.data?.Data ?? null;
  } catch (error) {
    console.error("Failed to fetch tenant banners:", error);
    return null;
  }
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

export async function fetchTenantBanners(): Promise<TenantBanner[]> {
  const data = await fetchTenantBannersData();
  return getActiveBanners(data?.WebPlateFormBanners);
}

export async function subscribeNewsletter(email: string): Promise<string> {
  const response = await api.post<null>(
    "/api/v1/TenantLanding/subscribe",
    { Email: email.trim() },
  );

  return response.Message?.trim() || "Subscribed successfully.";
}
