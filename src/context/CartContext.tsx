"use client";
import api from "@/lib/api";
import React, { createContext, useContext, useReducer } from "react";
import { ProductType } from "@/type/ProductType";
import toast from "react-hot-toast"; // Import toast
interface CartItem extends ProductType {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

interface CartState {
  cartArray: CartItem[];
}

type CartAction =
  | { type: "ADD_TO_CART"; payload: ProductType }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | {
      type: "UPDATE_CART";
      payload: {
        itemId: string;
        quantity: number;
        selectedSize: string;
        selectedColor: string;
      };
    }
  | { type: "LOAD_CART"; payload: CartItem[] };

interface CartContextProps {
  cartState: CartState;
  addToCart: (item: ProductType) => void;
  removeFromCart: (itemId: string) => void;
  updateCart: (
    itemId: string,
    quantity: number,
    selectedSize: string,
    selectedColor: string,
  ) => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_TO_CART":
      const newItem: CartItem = {
        ...action.payload,
        quantity: 1,
        selectedSize: "",
        selectedColor: "",
      };
      return { ...state, cartArray: [...state.cartArray, newItem] };
    case "REMOVE_FROM_CART":
      return {
        ...state,
        cartArray: state.cartArray.filter((item) => item.id !== action.payload),
      };
    case "UPDATE_CART":
      return {
        ...state,
        cartArray: state.cartArray.map((item) =>
          item.id === action.payload.itemId
            ? {
                ...item,
                quantity: action.payload.quantity,
                selectedSize: action.payload.selectedSize,
                selectedColor: action.payload.selectedColor,
              }
            : item,
        ),
      };
    case "LOAD_CART":
      return { ...state, cartArray: action.payload };
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartState, dispatch] = useReducer(cartReducer, { cartArray: [] });
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;
  const getSessionId = () => {
    if (typeof window === "undefined") return "temp_session";
    let sid = localStorage.getItem("cart_session_id");
    if (!sid) {
      sid = "sess_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("cart_session_id", sid);
    }
    return sid;
  };

  const addToCart = async (item: ProductType) => {
    try {
      const sessionId = getSessionId();
      const url = `/api/v1/Cart/AddToCartGuest/session/${sessionId}/add`;

      const response = await api.post(url, null, {
        params: {
          ProductId: item.id,
          ProductDetailId: 0,
          Quantity: 1,
        },
      });

      dispatch({ type: "ADD_TO_CART", payload: item });
      toast.success("Product added to cart!");
    } catch (error: any) {
      console.error("Full Error Object:", error.response || error);
      alert(
        "Server Error: " + (error.response?.data?.message || "Check console"),
      );
    }
  };
  const removeFromCart = async (cartId: string) => {
    try {
      const response = await api.delete(
        `/api/v1/Cart/DeleteItemFromCart/remove/${cartId}`,
      );

      if (response.status === 200) {
        dispatch({ type: "REMOVE_FROM_CART", payload: cartId });
        toast.success("Item removed successfully!");
      }
    } catch (error: any) {
      console.error("Delete Error:", error.response || error);
      alert(
        "Delete Error: " + (error.response?.data?.message || "Check console"),
      );
    }
  };
  const updateCart = (
    itemId: string,
    quantity: number,
    selectedSize: string,
    selectedColor: string,
  ) =>
    dispatch({
      type: "UPDATE_CART",
      payload: { itemId, quantity, selectedSize, selectedColor },
    });

  return (
    <CartContext.Provider
      value={{ cartState, addToCart, removeFromCart, updateCart }}
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
