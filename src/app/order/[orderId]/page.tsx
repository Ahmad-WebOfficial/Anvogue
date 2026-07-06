"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { formatRsPrice } from "@/lib/cart";
import { useRouter } from "next/navigation";
import {
  cancelCustomerOrder,
  fetchCustomerOrderDetails,
  fetchSelectPayment,
  formatOrderDate,
  getDeliveryOptionLabel,
  getPaymentPortalUrl,
  getStripePaymentReturnUrl,
  OrderDetailData,
  payInvoice,
  PaymentGateway,
  savePendingPaymentOrderId,
  savePendingPaymentTransactionId,
  SelectPaymentData,
} from "@/lib/order";
import { getProductDetailUrl } from "@/lib/featured-products";
import { getApiErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";

const OrderDetailsPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = Number(params.orderId);
  const autopayTriggered = useRef(false);

  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [paymentData, setPaymentData] = useState<SelectPaymentData | null>(
    null,
  );
  const [selectedGateway, setSelectedGateway] = useState<number | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const [paying, setPaying] = useState(false);
  const router = useRouter();

  const loadOrder = async () => {
    if (!orderId || Number.isNaN(orderId)) {
      setError("Invalid order ID.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderDetails = await fetchCustomerOrderDetails(orderId);
      setOrder(orderDetails);

      try {
        const paymentOptions = await fetchSelectPayment(orderId);
        setPaymentData(paymentOptions);

        if (paymentOptions.PaymentGateways.length > 0) {
          setSelectedGateway(paymentOptions.PaymentGateways[0].PGId);
        }
      } catch (paymentErr) {
        console.error("Failed to load payment options:", paymentErr);
        toast.error(
          getApiErrorMessage(
            paymentErr,
            "Payment methods could not be loaded.",
          ),
        );
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load order details."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrder();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!order || isCancelled) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );
    if (!confirmed) return;

    setCancelling(true);
    try {
      const message = await cancelCustomerOrder(order.OrderId);
      toast.success(message);
      setIsCancelled(true);
      await loadOrder();
      router.push("/");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to cancel order."));
    } finally {
      setCancelling(false);
    }
  };

  const displayOrder = paymentData?.OrderDto ?? order;
  const gateways = paymentData?.PaymentGateways ?? [];
  const items = displayOrder?.OrderDetails?.OrderItemList ?? [];

  const handleSelectPayment = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway.PGId);
    toast.success(`${gateway.Name} selected as payment method.`);
  };

  const processPayment = useCallback(
    async (gatewayId?: number | null) => {
      const currentOrder = paymentData?.OrderDto ?? order;
      const gatewayList = paymentData?.PaymentGateways ?? [];
      const resolvedGatewayId =
        gatewayId ?? selectedGateway ?? gatewayList[0]?.PGId ?? null;

      if (!currentOrder) {
        toast.error("Order details are not available.");
        return;
      }

      if (!resolvedGatewayId) {
        toast.error("Please select a payment method first.");
        return;
      }

      if (!selectedGateway) {
        setSelectedGateway(resolvedGatewayId);
      }

      setPaying(true);
      try {
        const paymentResult = await payInvoice({
          OrderId: currentOrder.OrderId,
          OrderAmount: currentOrder.NetAmount,
          TenantPaymentGatewayId: resolvedGatewayId,
          PaymentGateway: resolvedGatewayId,
          ReturnUrl: getStripePaymentReturnUrl(),
        });

        const paymentUrl = getPaymentPortalUrl(paymentResult);
        if (!paymentUrl) {
          toast.error("Payment URL not received. Please try again.");
          return;
        }

        savePendingPaymentOrderId(currentOrder.OrderId);
        const transactionId = paymentResult.Transaction?.TransactionID?.trim();
        if (transactionId) {
          savePendingPaymentTransactionId(transactionId);
        }
        window.open(paymentUrl, "_blank", "noopener,noreferrer");
        toast.success("Redirecting to payment gateway...");
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to process payment."));
      } finally {
        setPaying(false);
      }
    },
    [order, paymentData, selectedGateway],
  );

  const handlePayNow = () => {
    void processPayment();
  };

  useEffect(() => {
    const shouldAutopay = searchParams.get("pay") === "1";
    if (
      !shouldAutopay ||
      autopayTriggered.current ||
      loading ||
      paying ||
      !(paymentData?.OrderDto ?? order)
    ) {
      return;
    }

    const gatewayList = paymentData?.PaymentGateways ?? [];
    if (gatewayList.length === 0) return;

    autopayTriggered.current = true;
    void processPayment(gatewayList[0].PGId);
  }, [loading, paying, order, paymentData, processPayment, searchParams]);

  const canPay = gateways.length > 0 && !isCancelled;

  return (
    <>
      <TopNavOne
        props="style-one bg-black"
        slogan="New customers save 10% with the code GET10"
      />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Order Details" subHeading="Order Details" />
      </div>

      <div className="md:py-16 py-10">
        <div className="container">
          {loading ? (
            <div className="text-center py-20 text-secondary">
              Loading order details...
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600 mb-4">{error}</p>
              <Link href="/" className="button-main inline-block">
                Back to Home
              </Link>
            </div>
          ) : displayOrder ? (
            <div className="flex flex-col xl:flex-row gap-8 xl:gap-10">
              {/* Main content */}
              <div className="w-full xl:w-2/3 space-y-6">
                {/* Order header */}
                <div className="bg-surface border border-line rounded-2xl p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="caption2 text-secondary uppercase">
                        Order Number
                      </div>
                      <h1 className="heading4 mt-1">
                        {displayOrder.OrderNumber}
                      </h1>
                      <p className="caption1 text-secondary mt-2">
                        Order ID: {displayOrder.OrderId}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="caption2 bg-black text-white px-3 py-1 rounded-full">
                        {displayOrder.OrderStatusDisplayName}
                      </span>
                      <span className="caption2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                        {displayOrder.PaymentStatusDisplayName}
                      </span>
                      {displayOrder.IsGiftOrder && (
                        <span className="caption2 bg-green text-white px-3 py-1 rounded-full">
                          Gift Order
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-line">
                    <div>
                      <div className="caption2 text-secondary">
                        Delivery Date
                      </div>
                      <div className="text-button mt-1">
                        {formatOrderDate(displayOrder.DeliveryDate)}
                      </div>
                    </div>
                    <div>
                      <div className="caption2 text-secondary">
                        Delivery Option
                      </div>
                      <div className="text-button mt-1">
                        {getDeliveryOptionLabel(displayOrder.DeliveryOption)}
                      </div>
                    </div>
                    <div>
                      <div className="caption2 text-secondary">Customer</div>
                      <div className="text-button mt-1">
                        {displayOrder.CustomerFullName ||
                          displayOrder.OrderShippingDetails?.FullName}
                      </div>
                    </div>
                    <div>
                      <div className="caption2 text-secondary">Total Items</div>
                      <div className="text-button mt-1">
                        {displayOrder.TotalItems}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-line rounded-2xl p-6">
                  <h2 className="heading6 mb-4">Order Items</h2>
                  <div className="space-y-4">
                    {items.map((item) => {
                      const image =
                        item.ProductImageURL &&
                        !item.ProductImageURL.includes("noImage")
                          ? item.ProductImageURL
                          : "/images/product/1000x1000.png";

                      return (
                        <div
                          key={item.OrderDetailId}
                          className="flex gap-4 pb-4 border-b border-line last:border-0 last:pb-0"
                        >
                          <Link
                            href={getProductDetailUrl(
                              item.ProductId,
                              item.ProductDetailId,
                            )}
                            className="w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden relative bg-surface"
                          >
                            <Image
                              src={image}
                              fill
                              sizes="80px"
                              alt={item.ProductName}
                              className="object-cover"
                            />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={getProductDetailUrl(
                                item.ProductId,
                                item.ProductDetailId,
                              )}
                              className="text-button font-semibold hover:underline line-clamp-2"
                            >
                              {item.ProductName}
                            </Link>
                            <div className="caption1 text-secondary mt-1">
                              Variant: {item.VariantName.replace(/,/g, ", ")}
                            </div>
                            <div className="caption2 text-secondary mt-0.5">
                              Product ID: {item.ProductId} · Detail:{" "}
                              {item.ProductDetailId}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="caption1">
                                Qty: {item.Quantity}
                              </span>
                              <span className="text-button font-semibold">
                                {formatRsPrice(item.TotalAmount)}
                              </span>
                            </div>
                            {item.Quantity > 1 && (
                              <div className="caption2 text-secondary">
                                {formatRsPrice(item.Amount)} each
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-surface border border-line rounded-2xl p-6">
                    <h3 className="heading6 mb-4">Shipping Address</h3>
                    <div className="space-y-2 caption1 text-secondary">
                      <p className="text-button text-black">
                        {displayOrder.OrderShippingDetails?.FullName}
                      </p>
                      <p>{displayOrder.OrderShippingDetails?.Phone}</p>
                      <p>{displayOrder.OrderShippingDetails?.Address}</p>
                      <p>
                        {displayOrder.OrderShippingDetails?.City},{" "}
                        {displayOrder.OrderShippingDetails?.Country}
                      </p>
                    </div>
                  </div>
                  <div className="bg-surface border border-line rounded-2xl p-6">
                    <h3 className="heading6 mb-4">Billing Details</h3>
                    <div className="space-y-2 caption1 text-secondary">
                      <p>
                        {displayOrder.OrderBillingDetails?.FullName ||
                          displayOrder.OrderShippingDetails?.FullName}
                      </p>
                      <p>{displayOrder.OrderBillingDetails?.EmailAddress}</p>
                      <p>{displayOrder.OrderBillingDetails?.Phone}</p>
                    </div>
                  </div>
                </div>

                {(displayOrder.SpecialInstructions ||
                  displayOrder.DeliveryInstructions) && (
                  <div className="bg-surface border border-line rounded-2xl p-6">
                    <h3 className="heading6 mb-4">Instructions</h3>
                    {displayOrder.SpecialInstructions && (
                      <div className="mb-3">
                        <div className="caption2 text-secondary">
                          Special Instructions
                        </div>
                        <p className="caption1 mt-1">
                          {displayOrder.SpecialInstructions}
                        </p>
                      </div>
                    )}
                    {displayOrder.DeliveryInstructions && (
                      <div>
                        <div className="caption2 text-secondary">
                          Delivery Instructions
                        </div>
                        <p className="caption1 mt-1">
                          {displayOrder.DeliveryInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {gateways.length > 0 && (
                  <div className="bg-white border border-line rounded-2xl p-6">
                    <h2 className="heading6 mb-1">Select Payment Method</h2>
                    <p className="caption1 text-secondary mb-4">
                      Choose a payment gateway to proceed with your order
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {gateways.map((gateway) => (
                        <button
                          type="button"
                          key={gateway.PGId}
                          onClick={() => handleSelectPayment(gateway)}
                          className={`p-4 rounded-xl border text-button transition-all ${selectedGateway === gateway.PGId ? "border-black bg-black text-white" : "border-line hover:border-black"}`}
                        >
                          {gateway.Name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center items-center w-full">
                  <button
                    type="button"
                    onClick={handlePayNow}
                    disabled={paying || !canPay}
                    className="button-main bg-black inline-flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto px-6 py-4 rounded-full text-white"
                  >
                    <Icon.CreditCard size={18} />
                    {paying ? "Processing Payment..." : "Pay Now"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCancelOrder()}
                    disabled={cancelling || isCancelled}
                    className="w-full sm:w-auto px-6 py-3 rounded-full border border-red text-red hover:bg-red hover:text-white transition-colors disabled:opacity-50 flex justify-center items-center text-center"
                  >
                    {cancelling
                      ? "Cancelling..."
                      : isCancelled
                        ? "Order Cancelled"
                        : "Cancel Order"}
                  </button>
                  <Link
                    href="/"
                    className="w-full sm:w-auto px-6 py-3 rounded-full text-center border border-line 
               hover:border-black hover:bg-black hover:text-white 
               transition-all duration-300 flex justify-center items-center"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>

              <div className="w-full xl:w-1/3">
                <div className="bg-surface border border-line rounded-2xl p-6 sticky top-24">
                  <h2 className="heading6 mb-4">Order Summary</h2>

                  <div className="space-y-3">
                    <div className="flex justify-between caption1">
                      <span className="text-secondary">Order Amount</span>
                      <span>{formatRsPrice(displayOrder.OrderAmount)}</span>
                    </div>
                    <div className="flex justify-between caption1">
                      <span className="text-secondary">Delivery Charges</span>
                      <span>
                        {displayOrder.DeliveryCharges > 0
                          ? formatRsPrice(displayOrder.DeliveryCharges)
                          : "Free"}
                      </span>
                    </div>
                    {displayOrder.NetDiscount > 0 && (
                      <div className="flex justify-between caption1">
                        <span className="text-secondary">Discount</span>
                        <span className="text-green">
                          -{formatRsPrice(displayOrder.NetDiscount)}
                        </span>
                      </div>
                    )}
                    {displayOrder.PromoCode && (
                      <div className="flex justify-between caption1">
                        <span className="text-secondary">Promo Code</span>
                        <span>{displayOrder.PromoCode}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between heading5 pt-5 mt-5 border-t border-line">
                    <span>Net Amount</span>
                    <span>{formatRsPrice(displayOrder.NetAmount)}</span>
                  </div>

                  <p className="caption2 text-secondary text-center mt-4">
                    All amounts in PKR (Rs.)
                  </p>

                  {selectedGateway && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-line caption1 text-center">
                      Selected:{" "}
                      {gateways.find((g) => g.PGId === selectedGateway)?.Name}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handlePayNow}
                    disabled={paying || !canPay}
                    className="button-main w-full mt-4 bg-black disabled:opacity-50"
                  >
                    {paying ? "Processing Payment..." : "Proceed to Payment"}
                  </button>

                  {!selectedGateway && gateways.length > 0 && (
                    <p className="caption2 text-secondary text-center mt-2">
                      Select a payment method above to continue
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default OrderDetailsPage;
