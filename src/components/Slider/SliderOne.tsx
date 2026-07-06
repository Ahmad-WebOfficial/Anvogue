"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css/bundle";
import "swiper/css/effect-fade";
import api from "@/lib/api";
import {
  getActiveBanners,
  getBannerLink,
  TenantBanner,
} from "@/lib/tenant-landing";

const BannerSlide = ({ banner }: { banner: TenantBanner }) => {
  const href = getBannerLink(banner);
  const slide = (
    <div className="slider-item relative h-full w-full overflow-hidden">
      <Image
        src={banner.ImagePath}
        alt={banner.BannerText || banner.Name || "Banner"}
        fill
        unoptimized
        priority
        className="object-cover"
      />
      {(banner.BannerText || banner.BannerSubText) && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/20 px-4 text-center">
          {banner.BannerText && (
            <div className="text-display md:text-3xl text-xl font-semibold text-white">
              {banner.BannerText}
            </div>
          )}
          {banner.BannerSubText && (
            <div className="text-button mt-2 text-white">
              {banner.BannerSubText}
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full w-full">
        {slide}
      </Link>
    );
  }

  return slide;
};

const SliderOne = () => {
 
  const [banners, setBanners] = useState<TenantBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await api.get("/api/v1/TenantLanding/banners");
        const data = res.data?.Data;

        if (data?.WebPlateFormBanners) {
          // Sirf Web Banners ka istemal karein
          const web = getActiveBanners(data.WebPlateFormBanners);
          setBanners(web);
        }
      } catch (error) {
        console.error("Failed to fetch banners:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchBanners();
  }, []);

  if (loading) {
    return (
      <div className="slider-block pt-[3rem] style-one bg-linear xl:h-[520px] lg:h-[480px] md:h-[400px] sm:h-[320px] h-[260px] w-full flex items-center justify-center">
        <p>Loading banners...</p>
      </div>
    );
  }

  if (!banners.length) return null;
  return (
    <div className="slider-block pt-[3rem] style-one bg-linear xl:h-[520px] lg:h-[480px] md:h-[400px] sm:h-[320px] h-[260px] w-full">
    <div className="slider-main h-full w-full">
      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        loop={banners.length > 1}
        pagination={{ clickable: true }}
        modules={[Pagination, Autoplay]}
        className="h-full relative"
        autoplay={{ delay: 4000 }}
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.BannerId} className="h-full">
            <BannerSlide banner={banner} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  </div>
);
};

export default SliderOne;
