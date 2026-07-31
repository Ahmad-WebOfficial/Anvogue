"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Footer from "@/components/Footer/Footer";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import {
  buildPaymentErrorUrl,
  clearPendingPaymentOrderId,
  confirmStripePayment,
  fetchCustomerOrderDetails,
  getPendingPaymentOrderId,
  getPendingPaymentTransactionId,
  getStripeFailureReason,
  isFailedPaymentStatus,
  OrderDetailData,
  StripePaymentConfirmResult,
} from "@/lib/order";
import { formatRsPrice } from "@/lib/cart";
import { getApiErrorMessage } from "@/lib/api";

function buildSuccessResult(
  sessionId: string,
  orderId: number | null,
  orderDetails: OrderDetailData | null,
  confirmResult: StripePaymentConfirmResult | null,
): StripePaymentConfirmResult {
  const savedTransactionId = getPendingPaymentTransactionId();

  return {
    message:
      confirmResult?.message ??
      orderDetails?.PaymentStatusDisplayName ??
      "Your payment status has been fetched.",
    orderId: orderId ?? orderDetails?.OrderId ?? null,
    orderNumber:
      confirmResult?.orderNumber ?? orderDetails?.OrderNumber ?? null,
    paymentStatus:
      confirmResult?.paymentStatus ??
      orderDetails?.PaymentStatusDisplayName ??
      "Waiting For Payment",
    transactionId:
      confirmResult?.transactionId || savedTransactionId || sessionId,
    isSuccess: confirmResult?.isSuccess ?? orderDetails?.PaymentStatus === 1,
  };
}

const StripePaymentResponseContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("sessionId")?.trim() ?? "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState<StripePaymentConfirmResult | null>(null);
  const [order, setOrder] = useState<OrderDetailData | null>(null);

  useEffect(() => {
    let cancelled = false;

    const goToErrorPage = (
      message: string,
      orderId: number | null,
      orderNumber?: string | null,
    ) => {
      router.replace(
        buildPaymentErrorUrl({
          orderId,
          orderNumber,
          message,
          transactionId: sessionId || getPendingPaymentTransactionId(),
        }),
      );
    };

    const confirmPayment = async () => {
      const pendingOrderId = getPendingPaymentOrderId();
      const failureReason = getStripeFailureReason(
        new URLSearchParams(searchParams.toString()),
      );

      if (failureReason) {
        goToErrorPage(failureReason, pendingOrderId);
        return;
      }

      if (!sessionId) {
        goToErrorPage(
          "Payment session ID is missing, so we could not verify your payment.",
          pendingOrderId,
        );
        return;
      }

      setLoading(true);
      setError("");

      try {
        const confirmResult = await confirmStripePayment(sessionId);
        const orderId = confirmResult?.orderId ?? pendingOrderId ?? null;

        if (confirmResult && !confirmResult.isSuccess) {
          if (!cancelled) {
            goToErrorPage(
              confirmResult.message ||
                "Your payment could not be verified. Please try again.",
              orderId,
              confirmResult.orderNumber,
            );
          }
          return;
        }

        let orderDetails: OrderDetailData | null = null;
        if (orderId) {
          try {
            orderDetails = await fetchCustomerOrderDetails(orderId);
          } catch {
            // ignore
          }
        }

        if (cancelled) return;

        const statusText =
          orderDetails?.PaymentStatusDisplayName ??
          confirmResult?.paymentStatus ??
          "";
        if (isFailedPaymentStatus(statusText)) {
          goToErrorPage(
            confirmResult?.message ||
              `Your payment was not successful (status: ${statusText}).`,
            orderId,
            orderDetails?.OrderNumber ?? confirmResult?.orderNumber,
          );
          return;
        }

        setOrder(orderDetails);
        setResult(
          buildSuccessResult(sessionId, orderId, orderDetails, confirmResult),
        );
        clearPendingPaymentOrderId();
      } catch (err) {
        if (!cancelled) {
          // Stripe redirects back here only after a completed checkout session.
          if (pendingOrderId || sessionId.startsWith("cs_")) {
            let orderDetails: OrderDetailData | null = null;
            if (pendingOrderId) {
              try {
                orderDetails = await fetchCustomerOrderDetails(pendingOrderId);
              } catch {
                // ignore
              }
            }

            if (isFailedPaymentStatus(orderDetails?.PaymentStatusDisplayName)) {
              goToErrorPage(
                `Your payment was not successful (status: ${orderDetails?.PaymentStatusDisplayName}).`,
                pendingOrderId,
                orderDetails?.OrderNumber,
              );
              return;
            }

            setOrder(orderDetails);
            setResult(
              buildSuccessResult(sessionId, pendingOrderId, orderDetails, null),
            );
            clearPendingPaymentOrderId();
            return;
          }

          goToErrorPage(
            getApiErrorMessage(err, "Failed to confirm your payment."),
            pendingOrderId,
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void confirmPayment();

    return () => {
      cancelled = true;
    };
  }, [sessionId, searchParams, router]);

  const resolvedOrderId = result?.orderId ?? order?.OrderId ?? null;
  const orderNumber = result?.orderNumber || order?.OrderNumber;

  const orderAny = order as any;
  const subtotalVal =
    order?.SubTotal ?? orderAny?.Subtotal ?? order?.NetAmount ?? 0;
  const taxVal = order?.TaxAmount ?? orderAny?.Tax ?? 0;
  const netAmountVal = order?.NetAmount ?? orderAny?.TotalAmount ?? 0;

  // Real status API se uthana hai
  const currentPaymentStatus =
    order?.PaymentStatusDisplayName ||
    result?.paymentStatus ||
    "Waiting For Payment";
  const isPaid =
    currentPaymentStatus.toLowerCase().includes("paid") ||
    currentPaymentStatus.toLowerCase().includes("completed");

  return (
    <div className="md:py-16 py-8 px-4 sm:px-6 bg-[#FAF9F5] pt-20 sm:pt-24">
      <div className="w-full max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-line shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface mb-4 animate-pulse">
              <Icon.CircleNotch size={28} className="animate-spin text-black" />
            </div>
            <div className="heading5 text-black">
              Checking payment status...
            </div>
            <p className="body2 text-secondary mt-2">
              Please wait while we verify your transaction details.
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-16 px-6 rounded-3xl border border-line bg-white shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red mb-4">
              <Icon.WarningCircle size={32} />
            </div>
            <div className="heading4">Payment Verification Failed</div>
            <p className="body1 text-secondary mt-3">{error}</p>
            <Link href="/my-account" className="button-main inline-block mt-6">
              Go to My Account
            </Link>
            <Link href="/" className="block mt-4 text-button hover:underline">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div>
            {/* Top Header based on real status */}
            <div className="text-center mt-5 px-2">
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-2 shadow-md ${isPaid ? "bg-[#1C1C1C] text-[#C2FF00]" : "bg-yellow-100 text-yellow-800"}`}
              >
                {isPaid ? (
                  <Icon.Check size={25} weight="bold" />
                ) : (
                  <Icon.Clock size={25} weight="bold" />
                )}
              </div>
              <h1 className="heading3 text-2xl font-bold">
                {isPaid
                  ? "Payment Paid & Confirmed"
                  : "Payment Status: " + currentPaymentStatus}
              </h1>
              <p className="body2 text-secondary mt-2 text-sm sm:text-base max-w-sm mx-auto">
                {isPaid
                  ? "Thanks for shopping with TopSaver. Your payment is successfully completed."
                  : "Your order is placed, but payment is currently pending or waiting for confirmation."}
              </p>
            </div>

            {/* Main Receipt Card */}
            <div className="rounded-3xl border border-line mt-4 bg-white overflow-hidden p-6 sm:p-10 shadow-sm">
              {/* Amount Section */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 pb-5 border-b border-line">
                <span className="text-secondary font-medium text-sm sm:text-base">
                  Total Amount
                </span>
                <span className="text-xl sm:text-2xl font-bold text-black">
                  {formatRsPrice(netAmountVal)}
                </span>
              </div>

              {/* Order Details */}
              <div className="py-5 border-b border-line space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">
                  Order Details
                </div>

                {orderNumber && (
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-sm">
                    <span className="text-secondary">Order number</span>
                    <span className="font-semibold text-black break-all">
                      {orderNumber}
                    </span>
                  </div>
                )}

                {resolvedOrderId && (
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-sm">
                    <span className="text-secondary">Order ID</span>
                    <span className="font-semibold text-black">
                      {resolvedOrderId}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm">
                  <span className="text-secondary">Payment status</span>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5 ${isPaid ? "bg-[#E7F6D5] text-[#2C6B00]" : "bg-yellow-50 text-yellow-800"}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isPaid ? "bg-[#2C6B00]" : "bg-yellow-600"}`}
                    ></span>
                    {currentPaymentStatus}
                  </span>
                </div>
              </div>

              {/* Items Ordered Section */}
              {order?.OrderDetails?.OrderItemList &&
                order.OrderDetails.OrderItemList.length > 0 && (
                  <div className="py-5 border-b border-line space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">
                      Items Ordered
                    </div>
                    {order.OrderDetails.OrderItemList.map(
                      (item: any, index: number) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-1"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-surface flex items-center justify-center overflow-hidden border border-line">
                              {item.ProductImageURL ? (
                                <img
                                  src={item.ProductImageURL}
                                  alt={item.ProductName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Icon.ShoppingBag
                                  size={20}
                                  className="text-secondary"
                                />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-semibold">
                                {item.ProductName}
                              </div>
                              <div className="text-xs text-secondary">
                                {item.VariantName || ""} {item.Quantity} ×{" "}
                                {formatRsPrice(item.Amount)}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm font-semibold sm:text-right">
                            {formatRsPrice(
                              item.TotalAmount || item.Quantity * item.Amount,
                            )}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                )}

              {/* Payment Summary */}
              {/* Payment Summary */}
              <div className="pt-5 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">
                  Payment Summary
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-secondary">Subtotal</span>
                  <span className="font-medium">
                    {formatRsPrice(order?.OrderAmount || subtotalVal)}
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
                      <div className="flex justify-between items-center text-sm text-green-600">
                        <span className="text-secondary"> Discount</span>
                        <span className="font-bold text-green">
                          -{formatRsPrice(saleDisc)}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

                {(() => {
                  const promoDisc =
                    orderAny?.PromoCodeValue ?? orderAny?.PromoDiscount ?? 0;
                  if (promoDisc > 0) {
                    return (
                      <div className="flex justify-between items-center text-sm text-green-600">
                        <span className="text-secondary">
                          Promo Code{" "}
                          {orderAny?.PromoCode ? `(${orderAny.PromoCode})` : ""}
                        </span>
                        <span className="font-medium">
                          -{formatRsPrice(promoDisc)}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* 3. Payment Method Discount */}
                {(() => {
                  const pmDisc = orderAny?.PaymentMethodDiscount ?? 0;
                  if (pmDisc > 0) {
                    return (
                      <div className="flex justify-between items-center text-sm text-green-600">
                        <span className="text-secondary">
                          Payment Method Discount
                        </span>
                        <span className="font-medium">
                          -{formatRsPrice(pmDisc)}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* 4. Order Value Discount */}
                {(() => {
                  const ovDisc = orderAny?.OrderValueDiscount ?? 0;
                  if (ovDisc > 0) {
                    return (
                      <div className="flex justify-between items-center text-sm text-green-600">
                        <span className="text-secondary">
                          Order Value Discount
                        </span>
                        <span className="font-medium">
                          -{formatRsPrice(ovDisc)}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="flex justify-between items-center pt-4 border-t border-line text-base font-bold">
                  <span>Net Amount</span>
                  <span className="text-black">
                    {formatRsPrice(netAmountVal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons Section */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full">
              <Link
                href={
                  !isPaid && resolvedOrderId
                    ? `/order/${resolvedOrderId}?pay=1`
                    : "/my-account"
                }
                className="block w-full flex-1 text-center py-3.5 bg-[#1C1C1C] text-white rounded-3xl font-medium hover:bg-black transition-colors shadow-sm"
              >
                {!isPaid && resolvedOrderId
                  ? "Back to order & pay again"
                  : "View order details"}
              </Link>
              <Link
                href="/"
                className="block w-full flex-1 text-center py-3.5 bg-white text-black rounded-3xl border border-line hover:border-black transition-colors font-medium shadow-sm"
              >
                Continue shopping
              </Link>
            </div>

            {/* Support Footer */}
            <div className="text-center mt-6 text-xs text-secondary">
              Questions about your order?{" "}
              <Link
                href="/contact"
                className="underline font-medium text-black"
              >
                Contact support
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StripePaymentResponsePage = () => {
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
            Loading payment confirmation...
          </div>
        }
      >
        <StripePaymentResponseContent />
      </Suspense>

      <Footer />
    </>
  );
};

export default StripePaymentResponsePage;
