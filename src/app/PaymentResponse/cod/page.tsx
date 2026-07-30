"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Footer from "@/components/Footer/Footer";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import {
  clearPendingPaymentOrderId,
  fetchCustomerOrderDetails,
  getPendingPaymentOrderId,
  OrderDetailData,
} from "@/lib/order";
import { formatRsPrice } from "@/lib/cart";

const CodPaymentResponseContent = () => {
  const searchParams = useSearchParams();
  const orderIdParam = Number(searchParams.get("orderId"));

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetailData | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadOrder = async () => {
      const orderId =
        Number.isFinite(orderIdParam) && orderIdParam > 0
          ? orderIdParam
          : getPendingPaymentOrderId();

      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const details = await fetchCustomerOrderDetails(orderId);
        if (!cancelled) setOrder(details);
      } catch {
      } finally {
        if (!cancelled) {
          setLoading(false);
          clearPendingPaymentOrderId();
        }
      }
    };

    void loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderIdParam]);

  const resolvedOrderId = order?.OrderId ?? (orderIdParam || null);
  const orderAny = order as any;

  // Subtotal calculation fallback
  const subtotalVal = order?.OrderAmount ?? 0;

  return (
    <div className="md:py-16 py-10 px-4 sm:px-6">
      <div className="w-full max-w-3xl mx-auto">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface mb-4 animate-pulse">
              <Icon.CircleNotch size={28} className="animate-spin" />
            </div>
            <div className="heading5">Confirming your order...</div>
            <p className="body2 text-secondary mt-2">
              Please wait while we load your order confirmation.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-line bg-white overflow-hidden shadow-sm">
            <div className="px-6 md:px-8 py-10 text-center bg-green-50">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 bg-green text-white">
                <Icon.CheckCircle size={42} weight="fill" />
              </div>
              <h1 className="heading3">Order Confirmed!</h1>
              <p className="body1 text-secondary mt-3 max-w-xl mx-auto">
                Your order is placed with Cash on Delivery. Please keep the
                payable amount ready when your order arrives.
              </p>
            </div>

            <div className="px-6 md:px-8 py-8 space-y-4">
              {order?.OrderNumber && (
                <div className="flex justify-between items-center py-3 border-b border-line">
                  <span className="caption1 text-secondary">Order Number</span>
                  <span className="text-button font-semibold">
                    {order.OrderNumber}
                  </span>
                </div>
              )}

              {resolvedOrderId && (
                <div className="flex justify-between items-center py-3 border-b border-line">
                  <span className="caption1 text-secondary">Order ID</span>
                  <span className="text-button font-semibold">
                    {resolvedOrderId}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-3 border-b border-line">
                <span className="caption1 text-secondary">Payment Method</span>
                <span className="text-button font-semibold">
                  {order?.PaymentMethodName || "Cash on Delivery"}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-line">
                <span className="caption1 text-secondary">Payment Status</span>
                <span className="caption2 bg-green-50 text-green-700 px-3 py-1 rounded-full">
                  {order?.PaymentStatusDisplayName || "Pay on Delivery"}
                </span>
              </div>

              {/* Payment Summary Section */}
              <div className="pt-2 space-y-3 border-b border-line pb-4">
                <div className="text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                  Payment Summary
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-secondary">Subtotal</span>
                  <span className="font-medium">
                    {formatRsPrice(subtotalVal)}
                  </span>
                </div>

                {(order?.DeliveryCharges ?? orderAny?.DeliveryCharge ?? 0) >
                  0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-secondary">Delivery Charges</span>
                    <span className="font-medium">
                      {formatRsPrice(
                        order?.DeliveryCharges ?? orderAny?.DeliveryCharge,
                      )}
                    </span>
                  </div>
                )}

                {(() => {
                  const posVal =
                    orderAny?.POSCharges ?? orderAny?.POSCharge ?? 0;
                  if (posVal > 0) {
                    return (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-secondary">POS Charges</span>
                        <span className="font-medium">
                          {formatRsPrice(posVal)}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* 1. Sale Discount */}
                {(() => {
                  const saleDisc = orderAny?.SaleDiscount ?? 0;
                  if (saleDisc > 0) {
                    return (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-secondary">Discount</span>
                        <span className="font-bold text-green">
                          -{formatRsPrice(saleDisc)}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* 2. Promo Code Discount */}
                {(() => {
                  const promoDisc =
                    orderAny?.PromoCodeValue ?? orderAny?.PromoDiscount ?? 0;
                  if (promoDisc > 0) {
                    return (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-secondary">
                          Promo Code{" "}
                          {orderAny?.PromoCode ? `(${orderAny.PromoCode})` : ""}
                        </span>
                        <span className="font-bold text-green">
                          -{formatRsPrice(promoDisc)}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

                {(() => {
                  const pmDisc = orderAny?.PaymentMethodDiscount ?? 0;
                  if (pmDisc > 0) {
                    return (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-secondary">
                          Payment Method Discount
                        </span>
                        <span className="font-bold text-green">
                          -{formatRsPrice(pmDisc)}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

                {(() => {
                  const ovDisc = orderAny?.OrderValueDiscount ?? 0;
                  if (ovDisc > 0) {
                    return (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-secondary">
                          Order Value Discount
                        </span>
                        <span className="font-bold text-green">
                          -{formatRsPrice(ovDisc)}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {order?.NetAmount != null && (
                <div className="flex justify-between items-center py-2">
                  <span className="caption1 text-secondary font-bold">
                    Amount Payable
                  </span>
                  <span className="heading6">
                    {formatRsPrice(order.NetAmount)}
                  </span>
                </div>
              )}
            </div>

            <div className="px-6 md:px-8 pb-8 flex flex-col sm:flex-row gap-3">
              {resolvedOrderId && (
                <Link
                  href="/my-account"
                  className="button-main text-center flex-1"
                >
                  View Order Details
                </Link>
              )}
              <Link
                href="/"
                className="px-6 py-3 rounded-full border border-line text-center hover:border-black transition-colors flex-1"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CodPaymentResponsePage = () => {
  return (
    <>
      <TopNavOne
        props="style-one bg-black"
        slogan="New customers save 10% with the code GET10"
      />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
      </div>

      <Suspense
        fallback={
          <div className="container text-center py-20 text-secondary">
            Loading order confirmation...
          </div>
        }
      >
        <CodPaymentResponseContent />
      </Suspense>

      <Footer />
    </>
  );
};

export default CodPaymentResponsePage;
