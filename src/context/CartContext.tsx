"use client";

import React, { createContext, useContext, useReducer } from "react";
import { ProductType } from "@/type/ProductType";

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
      const fullUrl = `${API_URL}/api/v1/Cart/AddToCartGuest/session/${sessionId}/add?ProductId=${item.id}&ProductDetailId=0&Quantity=1`;

      const formData = new FormData();
      formData.append("files", "");

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: { "api-security-key": API_KEY },
        body: formData,
      });

      if (response.ok) {
        dispatch({ type: "ADD_TO_CART", payload: item });
        alert("Success: Product added to cart!");
      } else {
        const errorText = await response.text();
        console.error("Server Error:", errorText);
        alert("Server Error: " + errorText);
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Connection Error: Check console.");
    }
  };
  const removeFromCart = async (cartId: string) => {
    try {
      const url = `${API_URL}/api/v1/Cart/DeleteItemFromCart/remove/${cartId}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "api-security-key": API_KEY,
        },
      });

      if (response.ok) {
        dispatch({ type: "REMOVE_FROM_CART", payload: cartId });
        alert("Success: Item removed Successful!");
      } else {
        const errorText = await response.text();
        console.error("Server Error:", errorText);
        alert("Error: " + errorText);
      }
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Delete Error: Check console.");
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
