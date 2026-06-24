"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useModalQuickviewContext } from "@/context/ModalQuickviewContext";
import Image from "next/image";
import {
  FeaturedProduct,
  fetchFeaturedProducts,
  getProductDetailUrl,
  getProductImage,
  mapFeaturedProductToProductType,
} from "@/lib/featured-products";

const ModalNewsletter = () => {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { openQuickview } = useModalQuickviewContext();

  const featuredProduct = products[0];

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

  useEffect(() => {
    if (loading || !products.length) return;

    const timer = window.setTimeout(() => {
      setOpen(true);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [loading, products.length]);

  const handleDetailProduct = (productId: number) => {
    setOpen(false);
    router.push(
      getProductDetailUrl(productId, featuredProduct?.ProductDetailId),
    );
  };

  if (!loading && !products.length) {
    return null;
  }

  return (
    <div className="modal-newsletter" onClick={() => setOpen(false)}>
      <div className="container h-full flex items-center justify-center w-full">
        <div
          className={`modal-newsletter-main ${open ? "open" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="main-content flex rounded-[20px] overflow-hidden w-full">
            <div className="left lg:w-1/2 sm:w-2/5 max-sm:hidden bg-green flex flex-col items-center justify-center gap-5 py-14 px-6">
              {featuredProduct ? (
                <>
                  <div className="text-xs font-semibold uppercase text-center">
                    Featured Product
                  </div>
                  <div className="lg:text-[42px] text-3xl lg:leading-[48px] leading-[36px] font-bold uppercase text-center line-clamp-2">
                    {featuredProduct.ProductName}
                  </div>
                  <div className="text-button-uppercase text-center">
                    Starting from{" "}
                    <span className="text-red">Rs. {featuredProduct.Price}</span>
                  </div>
                  <div className="w-[180px] h-[180px] relative">
                    <Image
                      src={getProductImage(featuredProduct)}
                      alt={featuredProduct.ProductName}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <Link
                    href={getProductDetailUrl(
                      featuredProduct.ProductId,
                      featuredProduct.ProductDetailId,
                    )}
                    className="button-main w-fit bg-black text-white hover:bg-white uppercase"
                    onClick={() => setOpen(false)}
                  >
                    Shop Now
                  </Link>
                </>
              ) : (
                <p className="text-button-uppercase">Loading featured products...</p>
              )}
            </div>
            <div className="right lg:w-1/2 sm:w-3/5 w-full bg-white sm:pt-10 sm:pl-10 max-sm:p-6 relative">
              <div
                className="close-newsletter-btn w-10 h-10 flex items-center justify-center border border-line rounded-full absolute right-5 top-5 cursor-pointer"
                onClick={() => setOpen(false)}
              >
                <Icon.X weight="bold" className="text-xl" />
              </div>
              <div className="heading5 pb-5">You May Also Like</div>

              <div className="list flex flex-col gap-5 overflow-x-auto sm:pr-6">
                {loading ? (
                  <p className="text-secondary">Loading products...</p>
                ) : (
                  products.slice(0, 5).map((product) => (
                    <div
                      className="product-item item pb-5 flex items-center justify-between gap-3 border-b border-line"
                      key={product.ProductId}
                    >
                      <div
                        className="infor flex items-center gap-5 cursor-pointer"
                        onClick={() => handleDetailProduct(product.ProductId)}
                      >
                        <div className="bg-img flex-shrink-0 relative w-[100px] h-[100px]">
                          <Image
                            fill
                            src={getProductImage(product)}
                            alt={product.ProductName}
                            className="aspect-square flex-shrink-0 rounded-lg object-cover"
                          />
                        </div>
                        <div>
                          <div className="name text-button line-clamp-2">
                            {product.ProductName}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="product-price text-title">
                              Rs. {product.Price}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        className="quick-view-btn button-main sm:py-3 py-2 sm:px-5 px-4 bg-black hover:bg-green text-white rounded-full whitespace-nowrap"
                        onClick={() =>
                          openQuickview(mapFeaturedProductToProductType(product))
                        }
                      >
                        QUICK VIEW
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalNewsletter;
