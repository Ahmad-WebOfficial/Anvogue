"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";
import "swiper/css/bundle";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import SwiperCore from "swiper/core";
import Rate from "@/components/Other/Rate";
import { useCart } from "@/context/CartContext";
import { useModalCartContext } from "@/context/ModalCartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useModalWishlistContext } from "@/context/ModalWishlistContext";
import { useCompare } from "@/context/CompareContext";
import { useModalCompareContext } from "@/context/ModalCompareContext";
import {
  fetchProductDetails,
  getProductImages,
  getVariantPrice,
  ProductDetailData,
  ProductVariantCombination,
} from "@/lib/product-details";
import { mapProductDetailToProductType } from "@/lib/featured-products";
import { getApiErrorMessage } from "@/lib/api";

SwiperCore.use([Navigation, Thumbs]);

interface Props {
  productId: string;
  productDetailId?: string;
}

const ProductDetailApi: React.FC<Props> = ({ productId, productDetailId }) => {
  const [productDetail, setProductDetail] = useState<ProductDetailData | null>(
    null,
  );
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantCombination | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperCore | null>(null);

  const { addToCart } = useCart();
  const { openModalCart } = useModalCartContext();
  const { addToWishlist, removeFromWishlist, wishlistState } = useWishlist();
  const { openModalWishlist } = useModalWishlistContext();
  const { addToCompare, removeFromCompare, compareState } = useCompare();
  const { openModalCompare } = useModalCompareContext();

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const detail = await fetchProductDetails(
          Number(productId),
          productDetailId ? Number(productDetailId) : undefined,
        );

        setProductDetail(detail);

        const defaultVariant =
          detail.ProductVariantDetail?.productVariantCombinationList?.find(
            (variant) => variant.ProductDetailId === detail.ProductDetailId,
          ) ??
          detail.ProductVariantDetail?.productVariantCombinationList?.find(
            (variant) =>
              productDetailId &&
              variant.ProductDetailId === Number(productDetailId),
          ) ??
          detail.ProductVariantDetail?.productVariantCombinationList?.[0] ??
          null;

        setSelectedVariant(defaultVariant);
        setQuantity(1);
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to load product details."));
      } finally {
        setLoading(false);
      }
    };

    void loadProduct();
  }, [productId, productDetailId]);

  if (loading) {
    return (
      <div className="product-detail default md:py-20 py-10">
        <div className="container text-center">Loading product details...</div>
      </div>
    );
  }

  if (error || !productDetail) {
    return (
      <div className="product-detail default md:py-20 py-10">
        <div className="container text-center text-red-600">
          {error || "Product not found."}
        </div>
      </div>
    );
  }

  const images = getProductImages(productDetail);
  const variants =
    productDetail.ProductVariantDetail?.productVariantCombinationList ?? [];
  const activePrice = selectedVariant
    ? getVariantPrice(selectedVariant)
    : productDetail.MinPrice;
  const comparePrice = selectedVariant?.Price ?? productDetail.MaxPrice;
  const percentSale =
    comparePrice > activePrice
      ? Math.floor(100 - (activePrice / comparePrice) * 100)
      : 0;

  const handleAddToCart = async () => {
    const cartProduct = mapProductDetailToProductType(
      productDetail,
      selectedVariant ?? undefined,
    );
    cartProduct.quantityPurchase = quantity;

    try {
      await addToCart(cartProduct);
      openModalCart();
    } catch {
      // handled in context
    }
  };

  const handleWishlist = () => {
    const wishlistProduct = mapProductDetailToProductType(
      productDetail,
      selectedVariant ?? undefined,
    );

    if (wishlistState.wishlistArray.some((item) => item.id === wishlistProduct.id)) {
      removeFromWishlist(wishlistProduct.id);
    } else {
      addToWishlist(wishlistProduct);
    }
    openModalWishlist();
  };

  const handleCompare = () => {
    const compareProduct = mapProductDetailToProductType(
      productDetail,
      selectedVariant ?? undefined,
    );

    if (compareState.compareArray.length < 3) {
      if (compareState.compareArray.some((item) => item.id === compareProduct.id)) {
        removeFromCompare(compareProduct.id);
      } else {
        addToCompare(compareProduct);
      }
    } else {
      alert("Compare up to 3 products");
    }
    openModalCompare();
  };

  return (
    <div className="product-detail default">
      <div className="featured-product underwear md:py-20 py-10">
        <div className="container flex justify-between gap-y-6 flex-wrap">
          <div className="list-img md:w-1/2 md:pr-[45px] w-full">
            <Swiper
              slidesPerView={1}
              spaceBetween={0}
              thumbs={{ swiper: thumbsSwiper }}
              modules={[Thumbs]}
              className="mySwiper2 rounded-2xl overflow-hidden"
            >
              {images.map((item, index) => (
                <SwiperSlide key={`${item}-${index}`}>
                  <Image
                    src={item}
                    width={1000}
                    height={1000}
                    alt={productDetail.Name}
                    className="w-full aspect-[3/4] object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={12}
              slidesPerView={4}
              freeMode
              watchSlidesProgress
              modules={[Navigation, Thumbs]}
              className="mySwiper mt-4"
            >
              {images.map((item, index) => (
                <SwiperSlide key={`thumb-${item}-${index}`}>
                  <Image
                    src={item}
                    width={300}
                    height={300}
                    alt={productDetail.Name}
                    className="w-full aspect-[3/4] object-cover rounded-xl cursor-pointer"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="product-infor md:w-1/2 w-full lg:pl-[15px] md:pl-2">
            <div className="flex justify-between">
              <div>
                <div className="caption2 text-secondary font-semibold uppercase">
                  {productDetail.Category}
                </div>
                <div className="heading4 mt-1">{productDetail.Name}</div>
              </div>
              <button
                type="button"
                className={`add-wishlist-btn w-12 h-12 flex items-center justify-center border border-line cursor-pointer rounded-xl duration-300 hover:bg-black hover:text-white ${wishlistState.wishlistArray.some((item) => item.id === String(productDetail.ProductId)) ? "active bg-black text-white" : ""}`}
                onClick={handleWishlist}
              >
                <Icon.Heart
                  size={24}
                  weight={
                    wishlistState.wishlistArray.some(
                      (item) => item.id === String(productDetail.ProductId),
                    )
                      ? "fill"
                      : "regular"
                  }
                />
              </button>
            </div>

            <div className="flex items-center mt-3">
              <Rate currentRate={productDetail.AverageRating || 5} size={14} />
              <span className="caption1 text-secondary ml-2">
                ({productDetail.AverageRating || 5} rating)
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap mt-5 pb-6 border-b border-line">
              <div className="product-price heading5">Rs. {activePrice}</div>
              {comparePrice > activePrice && (
                <>
                  <div className="w-px h-4 bg-line"></div>
                  <div className="product-origin-price font-normal text-secondary2">
                    <del>Rs. {comparePrice}</del>
                  </div>
                  <div className="product-sale caption2 font-semibold bg-green px-3 py-0.5 inline-block rounded-full">
                    -{percentSale}%
                  </div>
                </>
              )}
            </div>

            <div className="desc text-secondary mt-4">{productDetail.Description}</div>

            {variants.length > 0 && (
              <div className="choose-variant mt-6">
                <div className="text-title">Available Variants</div>
                <div className="list-size flex items-center gap-2 flex-wrap mt-3">
                  {variants.map((variant) => (
                    <button
                      type="button"
                      key={variant.ProductDetailId}
                      className={`size-item px-4 py-2 flex items-center justify-center text-button rounded-full bg-white border border-line ${selectedVariant?.ProductDetailId === variant.ProductDetailId ? "active bg-black text-white" : ""} ${!variant.InStock ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={!variant.InStock}
                      onClick={() => setSelectedVariant(variant)}
                    >
                      {variant.VariantName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="text-title mt-5">Quantity:</div>
            <div className="choose-quantity flex items-center lg:justify-between gap-5 gap-y-3 mt-3">
              <div className="quantity-block md:p-3 max-md:py-1.5 max-md:px-3 flex items-center justify-between rounded-lg border border-line sm:w-[180px] w-[120px] flex-shrink-0">
                <Icon.Minus
                  size={20}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className={`${quantity === 1 ? "disabled" : ""} cursor-pointer`}
                />
                <div className="body1 font-semibold">{quantity}</div>
                <Icon.Plus
                  size={20}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="cursor-pointer"
                />
              </div>
              <button
                type="button"
                onClick={() => void handleAddToCart()}
                className="button-main w-full text-center bg-white text-black border border-black"
              >
                Add To Cart
              </button>
            </div>

            <div className="flex items-center lg:gap-20 gap-8 mt-5 pb-6 border-b border-line">
              <button
                type="button"
                className="compare flex items-center gap-3 cursor-pointer bg-transparent border-0"
                onClick={handleCompare}
              >
                <div className="compare-btn md:w-12 md:h-12 w-10 h-10 flex items-center justify-center border border-line rounded-xl duration-300 hover:bg-black hover:text-white">
                  <Icon.ArrowsCounterClockwise className="heading6" />
                </div>
                <span>Compare</span>
              </button>
            </div>

            <div className="more-infor mt-6">
              <div className="flex items-center gap-1 mt-3">
                <div className="text-title">SKU:</div>
                <div className="text-secondary">
                  {selectedVariant?.SKU || productDetail.DefaultSKU}
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <div className="text-title">Categories:</div>
                <div className="text-secondary">{productDetail.Category}</div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <div className="text-title">Brand:</div>
                <div className="text-secondary">
                  {productDetail.BrandName || "N/A"}
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <div className="text-title">Stock:</div>
                <div className="text-secondary">
                  {selectedVariant?.InStock ?? productDetail.InStock
                    ? "In Stock"
                    : "Out of Stock"}
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <div className="text-title">Price Range:</div>
                <div className="text-secondary">
                  Rs. {productDetail.MinPrice} - Rs. {productDetail.MaxPrice}
                </div>
              </div>
            </div>

            <div className="desc-tab mt-8">
              <div className="flex items-center gap-6 border-b border-line">
                <button
                  type="button"
                  className={`caption1 pb-3 ${activeTab === "description" ? "border-b-2 border-black font-semibold" : "text-secondary"}`}
                  onClick={() => setActiveTab("description")}
                >
                  Description
                </button>
                <button
                  type="button"
                  className={`caption1 pb-3 ${activeTab === "details" ? "border-b-2 border-black font-semibold" : "text-secondary"}`}
                  onClick={() => setActiveTab("details")}
                >
                  Details
                </button>
              </div>
              <div className="desc-block mt-4 text-secondary whitespace-pre-line">
                {activeTab === "description"
                  ? productDetail.LongDescription || productDetail.Description
                  : `Product ID: ${productDetail.ProductId}\nDetail ID: ${selectedVariant?.ProductDetailId ?? productDetail.ProductDetailId}\nCategory ID: ${productDetail.CategoryId}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailApi;
