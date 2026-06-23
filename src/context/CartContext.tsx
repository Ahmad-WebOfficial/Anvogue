"use client";

import api from "@/lib/api";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { ProductType } from "@/type/ProductType";
import toast from "react-hot-toast";
import {
  addProductToCart,
  ApiCartItem,
  CartSummary,
  fetchCurrentCart,
  getCartItemId,
} from "@/lib/cart";
import { getApiErrorMessage } from "@/lib/api";

export interface CartLineItem extends ProductType {
  quantity: number;
  cartId: string;
  selectedSize: string;
  selectedColor: string;
  apiItem?: ApiCartItem;
}

interface CartState {
  cartArray: CartLineItem[];
  subTotal: number;
  totalAmount: number;
  totalItems: number;
}

type CartAction =
  | { type: "SET_CART"; payload: CartSummary }
  | {
      type: "UPDATE_CART";
      payload: {
        itemId: string;
        quantity: number;
        selectedSize: string;
        selectedColor: string;
      };
    };

interface CartContextProps {
  cartState: CartState;
  cartLoading: boolean;
  addToCart: (item: ProductType) => Promise<void>;
  removeFromCart: (cartId: string) => Promise<void>;
  updateCart: (
    itemId: string,
    quantity: number,
    selectedSize: string,
    selectedColor: string,
  ) => void;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

const initialState: CartState = {
  cartArray: [],
  subTotal: 0,
  totalAmount: 0,
  totalItems: 0,
};

function mapSummaryToCartState(summary: CartSummary): CartState {
  return {
    subTotal: summary.subTotal,
    totalAmount: summary.totalAmount,
    totalItems: summary.totalItems,
    cartArray: summary.items.map((apiItem) => ({
      id: String(apiItem.ProductId),
      productDetailId: apiItem.ProductDetailId,
      category: "",
      type: "product",
      name: apiItem.ProductName || apiItem.Name || "Product",
      gender: "",
      new: false,
      sale: false,
      rate: 5,
      price: apiItem.Price ?? apiItem.UnitPrice ?? 0,
      originPrice: apiItem.Price ?? apiItem.UnitPrice ?? 0,
      brand: "",
      sold: 0,
      quantity: apiItem.Quantity ?? 1,
      quantityPurchase: apiItem.Quantity ?? 1,
      sizes: apiItem.VariantName ? [apiItem.VariantName] : [],
      variation: [],
      thumbImage: [
        apiItem.ThumbnailImagePath ||
          apiItem.IconImagePath ||
          "/images/product/1000x1000.png",
      ],
      images: [
        apiItem.ThumbnailImagePath ||
          apiItem.IconImagePath ||
          "/images/product/1000x1000.png",
      ],
      description: apiItem.VariantName || "",
      action: "add to cart",
      slug: String(apiItem.ProductId),
      cartId: getCartItemId(apiItem),
      selectedSize: apiItem.VariantName || "",
      selectedColor: "",
      apiItem,
    })),
  };
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "SET_CART":
      return mapSummaryToCartState(action.payload);
    case "UPDATE_CART":
      return {
        ...state,
        cartArray: state.cartArray.map((item) =>
          item.cartId === action.payload.itemId ||
          item.id === action.payload.itemId
            ? {
                ...item,
                quantity: action.payload.quantity,
                quantityPurchase: action.payload.quantity,
                selectedSize: action.payload.selectedSize,
                selectedColor: action.payload.selectedColor,
                apiItem: item.apiItem
                  ? { ...item.apiItem, Quantity: action.payload.quantity }
                  : item.apiItem,
              }
            : item,
        ),
      };
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartState, dispatch] = useReducer(cartReducer, initialState);
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    setCartLoading(true);
    try {
      const summary = await fetchCurrentCart();
      dispatch({ type: "SET_CART", payload: summary });
    } catch (error) {
      console.error("Fetch cart error:", error);
    } finally {
      setCartLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  const addToCart = async (item: ProductType) => {
    const productId = Number(item.id);
    const productDetailId = Number(item.productDetailId);
    const quantity = item.quantityPurchase ?? 1;

    if (!productId || Number.isNaN(productId)) {
      toast.error("Invalid product.");
      return;
    }

    if (!productDetailId || Number.isNaN(productDetailId)) {
      toast.error("Please select a product variant before adding to cart.");
      return;
    }

    try {
      await addProductToCart(productId, productDetailId, quantity);
      await fetchCart();
      toast.success("Product added to cart!");
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Failed to add product to cart.",
      );
      toast.error(message);
      throw error;
    }
  };

  const removeFromCart = async (cartId: string) => {
    try {
      await api.delete(`/api/v1/Cart/DeleteItemFromCart/remove/${cartId}`);
      await fetchCart();
      toast.success("Item removed successfully!");
    } catch (error) {
      const message = getApiErrorMessage(error, "Failed to remove item.");
      toast.error(message);
    }
  };

  const updateCart = (
    itemId: string,
    quantity: number,
    selectedSize: string,
    selectedColor: string,
  ) => {
    if (quantity < 1) return;

    dispatch({
      type: "UPDATE_CART",
      payload: { itemId, quantity, selectedSize, selectedColor },
    });
  };

  return (
    <CartContext.Provider
      value={{
        cartState,
        cartLoading,
        addToCart,
        removeFromCart,
        updateCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
