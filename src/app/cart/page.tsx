"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useCart } from "@/context/CartContext";
import { countdownTime } from "@/store/countdownTime";
import { formatRsPrice } from "@/lib/cart";
import { fetchProductDetails, RelatedProduct } from "@/lib/product-details";
import {
  getProductDetailUrl,
  mapProductDetailToProductType,
} from "@/lib/featured-products";

const Cart = () => {
  const [timeLeft, setTimeLeft] = useState(countdownTime());
  const [shipCart, setShipCart] = useState(0);
  const [addingRelatedId, setAddingRelatedId] = useState<number | null>(null);
  const router = useRouter();

  const {
    cartState,
    cartLoading,
    updateCart,
    removeFromCart,
    fetchCart,
    addToCart,
  } = useCart();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(countdownTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  const moneyForFreeship = 150;
  const subTotal = cartState.subTotal || 0;
  const netTotal = cartState.netTotal || subTotal;
  const totalDiscount = cartState.totalDiscount || 0;
  const relatedProducts = cartState.relatedProducts ?? [];
  const freeShippingRemaining = Math.max(moneyForFreeship - subTotal, 0);
  const qualifiesForFreeShipping = subTotal >= moneyForFreeship;
  const orderTotal = netTotal + (qualifiesForFreeShipping ? 0 : shipCart);

  useEffect(() => {
    if (qualifiesForFreeShipping) {
      setShipCart(0);
    } else if (cartState.cartArray.length === 0) {
      setShipCart(0);
    } else if (shipCart === 0) {
      setShipCart(30);
    }
  }, [qualifiesForFreeShipping, cartState.cartArray.length, shipCart]);

  const handleQuantityChange = (cartId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const item = cartState.cartArray.find((i) => i.cartId === cartId);
    if (item) {
      updateCart(
        cartId,
        newQuantity,
        item.selectedSize,
        item.selectedColor,
      );
    }
  };

  const handleAddRelatedToCart = async (related: RelatedProduct) => {
    setAddingRelatedId(related.ProductId);
    try {
      const detail = await fetchProductDetails(related.ProductId);
      const cartProduct = mapProductDetailToProductType(detail);
      cartProduct.quantityPurchase = 1;
      await addToCart(cartProduct);
    } catch {
      // toast in context
    } finally {
      setAddingRelatedId(null);
    }
  };

  const redirectToCheckout = () => {
    router.push(
      `/checkout?discount=${totalDiscount}&ship=${qualifiesForFreeShipping ? 0 : shipCart}`,
    );
  };

  const getVariantsLabel = (product: (typeof cartState.cartArray)[0]) => {
    if (!product.apiItem) return "";
    return (
      product.apiItem.ProductVariants?.replace(/,/g, ", ") ||
      product.apiItem.cartItemVariantList
        ?.map((v) => `${v.VariantGroup}: ${v.VariantName}`)
        .join(" · ") ||
      ""
    );
  };

  return (
    <>
      <TopNavOne
        props="style-one bg-black"
        slogan="New customers save 10% with the code GET10"
      />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Shopping cart" subHeading="Shopping cart" />
      </div>

      <div className="cart-block md:py-20 py-10">
        <div className="container">
          {cartLoading ? (
            <div className="text-center py-20 text-secondary">
              Loading your cart...
            </div>
          ) : (
            <div className="content-main flex justify-between max-xl:flex-col gap-y-10">
              {/* Cart items */}
              <div className="xl:w-2/3 xl:pr-3 w-full">
                <div className="time bg-green py-3 px-5 flex items-center rounded-lg">
                  <div className="heading5">🔥</div>
                  <div className="caption1 pl-2">
                    Your cart will expire in{" "}
                    <span className="text-red font-semibold">
                      {timeLeft.minutes}:
                      {timeLeft.seconds < 10
                        ? `0${timeLeft.seconds}`
                        : timeLeft.seconds}
                    </span>{" "}
                    minutes! Please checkout before your items sell out!
                  </div>
                </div>

                <div className="heading banner mt-5">
                  <div className="text caption1">
                    Buy{" "}
                    <span className="text-button font-semibold">
                      {formatRsPrice(freeShippingRemaining)}
                    </span>{" "}
                    more to get{" "}
                    <span className="text-button font-semibold">free shipping</span>
                  </div>
                  <div className="tow-bar-block mt-4">
                    <div
                      className="progress-line"
                      style={{
                        width: `${Math.min((subTotal / moneyForFreeship) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Desktop table header */}
                <div className="hidden md:block heading bg-surface rounded-lg pt-4 pb-4 mt-7">
                  <div className="flex px-2">
                    <div className="w-[45%]">
                      <div className="text-button text-center">Products</div>
                    </div>
                    <div className="w-[15%]">
                      <div className="text-button text-center">Price</div>
                    </div>
                    <div className="w-[20%]">
                      <div className="text-button text-center">Quantity</div>
                    </div>
                    <div className="w-[15%]">
                      <div className="text-button text-center">Total</div>
                    </div>
                    <div className="w-[5%]" />
                  </div>
                </div>

                <div className="list-product-main w-full mt-3">
                  {cartState.cartArray.length === 0 ? (
                    <div className="text-center py-16 border border-line rounded-2xl mt-5">
                      <p className="text-button text-secondary mb-4">
                        No products in your cart
                      </p>
                      <Link href="/" className="button-main inline-block">
                        Continue Shopping
                      </Link>
                    </div>
                  ) : (
                    cartState.cartArray.map((product, index) => {
                      const image =
                        product.thumbImage?.[0] ||
                        product.images?.[0] ||
                        "/images/product/1000x1000.png";
                      const variantsLabel = getVariantsLabel(product);

                      return (
                        <div
                          key={product.cartId || `${product.id}-${index}`}
                          className="item border-b border-line py-6 w-full"
                        >
                          {/* Mobile + Desktop row */}
                          <div className="flex flex-col md:flex-row md:items-center gap-4">
                            {/* Product info */}
                            <div className="md:w-[45%] flex items-start gap-4 min-w-0">
                              <Link
                                href={getProductDetailUrl(
                                  product.id,
                                  product.productDetailId,
                                )}
                                className="w-24 h-28 md:w-[100px] md:h-[120px] flex-shrink-0 rounded-lg overflow-hidden relative bg-surface"
                              >
                                <Image
                                  src={image}
                                  fill
                                  sizes="100px"
                                  alt={product.name}
                                  className="object-cover"
                                />
                              </Link>
                              <div className="min-w-0 flex-1">
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
                                  className="text-title hover:underline line-clamp-2"
                                >
                                  {product.name}
                                </Link>
                                {variantsLabel && (
                                  <div className="caption1 text-secondary mt-2">
                                    Variant: {variantsLabel}
                                  </div>
                                )}
                                {product.description &&
                                  product.description !== variantsLabel && (
                                    <p className="caption1 text-secondary mt-1 line-clamp-2">
                                      {product.description}
                                    </p>
                                  )}
                                {product.apiItem?.ProductDetailId && (
                                  <div className="caption2 text-secondary mt-1">
                                    SKU / Detail: {product.apiItem.ProductDetailId}
                                  </div>
                                )}
                                {/* Mobile price + qty */}
                                <div className="flex md:hidden items-center justify-between mt-3">
                                  <span className="text-title font-semibold">
                                    {formatRsPrice(product.lineTotal)}
                                  </span>
                                  <button
                                    type="button"
                                    aria-label="Remove item"
                                    className="text-red caption1 underline"
                                    onClick={() => removeFromCart(product.cartId)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Unit price */}
                            <div className="hidden md:flex md:w-[15%] items-center justify-center">
                              <span className="text-title text-center">
                                {formatRsPrice(product.price)}
                              </span>
                            </div>

                            {/* Quantity */}
                            <div className="md:w-[20%] flex items-center md:justify-center">
                              <div className="quantity-block bg-surface p-2 md:p-3 flex items-center justify-between rounded-lg border border-line w-[120px]">
                                <button
                                  type="button"
                                  aria-label="Decrease quantity"
                                  disabled={product.quantity <= 1}
                                  onClick={() =>
                                    handleQuantityChange(
                                      product.cartId,
                                      product.quantity - 1,
                                    )
                                  }
                                  className={`${product.quantity <= 1 ? "opacity-30" : "cursor-pointer"}`}
                                >
                                  <Icon.Minus size={16} />
                                </button>
                                <span className="text-button font-semibold w-8 text-center">
                                  {product.quantity}
                                </span>
                                <button
                                  type="button"
                                  aria-label="Increase quantity"
                                  onClick={() =>
                                    handleQuantityChange(
                                      product.cartId,
                                      product.quantity + 1,
                                    )
                                  }
                                  className="cursor-pointer"
                                >
                                  <Icon.Plus size={16} />
                                </button>
                              </div>
                            </div>

                            {/* Line total */}
                            <div className="hidden md:flex md:w-[15%] items-center justify-center">
                              <span className="text-title font-semibold text-center">
                                {formatRsPrice(product.lineTotal)}
                              </span>
                            </div>

                            {/* Remove */}
                            <div className="hidden md:flex md:w-[5%] items-center justify-center">
                              <button
                                type="button"
                                aria-label="Remove item"
                                className="text-red hover:text-black duration-300"
                                onClick={() => removeFromCart(product.cartId)}
                              >
                                <Icon.XCircle size={24} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                  <section className="mt-12 pt-8 border-t border-line">
                    <h2 className="heading5 mb-2">You May Also Like</h2>
                    <p className="caption1 text-secondary mb-6">
                      Related products based on items in your cart
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {relatedProducts.map((related) => {
                        const image =
                          related.ThumbnailImagePath &&
                          !related.ThumbnailImagePath.includes("noImage")
                            ? related.ThumbnailImagePath
                            : "/images/product/1000x1000.png";

                        return (
                          <div
                            key={related.ProductId}
                            className="border border-line rounded-2xl overflow-hidden hover:border-black transition-colors"
                          >
                            <Link
                              href={getProductDetailUrl(related.ProductId)}
                              className="block aspect-[4/5] relative bg-surface"
                            >
                              <Image
                                src={image}
                                fill
                                sizes="(max-width: 640px) 100vw, 33vw"
                                alt={related.ProductName}
                                className="object-cover"
                              />
                              {related.IsNewProduct && (
                                <span className="absolute top-2 left-2 caption2 bg-green text-white px-2 py-0.5 rounded-full">
                                  New
                                </span>
                              )}
                            </Link>
                            <div className="p-4">
                              <div className="caption2 text-secondary uppercase">
                                {related.Category?.CategoryName}
                              </div>
                              <Link
                                href={getProductDetailUrl(related.ProductId)}
                                className="text-button font-semibold mt-1 line-clamp-2 hover:underline"
                              >
                                {related.ProductName}
                              </Link>
                              {related.Category?.CategoryDescription && (
                                <p className="caption1 text-secondary mt-2 line-clamp-2">
                                  {related.Category.CategoryDescription}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2 mt-4">
                                <button
                                  type="button"
                                  disabled={addingRelatedId === related.ProductId}
                                  className="button-main py-2 px-4 text-sm disabled:opacity-50"
                                  onClick={() =>
                                    void handleAddRelatedToCart(related)
                                  }
                                >
                                  Add To Cart
                                </button>
                                <Link
                                  href={getProductDetailUrl(related.ProductId)}
                                  className="py-2 px-4 text-sm border border-line rounded-full hover:bg-black hover:text-white transition-colors inline-block"
                                >
                                  View Details
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>

              {/* Order summary */}
              <div className="xl:w-1/3 xl:pl-8 w-full">
                <div className="checkout-block bg-surface p-6 rounded-2xl sticky top-24">
                  <div className="heading5">Order Summary</div>

                  <div className="total-block py-5 flex justify-between border-b border-line mt-2">
                    <span className="text-title">Subtotal</span>
                    <span className="text-title">{formatRsPrice(subTotal)}</span>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="discount-block py-5 flex justify-between border-b border-line">
                      <span className="text-title">Discount</span>
                      <span className="text-title text-green">
                        -{formatRsPrice(totalDiscount)}
                      </span>
                    </div>
                  )}

                  <div className="ship-block py-5 flex justify-between border-b border-line gap-4">
                    <span className="text-title flex-shrink-0">Shipping</span>
                    <div className="text-right">
                      <label className="flex items-center justify-end gap-2 caption1 cursor-pointer">
                        <input
                          type="radio"
                          name="ship"
                          checked={qualifiesForFreeShipping || shipCart === 0}
                          disabled={!qualifiesForFreeShipping}
                          onChange={() => setShipCart(0)}
                        />
                        Free Shipping {qualifiesForFreeShipping ? "" : "(not eligible)"}
                      </label>
                      <label className="flex items-center justify-end gap-2 caption1 mt-2 cursor-pointer">
                        <input
                          type="radio"
                          name="ship"
                          checked={!qualifiesForFreeShipping && shipCart === 30}
                          onChange={() => setShipCart(30)}
                        />
                        Local — {formatRsPrice(30)}
                      </label>
                      <label className="flex items-center justify-end gap-2 caption1 mt-2 cursor-pointer">
                        <input
                          type="radio"
                          name="ship"
                          checked={!qualifiesForFreeShipping && shipCart === 40}
                          onChange={() => setShipCart(40)}
                        />
                        Flat Rate — {formatRsPrice(40)}
                      </label>
                    </div>
                  </div>

                  <div className="total-cart-block pt-5 pb-2 flex justify-between">
                    <span className="heading5">Total</span>
                    <span className="heading5">{formatRsPrice(orderTotal)}</span>
                  </div>

                  {cartState.totalItems > 0 && (
                    <p className="caption2 text-secondary text-center">
                      {cartState.totalItems} item(s) in cart
                    </p>
                  )}

                  <div className="block-button flex flex-col items-center gap-y-4 mt-5">
                    <button
                      type="button"
                      className="checkout-btn button-main text-center w-full disabled:opacity-50"
                      disabled={cartState.cartArray.length === 0}
                      onClick={redirectToCheckout}
                    >
                      Proceed To Checkout
                    </button>
                    <Link
                      className="text-button hover:underline"
                      href="/"
                    >
                      Continue shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Cart;
