"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useCart } from "@/context/CartContext";
import api from "@/lib/api";
import { formatRsPrice } from "@/lib/cart";
import { buildCreateOrderPayload, createOrder, extractOrderId } from "@/lib/order";
import { getApiErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";

type SelectOption = { Value: string; Text: string };

const Checkout = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const discount = Number(searchParams.get("discount")) || 0;
  const ship = Number(searchParams.get("ship")) || 0;

  const { cartState, fetchCart } = useCart();

  const [countries, setCountries] = useState<SelectOption[]>([]);
  const [states, setStates] = useState<SelectOption[]>([]);
  const [cities, setCities] = useState<SelectOption[]>([]);
  const [areas, setAreas] = useState<SelectOption[]>([]);
  const [branches, setBranches] = useState<SelectOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
    countryId: "",
    stateId: "",
    cityId: "",
    cityName: "",
    areaId: "",
    branchId: "",
    specialInstructions: "",
    deliveryInstructions: "",
    isGiftOrder: false,
    deliveryOption: 1,
    isoCode: "PK",
    phoneCode: "+92",
    deliveryDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
  });

  const subTotal = cartState.subTotal || 0;
  const netTotal = cartState.netTotal || subTotal;
  const orderTotal = netTotal - discount + ship;

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    const getCountries = async () => {
      try {
        const res = await api.get("/api/v1/Common/countries");
        setCountries(
          Array.isArray(res.data?.Data) ? res.data.Data : [],
        );
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      }
    };
    void getCountries();
  }, []);

  const fetchStates = async (countryId: string) => {
    if (!countryId) return;
    try {
      const res = await api.get("/api/v1/Common/states", {
        params: { CountryId: countryId },
      });
      setStates(Array.isArray(res.data?.Data) ? res.data.Data : []);
    } catch (error) {
      console.error("Failed to fetch states:", error);
    }
  };

  const fetchCities = async (stateId: string) => {
    if (!stateId) return;
    try {
      const res = await api.get("/api/v1/Common/cities", {
        params: { StateId: stateId },
      });
      setCities(Array.isArray(res.data?.Data) ? res.data.Data : []);
    } catch (error) {
      console.error("Failed to fetch cities:", error);
    }
  };

  const fetchAreas = async (cityId: string) => {
    if (!cityId) return;
    try {
      const res = await api.get("/api/v1/Common/areas", {
        params: { CityId: cityId },
      });
      setAreas(Array.isArray(res.data?.Data) ? res.data.Data : []);
    } catch (error) {
      console.error("Failed to fetch areas:", error);
    }
  };

  const fetchBranches = async (cityId: string) => {
    if (!cityId) return;
    try {
      const res = await api.get("/api/v1/Common/branches", {
        params: { CityId: cityId },
      });
      setBranches(Array.isArray(res.data?.Data) ? res.data.Data : []);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    }
  };

  const updateForm = (field: string, value: string | boolean | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const getVariantsLabel = (product: (typeof cartState.cartArray)[0]) => {
    if (!product.apiItem) return product.selectedSize || "";
    return (
      product.apiItem.ProductVariants?.replace(/,/g, ", ") ||
      product.apiItem.cartItemVariantList
        ?.map((v) => `${v.VariantGroup}: ${v.VariantName}`)
        .join(" · ") ||
      ""
    );
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartState.cartArray.length === 0) {
      toast.error("Your cart is empty. Add products before checkout.");
      return;
    }

    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.phone ||
      !form.address ||
      !form.countryId ||
      !form.stateId ||
      !form.cityId
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildCreateOrderPayload(form);
      const response = await createOrder(payload);
      const newOrderId = extractOrderId(response.Data);

      toast.success(response.Message || "Order created successfully!");
      await fetchCart();

      if (newOrderId) {
        router.push(`/order/${newOrderId}`);
      } else {
        router.push("/");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to create order."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <TopNavOne
        props="style-one bg-black"
        slogan="New customers save 10% with the code GET10"
      />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Checkout" subHeading="Checkout" />
      </div>

      <div className="cart-block md:py-20 py-10">
        <div className="container">
          <div className="content-main flex flex-col xl:flex-row gap-10 xl:gap-12">
            {/* Checkout form */}
            <div className="w-full xl:w-3/5">
              <div className="information">
                <div className="heading5">Shipping Information</div>
                <div className="form-checkout mt-5">
                  <form onSubmit={handleCreateOrder}>
                    <div className="grid sm:grid-cols-2 gap-4 gap-y-5">
                      <input
                        className="border border-line px-4 py-3 w-full rounded-lg"
                        type="text"
                        placeholder="First Name *"
                        value={form.firstName}
                        onChange={(e) => updateForm("firstName", e.target.value)}
                        required
                      />
                      <input
                        className="border border-line px-4 py-3 w-full rounded-lg"
                        type="text"
                        placeholder="Last Name *"
                        value={form.lastName}
                        onChange={(e) => updateForm("lastName", e.target.value)}
                        required
                      />
                      <input
                        className="border border-line px-4 py-3 w-full rounded-lg"
                        type="email"
                        placeholder="Email Address *"
                        value={form.email}
                        onChange={(e) => updateForm("email", e.target.value)}
                        required
                      />
                      <input
                        className="border border-line px-4 py-3 w-full rounded-lg"
                        type="tel"
                        placeholder="Phone Number *"
                        value={form.phone}
                        onChange={(e) => updateForm("phone", e.target.value)}
                        required
                      />

                      <div className="col-span-full select-block relative">
                        <select
                          className="border border-line px-4 py-3 w-full rounded-lg appearance-none bg-white"
                          value={form.countryId}
                          onChange={(e) => {
                            const countryId = e.target.value;
                            updateForm("countryId", countryId);
                            updateForm("stateId", "");
                            updateForm("cityId", "");
                            updateForm("cityName", "");
                            setStates([]);
                            setCities([]);
                            setAreas([]);
                            setBranches([]);
                            void fetchStates(countryId);
                          }}
                          required
                        >
                          <option value="">Choose Country *</option>
                          {countries.map((country) => (
                            <option key={country.Value} value={country.Value}>
                              {country.Text}
                            </option>
                          ))}
                        </select>
                        <Icon.CaretDown
                          size={14}
                          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        />
                      </div>

                      <div className="select-block relative">
                        <select
                          className="border border-line px-4 py-3 w-full rounded-lg appearance-none bg-white"
                          value={form.stateId}
                          onChange={(e) => {
                            const stateId = e.target.value;
                            updateForm("stateId", stateId);
                            updateForm("cityId", "");
                            updateForm("cityName", "");
                            setCities([]);
                            setAreas([]);
                            setBranches([]);
                            void fetchCities(stateId);
                          }}
                          required
                        >
                          <option value="">Choose State *</option>
                          {states.map((state) => (
                            <option key={state.Value} value={state.Value}>
                              {state.Text}
                            </option>
                          ))}
                        </select>
                        <Icon.CaretDown
                          size={14}
                          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        />
                      </div>

                      <div className="select-block relative">
                        <select
                          className="border border-line px-4 py-3 w-full rounded-lg appearance-none bg-white"
                          value={form.cityId}
                          onChange={(e) => {
                            const cityId = e.target.value;
                            const city = cities.find((c) => c.Value === cityId);
                            updateForm("cityId", cityId);
                            updateForm("cityName", city?.Text || "");
                            setAreas([]);
                            setBranches([]);
                            void fetchAreas(cityId);
                            void fetchBranches(cityId);
                          }}
                          required
                        >
                          <option value="">Choose City *</option>
                          {cities.map((city) => (
                            <option key={city.Value} value={city.Value}>
                              {city.Text}
                            </option>
                          ))}
                        </select>
                        <Icon.CaretDown
                          size={14}
                          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        />
                      </div>

                      <div className="select-block relative">
                        <select
                          className="border border-line px-4 py-3 w-full rounded-lg appearance-none bg-white"
                          value={form.areaId}
                          onChange={(e) => updateForm("areaId", e.target.value)}
                        >
                          <option value="">Choose Area</option>
                          {areas.map((area) => (
                            <option key={area.Value} value={area.Value}>
                              {area.Text}
                            </option>
                          ))}
                        </select>
                        <Icon.CaretDown
                          size={14}
                          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        />
                      </div>

                      <div className="select-block relative">
                        <select
                          className="border border-line px-4 py-3 w-full rounded-lg appearance-none bg-white"
                          value={form.branchId}
                          onChange={(e) => updateForm("branchId", e.target.value)}
                        >
                          <option value="">Select Branch</option>
                          {branches.map((branch) => (
                            <option key={branch.Value} value={branch.Value}>
                              {branch.Text}
                            </option>
                          ))}
                        </select>
                        <Icon.CaretDown
                          size={14}
                          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        />
                      </div>

                      <input
                        className="border border-line px-4 py-3 w-full rounded-lg sm:col-span-2"
                        type="text"
                        placeholder="Street Address *"
                        value={form.address}
                        onChange={(e) => updateForm("address", e.target.value)}
                        required
                      />
                      <input
                        className="border border-line px-4 py-3 w-full rounded-lg"
                        type="text"
                        placeholder="Postal Code"
                        value={form.postalCode}
                        onChange={(e) => updateForm("postalCode", e.target.value)}
                      />
                      <input
                        className="border border-line px-4 py-3 w-full rounded-lg"
                        type="datetime-local"
                        value={form.deliveryDate}
                        onChange={(e) =>
                          updateForm("deliveryDate", e.target.value)
                        }
                      />

                      <textarea
                        className="border border-line px-4 py-3 w-full rounded-lg sm:col-span-2"
                        placeholder="Special instructions for your order..."
                        rows={3}
                        value={form.specialInstructions}
                        onChange={(e) =>
                          updateForm("specialInstructions", e.target.value)
                        }
                      />
                      <textarea
                        className="border border-line px-4 py-3 w-full rounded-lg sm:col-span-2"
                        placeholder="Delivery instructions..."
                        rows={2}
                        value={form.deliveryInstructions}
                        onChange={(e) =>
                          updateForm("deliveryInstructions", e.target.value)
                        }
                      />

                      <label className="flex items-center gap-2 sm:col-span-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.isGiftOrder}
                          onChange={(e) =>
                            updateForm("isGiftOrder", e.target.checked)
                          }
                        />
                        <span className="text-button">This is a gift order</span>
                      </label>

                      <div className="select-block relative sm:col-span-2">
                        <select
                          className="border border-line px-4 py-3 w-full rounded-lg appearance-none bg-white"
                          value={form.deliveryOption}
                          onChange={(e) =>
                            updateForm("deliveryOption", Number(e.target.value))
                          }
                        >
                          <option value={1}>Home Delivery</option>
                          <option value={2}>Store Pickup</option>
                        </select>
                        <Icon.CaretDown
                          size={14}
                          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        />
                      </div>
                    </div>

                    <div className="block-button md:mt-10 mt-6">
                      <button
                      title="Create Your Order"
                        type="submit"
                        className="button-main bg-black w-full disabled:opacity-50"
                        disabled={submitting || cartState.cartArray.length === 0}
                      >
                        {submitting ? "Creating Order..." : "Create Order"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="w-full xl:w-2/5">
              <div className="checkout-block bg-surface p-6 rounded-2xl sticky top-24">
                <div className="heading5 pb-3">Your Order</div>

                <div className="list-product-checkout max-h-[420px] overflow-y-auto">
                  {cartState.cartArray.length === 0 ? (
                    <p className="text-button text-secondary pt-3">
                      No products in cart.{" "}
                      <Link href="/" className="underline">
                        Continue shopping
                      </Link>
                    </p>
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
                          className="item flex items-start gap-4 w-full pb-5 border-b border-line mt-5 first:mt-0"
                        >
                          <div className="w-[80px] h-[96px] flex-shrink-0 rounded-lg overflow-hidden relative bg-white">
                            <Image
                              src={image}
                              fill
                              sizes="80px"
                              alt={product.name}
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            {product.category && (
                              <div className="caption2 text-secondary uppercase">
                                {product.category}
                              </div>
                            )}
                            <div className="name text-button font-semibold line-clamp-2">
                              {product.name}
                            </div>
                            {variantsLabel && (
                              <div className="caption1 text-secondary mt-1">
                                {variantsLabel}
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <span className="caption1 text-secondary">
                                Qty: {product.quantity}
                              </span>
                              <span className="text-button font-semibold">
                                {formatRsPrice(product.lineTotal)}
                              </span>
                            </div>
                            {product.quantity > 1 && (
                              <div className="caption2 text-secondary">
                                {formatRsPrice(product.price)} each
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="subtotal-block py-4 flex justify-between border-b border-line mt-4">
                  <span className="text-title">Subtotal</span>
                  <span className="text-title">{formatRsPrice(subTotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="discount-block py-4 flex justify-between border-b border-line">
                    <span className="text-title">Discount</span>
                    <span className="text-title text-green">
                      -{formatRsPrice(discount)}
                    </span>
                  </div>
                )}

                <div className="ship-block py-4 flex justify-between border-b border-line">
                  <span className="text-title">Shipping</span>
                  <span className="text-title">
                    {ship === 0 ? "Free" : formatRsPrice(ship)}
                  </span>
                </div>

                <div className="total-cart-block pt-5 flex justify-between">
                  <span className="heading5">Total</span>
                  <span className="heading5">{formatRsPrice(orderTotal)}</span>
                </div>

                <p className="caption2 text-secondary text-center mt-3">
                  {cartState.totalItems} item(s) · All prices in PKR (Rs.)
                </p>

                <Link
                  href="/cart"
                  className="text-button hover:underline block text-center mt-4"
                >
                  ← Back to cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Checkout;
