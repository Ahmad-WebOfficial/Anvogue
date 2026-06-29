import api from "@/lib/api";
import { getCartSessionId } from "@/lib/cart";
import { isAuthenticated } from "@/lib/auth";

export interface ShippingDetailPayload {
  FullName: string;
  EmailAddress: string;
  Phone: string;
  CityId: number;
  CountryId: number;
  StateId: number;
  Address: string;
  ISOCode: string;
  City: string;
  AddressBookId: number;
  Longitude: string;
  Latitude: string;
}

export interface BillingDetailPayload {
  EmailAddress: string;
  Phone: string;
  FullName: string;
}

export interface CreateOrderPayload {
  IsGiftOrder: boolean;
  ShippingDetail: ShippingDetailPayload;
  BillingDetail: BillingDetailPayload;
  SessionId: string;
  BranchId: number;
  DeliveryDate: string;
  ISOCode: string;
  PhoneCode: string;
  IsAddNewAddress: boolean;
  DeliveryOption: number;
  SpecialInstructions: string;
  DeliveryInstructions: string;
  OrderSource: number;
  CityId: number;
  CountryId: number;
}

export interface CreateOrderFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  countryId: string;
  stateId: string;
  cityId: string;
  cityName: string;
  areaId: string;
  branchId: string;
  specialInstructions: string;
  deliveryInstructions: string;
  isGiftOrder: boolean;
  deliveryOption: number;
  isoCode: string;
  phoneCode: string;
  deliveryDate: string;
}

export interface OrderItem {
  OrderDetailId: number;
  ProductId: number;
  ProductName: string;
  ProductDetailId: number;
  Amount: number;
  DiscountAmount: number | null;
  TotalAmount: number;
  VariantName: string;
  Quantity: number;
  ProductImageURL: string | null;
}

export interface OrderShippingDetails {
  FullName: string;
  Phone: string;
  Country: string;
  City: string;
  Area: string | null;
  CityId: number;
  AreaId: number | null;
  Address: string;
  Longitude: string;
  Latitude: string;
}

export interface OrderBillingDetails {
  EmailAddress: string;
  Phone: string;
  FullName: string | null;
}

export interface OrderDetailData {
  OrderId: number;
  OrderNumber: string;
  UserId: number;
  BranchId: number;
  BranchName: string;
  OrderAmount: number;
  DeliveryCharges: number;
  TotalItems: number;
  ProductDetailIds: number[];
  NetAmount: number;
  Status: number;
  OrderStatusDisplayName: string;
  DeliveryDate: string;
  OrderShippingDetails: OrderShippingDetails;
  OrderBillingDetails: OrderBillingDetails;
  OrderDetails: {
    OrderItemList: OrderItem[];
  };
  IsGiftOrder: boolean;
  SpecialInstructions: string;
  DeliveryInstructions: string;
  DeliveryOption: number;
  PaymentStatusDisplayName: string;
  PaymentStatus: number;
  PaymentMethodName: string;
  CustomerFullName: string;
  PromoCode: string | null;
  NetDiscount: number;
}

export interface PaymentGateway {
  PGId: number;
  Name: string;
}

export interface SelectPaymentData {
  OrderDto: OrderDetailData;
  PaymentMethodCampaignList: unknown[];
  PaymentGateways: PaymentGateway[];
  RewardPointsAllowed: boolean;
}

interface ApiResponse<T> {
  Data?: T;
  Message?: string;
  Type?: string;
  HttpStatusCode?: number;
}

export type CreateOrderResponse = ApiResponse<unknown>;

export function extractOrderId(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;

  const record = data as Record<string, unknown>;
  const orderId = record.OrderId;

  if (typeof orderId === "number" && !Number.isNaN(orderId)) return orderId;
  if (typeof orderId === "string" && orderId.trim()) {
    const parsed = Number(orderId);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

export function buildCreateOrderPayload(
  values: CreateOrderFormValues,
): CreateOrderPayload {
  const fullName = `${values.firstName.trim()} ${values.lastName.trim()}`.trim();

  return {
    IsGiftOrder: values.isGiftOrder,
    ShippingDetail: {
      FullName: fullName,
      EmailAddress: values.email.trim(),
      Phone: values.phone.trim(),
      CityId: Number(values.cityId) || 0,
      CountryId: Number(values.countryId) || 0,
      StateId: Number(values.stateId) || 0,
      Address: [values.address.trim(), values.postalCode.trim()]
        .filter(Boolean)
        .join(", "),
      ISOCode: values.isoCode || "PK",
      City: values.cityName || "",
      AddressBookId: 0,
      Longitude: "",
      Latitude: "",
    },
    BillingDetail: {
      EmailAddress: values.email.trim(),
      Phone: values.phone.trim(),
      FullName: fullName,
    },
    SessionId: isAuthenticated() ? "" : getCartSessionId(),
    BranchId: Number(values.branchId) || 0,
    DeliveryDate: values.deliveryDate
      ? new Date(values.deliveryDate).toISOString()
      : new Date().toISOString(),
    ISOCode: values.isoCode || "PK",
    PhoneCode: values.phoneCode || "+92",
    IsAddNewAddress: true,
    DeliveryOption: values.deliveryOption || 1,
    SpecialInstructions: values.specialInstructions.trim(),
    DeliveryInstructions: values.deliveryInstructions.trim(),
    OrderSource: 1,
    CityId: Number(values.cityId) || 0,
    CountryId: Number(values.countryId) || 0,
  };
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<CreateOrderResponse> {
  const response = await api.post<CreateOrderResponse>(
    "/api/v1/Order/create",
    payload,
  );
  return response.data;
}

export async function fetchCustomerOrderDetails(
  orderId: number,
): Promise<OrderDetailData> {
  const response = await api.get<ApiResponse<OrderDetailData>>(
    "/api/v1/Order/GetCustomerOrderDetails",
    { params: { OrderId: orderId } },
  );

  if (!response.data?.Data) {
    throw new Error("Order details not found.");
  }

  return response.data.Data;
}

export async function fetchSelectPayment(
  orderId: number,
): Promise<SelectPaymentData> {
  const response = await api.get<ApiResponse<SelectPaymentData>>(
    "/api/v1/Order/SelectPayment",
    { params: { OrderId: orderId } },
  );

  if (!response.data?.Data) {
    throw new Error("Payment options not found.");
  }

  return response.data.Data;
}

export async function cancelCustomerOrder(orderId: number): Promise<string> {
  const response = await api.post<ApiResponse<unknown>>(
    "/api/v1/Order/CancelCustomerOrder",
    null,
    { params: { OrderId: orderId } },
  );

  return response.data?.Message || "Order cancelled successfully.";
}

export function getDeliveryOptionLabel(option: number): string {
  switch (option) {
    case 1:
      return "Home Delivery";
    case 2:
      return "Store Pickup";
    default:
      return "Standard Delivery";
  }
}

export function formatOrderDate(date: string): string {
  try {
    return new Date(date).toLocaleString("en-PK", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return date;
  }
}
