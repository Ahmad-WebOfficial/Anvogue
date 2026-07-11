"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useModalCartContext } from "@/context/ModalCartContext";
import { useCart } from "@/context/CartContext";
import { countdownTime } from "@/store/countdownTime";
import CountdownTimeType from "@/type/CountdownType";
import api from "@/lib/api";
import toaster from "react-hot-toast";
import { formatRsPrice } from "@/lib/cart";
import { fetchProductDetails } from "@/lib/product-details";
import {
  getProductDetailUrl,
  mapProductDetailToProductType,
} from "@/lib/featured-products";
import { RelatedProduct } from "@/lib/product-details";

const ModalCart = ({
  serverTimeLeft,
}: {
  serverTimeLeft: CountdownTimeType;
}) => {
  const [timeLeft, setTimeLeft] = useState(serverTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(countdownTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [activeTab, setActiveTab] = useState<string | undefined>("");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [addingRelatedId, setAddingRelatedId] = useState<number | null>(null);

  const { isModalOpen, closeModalCart } = useModalCartContext();
  const {
    cartState,
    cartLoading,
    addToCart,
    removeFromCart,
    updateCart,
    fetchCart,
  } = useCart();

  useEffect(() => {
    if (isModalOpen) {
      void fetchCart();
    }
  }, [isModalOpen, fetchCart]);

  const handleAddRelatedToCart = async (related: RelatedProduct) => {
    setAddingRelatedId(related.ProductId);
    try {
      const detail = await fetchProductDetails(related.ProductId);
      const cartProduct = mapProductDetailToProductType(detail);
      cartProduct.quantityPurchase = 1;
      await addToCart(cartProduct);
    } catch {
      // toast handled in context
    } finally {
      setAddingRelatedId(null);
    }
  };

  const getCountries = async () => {
    try {
      const res = await api.get("/api/v1/Common/countries");
      if (res.data?.Data) {
        setCountries(res.data.Data);
      } else {
        setCountries([]);
      }
    } catch (error) {
      console.error("Failed to fetch countries:", error);
    }
  };

  const getStates = async (countryId: string) => {
    try {
      const res = await api.get(`/api/v1/Common/states`, {
        params: { CountryId: countryId },
      });
      if (res.data?.Data) {
        setStates(res.data.Data);
      } else {
        setStates([]);
      }
    } catch (error) {
      console.error("Failed to fetch states:", error);
    }
  };

  useEffect(() => {
    void getCountries();
  }, []);

  const moneyForFreeship = 150;
  const displayTotal = cartState.netTotal || cartState.subTotal || 0;
  const relatedProducts = cartState.relatedProducts ?? [];

  return (
    <>
      <div className="modal-cart-block" onClick={closeModalCart}>
        <div
          className={`modal-cart-main flex ${isModalOpen ? "open" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* You May Also Like — from API relatedProductList */}
          <div className="left w-1/2 border-r border-line py-6 max-md:hidden flex flex-col">
            <div className="heading5 px-6 pb-3">You May Also Like</div>
            <div className="list px-6 flex-1 overflow-y-auto">
              {relatedProducts.length > 0 ? (
                relatedProducts.map((related) => {
                  const image =
                    related.ThumbnailImagePath &&
                    !related.ThumbnailImagePath.includes("noImage")
                      ? related.ThumbnailImagePath
                      : "/images/product/1000x1000.png";

                  return (
                    <div
                      key={related.ProductId}
                      className="item py-5 flex items-start justify-between gap-3 border-b border-line"
                    >
                      <div className="infor flex items-start gap-4 min-w-0">
                        <Link
                          href={getProductDetailUrl(related.ProductId)}
                          className="bg-img w-[100px] h-[120px] flex-shrink-0 rounded-lg overflow-hidden relative"
                          onClick={closeModalCart}
                        >
                          <Image
                            src={image}
                            fill
                            sizes="100px"
                            alt={related.ProductName}
                            className="object-cover"
                          />
                        </Link>
                        <div className="min-w-0">
                          <div className="caption2 text-secondary uppercase">
                            {related.Category?.CategoryName}
                          </div>
                          <Link
                            href={getProductDetailUrl(related.ProductId)}
                            className="name text-button mt-1 line-clamp-2 hover:underline"
                            onClick={closeModalCart}
                          >
                            {related.ProductName}
                          </Link>
                          {related.Category?.CategoryDescription && (
                            <p className="caption1 text-secondary mt-2 line-clamp-2">
                              {related.Category.CategoryDescription}
                            </p>
                          )}
                          {related.IsNewProduct && (
                            <span className="caption2 text-green mt-1 inline-block">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label={`Add ${related.ProductName} to cart`}
                        disabled={addingRelatedId === related.ProductId}
                        className="text-xl bg-white w-10 h-10 rounded-xl border border-black flex items-center justify-center duration-300 cursor-pointer hover:bg-black hover:text-white flex-shrink-0 disabled:opacity-50"
                        onClick={() => void handleAddRelatedToCart(related)}
                      >
                        <Icon.Handbag />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-secondary caption1">
                  Add items to see related products
                </div>
              )}
            </div>
          </div>

          {/* Cart items */}
          <div className="right cart-block md:w-1/2 w-full py-6 relative overflow-hidden">
            <div className="heading px-6 pb-3 flex items-center justify-between relative">
              <div className="heading5">
                Shopping Cart
                {cartState.totalItems > 0 && (
                  <span className="caption1 text-secondary ml-2">
                    ({cartState.totalItems} items)
                  </span>
                )}
              </div>
              <button
                type="button"
                aria-label="Close cart"
                className="close-btn absolute right-6 top-0 w-6 h-6 rounded-full bg-surface flex items-center justify-center duration-300 cursor-pointer hover:bg-black hover:text-white"
                onClick={closeModalCart}
              >
                <Icon.X size={14} />
              </button>
            </div>

            <div className="time px-6">
              <div className="flex items-center gap-3 px-5 py-3 bg-green rounded-lg">
                <p className="text-3xl">🔥</p>
                <div className="caption1">
                  Your cart will expire in{" "}
                  <span className="text-red caption1 font-semibold">
                    {timeLeft.minutes}:
                    {timeLeft.seconds < 10
                      ? `0${timeLeft.seconds}`
                      : timeLeft.seconds}
                  </span>{" "}
                  minutes!
                </div>
              </div>
            </div>

            <div className="heading banner mt-3 px-6">
              <div className="text caption1">
                Buy{" "}
                <span className="text-button font-semibold">
                  {formatRsPrice(
                    Math.max(moneyForFreeship - displayTotal, 0),
                  )}
                </span>{" "}
                more to get <span className="text-button font-semibold">free shipping</span>
              </div>
              <div className="tow-bar-block mt-3">
                <div
                  className="progress-line"
                  style={{
                    width:
                      displayTotal <= moneyForFreeship
                        ? `${Math.min((displayTotal / moneyForFreeship) * 100, 100)}%`
                        : "100%",
                  }}
                />
              </div>
            </div>

            <div className="list-product px-6">
              {cartLoading ? (
                <div className="text-center py-8 text-secondary">
                  Loading cart...
                </div>
              ) : cartState.cartArray.length > 0 ? (
                cartState.cartArray.map((product, index) => {
                  const image =
                    product.thumbImage?.[0] ||
                    product.images?.[0] ||
                    "/images/product/1000x1000.png";
                  const variantsLabel = product.apiItem
                    ? product.apiItem.ProductVariants?.replace(/,/g, ", ") ||
                      product.apiItem.cartItemVariantList
                        ?.map(
                          (v) => `${v.VariantGroup}: ${v.VariantName}`,
                        )
                        .join(" · ")
                    : "";

                  return (
                    <div
                      key={product.cartId || `${product.id}-${index}`}
                      className="item py-5 flex items-start justify-between gap-3 border-b border-line"
                    >
                      <div className="infor flex items-start gap-3 w-full min-w-0">
                        <Link
                          href={getProductDetailUrl(
                            product.id,
                            product.productDetailId,
                          )}
                          className="w-[100px] h-[120px] flex-shrink-0 rounded-lg overflow-hidden bg-surface relative"
                          onClick={closeModalCart}
                        >
                          <Image
                            src={image}
                            fill
                            sizes="100px"
                            alt={product.name}
                            className="object-cover"
                          />
                        </Link>

                        <div className="w-full min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              {product.category && (
                                <div className="caption2 text-secondary uppercase">
                                  {product.category}
                                </div>
                              )}
                              <Link
                                href={getProductDetailUrl(
                                  product.id,
                                  product.productDetailId,
                                )}
                                className="name text-button line-clamp-2 hover:underline"
                                onClick={closeModalCart}
                              >
                                {product.name}
                              </Link>
                            </div>
                            <button
                              type="button"
                              className="remove-cart-btn caption1 font-semibold text-red underline cursor-pointer flex-shrink-0"
                              onClick={() => removeFromCart(product.cartId)}
                            >
                              Remove
                            </button>
                          </div>

                          {variantsLabel && (
                            <div className="caption1 text-secondary mt-2">
                              Variant: {variantsLabel}
                            </div>
                          )}

                          {product.apiItem?.ProductDetailId && (
                            <div className="caption2 text-secondary mt-1">
                              Detail ID: {product.apiItem.ProductDetailId}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                            <div className="flex items-center gap-3 border border-line rounded-lg px-3 py-1">
                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                className="text-lg font-bold disabled:opacity-30"
                                disabled={product.quantity <= 1}
                                onClick={() =>
                                  updateCart(
                                    product.cartId,
                                    product.quantity - 1,
                                    product.selectedSize,
                                    product.selectedColor,
                                  )
                                }
                              >
                                -
                              </button>
                              <span className="text-secondary2 w-8 text-center">
                                {product.quantity}
                              </span>
                              <button
                                type="button"
                                aria-label="Increase quantity"
                                className="text-lg font-bold"
                                onClick={() =>
                                  updateCart(
                                    product.cartId,
                                    product.quantity + 1,
                                    product.selectedSize,
                                    product.selectedColor,
                                  )
                                }
                              >
                                +
                              </button>
                            </div>

                            <div className="text-right">
                              <div className="product-price text-title font-semibold">
                                {formatRsPrice(product.lineTotal)}
                              </div>
                              {product.quantity > 1 && (
                                <div className="caption2 text-secondary mt-0.5">
                                  {formatRsPrice(product.price)} each
                                </div>
                              )}
                            </div>
                          </div>

                          {product.apiItem?.IsProductAvailableInStock ===
                            false && (
                            <div className="caption2 text-red mt-2">
                              Limited stock
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-secondary">
                  Your cart is empty
                </div>
              )}
            </div>

            <div className="footer-modal bg-white absolute bottom-0 left-0 w-full">
              <div className="flex items-center justify-center lg:gap-14 gap-8 px-6 py-4 border-b border-line">
                <button
                  type="button"
                  className="item flex items-center gap-3 cursor-pointer bg-transparent border-0"
                  onClick={() => setActiveTab("shipping")}
                >
                  <Icon.Truck className="text-xl" />
                  <span className="caption1">Shipping</span>
                </button>
                <button
                  type="button"
                  className="item flex items-center gap-3 cursor-pointer bg-transparent border-0"
                  onClick={() => setActiveTab("coupon")}
                >
                  <Icon.Tag className="text-xl" />
                  <span className="caption1">Coupon</span>
                </button>
              </div>

              <div className="px-6 pt-4 space-y-2">
                <div className="flex items-center justify-between caption1">
                  <span className="text-secondary">Subtotal</span>
                  <span>{formatRsPrice(cartState.subTotal)}</span>
                </div>
                {cartState.totalDiscount > 0 && (
                  <div className="flex items-center justify-between caption1">
                    <span className="text-secondary">Discount</span>
                    <span className="text-green">
                      -{formatRsPrice(cartState.totalDiscount)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between heading5 pt-2 border-t border-line">
                  <span>Total</span>
                  <span>{formatRsPrice(displayTotal)}</span>
                </div>
              </div>

              <div className="block-button text-center p-6">
                <div className="flex items-center gap-4">
                  <Link
                    href="/cart"
                    className="button-main basis-1/2 bg-white border border-black text-black text-center uppercase"
                    onClick={closeModalCart}
                  >
                    View cart
                  </Link>
                  <Link
                    href="/checkout"
                    className="button-main basis-1/2 text-center uppercase"
                    onClick={closeModalCart}
                  >
                    Check Out
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={closeModalCart}
                  className="text-button-uppercase mt-4 text-center has-line-before cursor-pointer inline-block bg-transparent border-0"
                >
                  Or continue shopping
                </button>
              </div>

              <div
                className={`tab-item note-block ${activeTab === "shipping" ? "active" : ""}`}
              >
                <div className="px-6 py-4 border-b border-line">
                  <div className="item flex items-center gap-3">
                    <Icon.Truck className="text-xl" />
                    <div className="caption1">Estimate shipping rates</div>
                  </div>
                </div>
                <div className="form pt-4 px-6">
                  <div>
                    <label htmlFor="select-country" className="caption1 text-secondary">
                      Country/Region
                    </label>
                    <div className="select-block relative mt-2">
                      <select
                        id="select-country"
                        className="w-full py-3 pl-5 rounded-xl bg-white border border-line"
                        value={selectedCountry}
                        onChange={(e) => {
                          setSelectedCountry(e.target.value);
                          void getStates(e.target.value);
                        }}
                      >
                        <option value="">Select Country</option>
                        {countries.map((country: { Value: string; Text: string }) => (
                          <option key={country.Value} value={country.Value}>
                            {country.Text}
                          </option>
                        ))}
                      </select>
                      <Icon.CaretDown
                        size={12}
                        className="absolute top-1/2 -translate-y-1/2 md:right-5 right-2 pointer-events-none"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label htmlFor="select-state" className="caption1 text-secondary">
                      State
                    </label>
                    <div className="select-block relative mt-2">
                      <select
                        id="select-state"
                        className="w-full py-3 pl-5 rounded-xl bg-white border border-line"
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                      >
                        <option value="">Select State</option>
                        {states.map((state: { Value: string; Text: string }) => (
                          <option key={state.Value} value={state.Value}>
                            {state.Text}
                          </option>
                        ))}
                      </select>
                      <Icon.CaretDown
                        size={12}
                        className="absolute top-1/2 -translate-y-1/2 md:right-5 right-2 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="block-button  text-center pt-4 px-6 pb-6">
                  <button
                    type="button"
                    className="button-main bg-black w-full text-center"
                    onClick={() => setActiveTab("")}
                  >
                    Done
                  </button>
                </div>
              </div>

              <div
                className={`tab-item note-block ${activeTab === "coupon" ? "active" : ""}`}
              >
                <div className="px-6 py-4 border-b border-line">
                  <div className="item flex items-center gap-3">
                    <Icon.Tag className="text-xl" />
                    <div className="caption1">Add A Coupon Code</div>
                  </div>
                </div>
                <div className="form pt-4 px-6">
                  <label htmlFor="select-discount" className="caption1 text-secondary">
                    Enter Code
                  </label>
                  <input
                    className="border-line px-5 py-3 w-full rounded-xl mt-3 border"
                    id="select-discount"
                    type="text"
                    placeholder="Discount code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                </div>
                <div className="block-button text-center pt-4 px-6 pb-6">
                  <button
                    type="button"
                    className="button-main bg-black w-full text-center"
                    onClick={() => {
                      if (!promoCode) {
                        toaster.error("Please enter a coupon code!");
                        return;
                      }
                      toaster.success("Coupon feature coming soon");
                      setActiveTab("");
                    }}
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPromoCode("");
                      setActiveTab("");
                    }}
                    className="text-button-uppercase mt-4 text-center has-line-before cursor-pointer inline-block bg-transparent border-0"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalCart;
