"use client";

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css/bundle";
import api from "@/lib/api";
const Brand = () => {
  const [brands, setBrands] = useState<any[]>([]);

  useEffect(() => {
    const getBrands = async () => {
      try {
        const response = await api.get("/api/v1/Common/brands");

        if (response.data && response.data.Data) {
          const filteredData = response.data.Data.filter(
            (item: any) => item.Value !== "",
          );
          setBrands(filteredData);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };
    getBrands();
  }, []);

  return (
    <div className="brand-block md:py-[60px] py-[32px]">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Our Top Brands
          </h2>
          <p className="text-gray-500">
            Explore the wide range of brands we feature
          </p>
        </div>

        <div className="list-brand">
          <Swiper
            spaceBetween={20}
            slidesPerView={2}
            loop={true}
            modules={[Autoplay]}
            autoplay={{ delay: 3000 }}
            breakpoints={{
              500: { slidesPerView: 3 },
              992: { slidesPerView: 5 },
              1200: { slidesPerView: 6 },
            }}
          >
            {brands.map((brand, index) => (
              <SwiperSlide key={index}>
                <div className="brand-item flex items-center justify-center p-4 border rounded-xl hover:border-blue-500 transition-all cursor-pointer">
                  <span className="font-bold text-gray-700">{brand.Text}</span>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default Brand;
