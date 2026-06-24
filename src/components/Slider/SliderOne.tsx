"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css/bundle";
import "swiper/css/effect-fade";
import {
  FeaturedProduct,
  fetchFeaturedProducts,
  getProductDetailUrl,
  getProductImage,
} from "@/lib/featured-products";

const SliderOne = () => {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchFeaturedProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="slider-block style-one bg-linear xl:h-[520px] lg:h-[480px] md:h-[400px] sm:h-[320px] h-[260px] w-full flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!products.length) {
    return null;
  }

  return (
    <div className="slider-block pt-[3rem] style-one bg-linear xl:h-[520px] lg:h-[480px] md:h-[400px] sm:h-[320px] h-[260px] w-full">
      <div className="slider-main h-full w-full">
        <Swiper
          spaceBetween={0}
          slidesPerView={1}
          loop={products.length > 1}
          pagination={{ clickable: true }}
          modules={[Pagination, Autoplay]}
          className="h-full relative"
          autoplay={{
            delay: 4000,
          }}
        >
          {products.map((product) => (
            <SwiperSlide key={product.ProductId}>
              <div className="slider-item h-full w-full relative px-[0.8rem]">
                <div className="container w-full h-full flex items-center relative gap-4">
                  <div className="text-content basis-1/2 z-10">
                    <div className="text-display md:text-2xl text-lg font-semibold line-clamp-1 md:mt-2 mt-1">
                      {product.ProductName}
                    </div>
                    <div className="text-price md:text-xl text-base font-medium md:mt-2 mt-1">
                      Rs. {product.Price}
                    </div>
                    <Link
                      href={getProductDetailUrl(
                        product.ProductId,
                        product.ProductDetailId,
                      )}
                      className="button-main md:mt-4 mt-2 inline-block"
                    >
                      Shop Now
                    </Link>
                  </div>
                  <div className="sub-img absolute sm:w-2/5 w-2/5 right-0 top-0 h-full flex items-center justify-end overflow-hidden">
                    <Image
                      src={getProductImage(product)}
                      width={400}
                      height={400}
                      alt={product.ProductName}
                      className="object-contain max-h-full w-auto"
                      priority
                    />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default SliderOne;
