"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useModalQuickviewContext } from "@/context/ModalQuickviewContext";
import { useCart } from "@/context/CartContext";
import { useModalCartContext } from "@/context/ModalCartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useModalWishlistContext } from "@/context/ModalWishlistContext";
import { useCompare } from "@/context/CompareContext";
import { useModalCompareContext } from "@/context/ModalCompareContext";
import Rate from "../Other/Rate";
import ModalSizeguide from "./ModalSizeguide";
import {
  fetchProductDetails,
  getProductImages,
  getVariantPrice,
  ProductDetailData,
  ProductVariantCombination,
} from "@/lib/product-details";
import { getProductDetailUrl } from "@/lib/featured-products";
import { getApiErrorMessage } from "@/lib/api";

const ModalQuickview = () => {
  const [productQty, setProductQty] = useState(1);
  const [openSizeGuide, setOpenSizeGuide] = useState(false);
  const [productDetail, setProductDetail] = useState<ProductDetailData | null>(
    null,
  );
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantCombination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { selectedProduct, closeQuickview } = useModalQuickviewContext();
  const { addToCart } = useCart();
  const { openModalCart } = useModalCartContext();
  const { addToWishlist, removeFromWishlist, wishlistState } = useWishlist();
  const { openModalWishlist } = useModalWishlistContext();
  const { addToCompare, removeFromCompare, compareState } = useCompare();
  const { openModalCompare } = useModalCompareContext();

  const variants =
    productDetail?.ProductVariantDetail?.productVariantCombinationList ?? [];
  const images = productDetail ? getProductImages(productDetail) : [];
  const activePrice =
    selectedVariant != null
      ? getVariantPrice(selectedVariant)
      : productDetail?.MinPrice ?? 0;
  const comparePrice =
    selectedVariant != null &&
    selectedVariant.DiscountedPrice > 0 &&
    selectedVariant.DiscountedPrice < selectedVariant.Price
      ? selectedVariant.Price
      : productDetail?.MaxPrice ?? activePrice;
  const percentSale =
    comparePrice > activePrice
      ? Math.floor(100 - (activePrice / comparePrice) * 100)
      : 0;
  const productId = selectedProduct?.id ?? productDetail?.ProductId?.toString();

  useEffect(() => {
    if (!selectedProduct) {
      setProductDetail(null);
      setSelectedVariant(null);
      setError("");
      return;
    }

    const loadProductDetails = async () => {
      setLoading(true);
      setError("");
      setProductQty(1);

      try {
        const detail = await fetchProductDetails(
          Number(selectedProduct.id),
          selectedProduct.productDetailId
            ? Number(selectedProduct.productDetailId)
            : undefined,
        );

        setProductDetail(detail);
        const defaultVariant =
          detail.ProductVariantDetail?.productVariantCombinationList?.find(
            (variant) => variant.ProductDetailId === detail.ProductDetailId,
          ) ??
          detail.ProductVariantDetail?.productVariantCombinationList?.[0] ??
          null;
        setSelectedVariant(defaultVariant);
      } catch (err) {
        setProductDetail(null);
        setSelectedVariant(null);
        setError(
          getApiErrorMessage(err, "Failed to load product details."),
        );
      } finally {
        setLoading(false);
      }
    };

    void loadProductDetails();
  }, [selectedProduct]);

  const handleIncreaseQuantity = () => {
    setProductQty((prev) => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    if (productQty > 1) {
      setProductQty((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedProduct || !productDetail) return;

    const cartProduct = {
      ...selectedProduct,
      id: String(productDetail.ProductId),
      productDetailId: selectedVariant?.ProductDetailId ?? productDetail.ProductDetailId,
      name: productDetail.Name,
      price: activePrice,
      originPrice: comparePrice,
      description: productDetail.Description,
      images,
      thumbImage: images.slice(0, 1),
      quantityPurchase: productQty,
    };

    try {
      await addToCart(cartProduct);
      openModalCart();
      closeQuickview();
    } catch {
      // Error toast is handled in CartContext
    }
  };

  const handleAddToWishlist = () => {
    if (!selectedProduct || !productDetail) return;

    const wishlistProduct = {
      ...selectedProduct,
      id: String(productDetail.ProductId),
      productDetailId: selectedVariant?.ProductDetailId ?? productDetail.ProductDetailId,
      name: productDetail.Name,
      price: activePrice,
      originPrice: comparePrice,
      description: productDetail.Description,
      images,
      thumbImage: images.slice(0, 1),
    };

    if (
      wishlistState.wishlistArray.some(
        (item) => item.id === wishlistProduct.id,
      )
    ) {
      removeFromWishlist(wishlistProduct.id);
    } else {
      addToWishlist(wishlistProduct);
    }

    openModalWishlist();
  };

  const handleAddToCompare = () => {
    if (!selectedProduct || !productDetail) return;

    const compareProduct = {
      ...selectedProduct,
      id: String(productDetail.ProductId),
      name: productDetail.Name,
      price: activePrice,
      originPrice: comparePrice,
      description: productDetail.Description,
      images,
      thumbImage: images.slice(0, 1),
    };

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
    <>
      <div className={`modal-quickview-block`} onClick={closeQuickview}>
        <div
          className={`modal-quickview-main py-6 ${selectedProduct !== null ? "open" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center min-h-[420px] px-6">
              <p className="text-secondary">Loading product details...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center min-h-[420px] px-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button className="button-main" onClick={closeQuickview}>
                Close
              </button>
            </div>
          ) : productDetail ? (
            <div className="flex h-full max-md:flex-col-reverse gap-y-6">
              <div className="left lg:w-[388px] md:w-[300px] flex-shrink-0 px-6">
                <div className="list-img max-md:flex items-center gap-4">
                  {images.map((item, index) => (
                    <div
                      className="bg-img w-full aspect-[3/4] max-md:w-[150px] max-md:flex-shrink-0 rounded-[20px] overflow-hidden md:mt-6"
                      key={`${item}-${index}`}
                    >
                      <Image
                        src={item}
                        width={1500}
                        height={2000}
                        alt={productDetail.Name}
                        priority={index === 0}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="right w-full px-4">
                <div className="heading pb-6 px-4 flex items-center justify-between relative">
                  <div className="heading5">Quick View</div>
                  <div
                    className="close-btn absolute right-0 top-0 w-6 h-6 rounded-full bg-surface flex items-center justify-center duration-300 cursor-pointer hover:bg-black hover:text-white"
                    onClick={closeQuickview}
                  >
                    <Icon.X size={14} />
                  </div>
                </div>

                <div className="product-infor px-4">
                  <div className="flex justify-between">
                    <div>
                      <div className="caption2 text-secondary font-semibold uppercase">
                        {productDetail.Category}
                      </div>
                      <div className="heading4 mt-1">{productDetail.Name}</div>
                    </div>
                    <div
                      className={`add-wishlist-btn w-10 h-10 flex items-center justify-center border border-line cursor-pointer rounded-lg duration-300 flex-shrink-0 hover:bg-black hover:text-white ${wishlistState.wishlistArray.some((item) => item.id === productId) ? "active" : ""}`}
                      onClick={handleAddToWishlist}
                    >
                      {wishlistState.wishlistArray.some(
                        (item) => item.id === productId,
                      ) ? (
                        <Icon.Heart size={20} weight="fill" className="text-red" />
                      ) : (
                        <Icon.Heart size={20} />
                      )}
                    </div>
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

                  <div className="desc text-secondary mt-4">
                    {productDetail.Description}
                  </div>

                  {productDetail.LongDescription && (
                    <div className="desc text-secondary mt-3">
                      {productDetail.LongDescription}
                    </div>
                  )}

                  <div className="list-action mt-6">
                    {variants.length > 0 && (
                      <div className="choose-variant">
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
                    <div className="choose-quantity flex items-center max-xl:flex-wrap lg:justify-between gap-5 mt-3">
                      <div className="quantity-block md:p-3 max-md:py-1.5 max-md:px-3 flex items-center justify-between rounded-lg border border-line sm:w-[180px] w-[120px] flex-shrink-0">
                        <Icon.Minus
                          onClick={handleDecreaseQuantity}
                          className={`${productQty === 1 ? "disabled" : ""} cursor-pointer body1`}
                        />
                        <div className="body1 font-semibold">{productQty}</div>
                        <Icon.Plus
                          onClick={handleIncreaseQuantity}
                          className="cursor-pointer body1"
                        />
                      </div>
                      <div
                        onClick={handleAddToCart}
                        className="button-main w-full text-center bg-white text-black border border-black cursor-pointer"
                      >
                        Add To Cart
                      </div>
                    </div>

                    <div className="button-block mt-5">
                      <Link
                        href={getProductDetailUrl(productDetail.ProductId)}
                        className="button-main w-full text-center inline-block"
                        onClick={closeQuickview}
                      >
                        View Full Details
                      </Link>
                    </div>

                    <div className="flex items-center flex-wrap lg:gap-20 gap-8 gap-y-4 mt-5">
                      <div
                        className="compare flex items-center gap-3 cursor-pointer"
                        onClick={handleAddToCompare}
                      >
                        <div className="compare-btn md:w-12 md:h-12 w-10 h-10 flex items-center justify-center border border-line cursor-pointer rounded-xl duration-300 hover:bg-black hover:text-white">
                          <Icon.ArrowsCounterClockwise className="heading6" />
                        </div>
                        <span>Compare</span>
                      </div>
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
                        <div className="text-title">Stock:</div>
                        <div className="text-secondary">
                          {selectedVariant?.InStock ?? productDetail.InStock
                            ? "In Stock"
                            : "Out of Stock"}
                        </div>
                      </div>
                      {productDetail.BrandName && (
                        <div className="flex items-center gap-1 mt-3">
                          <div className="text-title">Brand:</div>
                          <div className="text-secondary">
                            {productDetail.BrandName}
                          </div>
                        </div>
                      )}
                      {productDetail.Tags && (
                        <div className="flex items-center gap-1 mt-3">
                          <div className="text-title">Tags:</div>
                          <div className="text-secondary">{productDetail.Tags}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <ModalSizeguide
        data={selectedProduct}
        isOpen={openSizeGuide}
        onClose={() => setOpenSizeGuide(false)}
      />
    </>
  );
};

export default ModalQuickview;
