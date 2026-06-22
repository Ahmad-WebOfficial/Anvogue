// "use client";
// import api from "@/lib/api";
// import React, { createContext, useContext, useReducer } from "react";
// import { ProductType } from "@/type/ProductType";
// import toast from "react-hot-toast"; // Import toast
// interface CartItem extends ProductType {
//   quantity: number;
//   selectedSize: string;
//   selectedColor: string;
// }

// interface CartState {
//   cartArray: CartItem[];
// }

// type CartAction =
//   | { type: "ADD_TO_CART"; payload: ProductType }
//   | { type: "REMOVE_FROM_CART"; payload: string }
//   | {
//       type: "UPDATE_CART";
//       payload: {
//         itemId: string;
//         quantity: number;
//         selectedSize: string;
//         selectedColor: string;
//       };
//     }
//   | { type: "LOAD_CART"; payload: CartItem[] };

// interface CartContextProps {
//   cartState: CartState;
//   addToCart: (item: ProductType) => void;
//   removeFromCart: (itemId: string) => void;
//   updateCart: (
//     itemId: string,
//     quantity: number,
//     selectedSize: string,
//     selectedColor: string,
//   ) => void;
// }

// const CartContext = createContext<CartContextProps | undefined>(undefined);

// const cartReducer = (state: CartState, action: CartAction): CartState => {
//   switch (action.type) {
//     case "ADD_TO_CART":
//       const newItem: CartItem = {
//         ...action.payload,
//         quantity: 1,
//         selectedSize: "",
//         selectedColor: "",
//       };
//       return { ...state, cartArray: [...state.cartArray, newItem] };
//     case "REMOVE_FROM_CART":
//       return {
//         ...state,
//         cartArray: state.cartArray.filter((item) => item.id !== action.payload),
//       };
//     case "UPDATE_CART":
//       return {
//         ...state,
//         cartArray: state.cartArray.map((item) =>
//           item.id === action.payload.itemId
//             ? {
//                 ...item,
//                 quantity: action.payload.quantity,
//                 selectedSize: action.payload.selectedSize,
//                 selectedColor: action.payload.selectedColor,
//               }
//             : item,
//         ),
//       };
//     case "LOAD_CART":
//       return { ...state, cartArray: action.payload };
//     default:
//       return state;
//   }
// };

// export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [cartState, dispatch] = useReducer(cartReducer, { cartArray: [] });
//   const API_URL = process.env.NEXT_PUBLIC_API_URL!;
//   const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;
//   const getSessionId = () => {
//     if (typeof window === "undefined") return "temp_session";
//     let sid = localStorage.getItem("cart_session_id");
//     if (!sid) {
//       sid = "sess_" + Math.random().toString(36).substr(2, 9);
//       localStorage.setItem("cart_session_id", sid);
//     }
//     return sid;
//   };

//   const addToCart = async (item: ProductType) => {
//     try {
//       const sessionId = getSessionId();
//       const url = `/api/v1/Cart/AddToCartGuest/session/${sessionId}/add`;

//       const response = await api.post(url, null, {
//         params: {
//           ProductId: item.id,
//           ProductDetailId: 0,
//           Quantity: 1,
//         },
//       });

//       dispatch({ type: "ADD_TO_CART", payload: item });
//       toast.success("Product added to cart!");
//     } catch (error: any) {
//       console.error("Full Error Object:", error.response || error);
//       alert(
//         "Server Error: " + (error.response?.data?.message || "Check console"),
//       );
//     }
//   };
//   const removeFromCart = async (cartId: string) => {
//     try {
//       const response = await api.delete(
//         `/api/v1/Cart/DeleteItemFromCart/remove/${cartId}`,
//       );

//       if (response.status === 200) {
//         dispatch({ type: "REMOVE_FROM_CART", payload: cartId });
//         toast.success("Item removed successfully!");
//       }
//     } catch (error: any) {
//       console.error("Delete Error:", error.response || error);
//       alert(
//         "Delete Error: " + (error.response?.data?.message || "Check console"),
//       );
//     }
//   };
//   const updateCart = (
//     itemId: string,
//     quantity: number,
//     selectedSize: string,
//     selectedColor: string,
//   ) =>
//     dispatch({
//       type: "UPDATE_CART",
//       payload: { itemId, quantity, selectedSize, selectedColor },
//     });

//   return (
//     <CartContext.Provider
//       value={{ cartState, addToCart, removeFromCart, updateCart }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };

// export const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) throw new Error("useCart must be used within a CartProvider");
//   return context;
// };

"use client";

import api from "@/lib/api";
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { ProductType } from "@/type/ProductType";
import toast from "react-hot-toast";
import axios from "axios";
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
  fetchCart: () => Promise<void>; // Naya method
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_TO_CART":
      return {
        ...state,
        cartArray: [
          ...state.cartArray,
          {
            ...action.payload,
            quantity: 1,
            selectedSize: "",
            selectedColor: "",
          },
        ],
      };
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
            ? { ...item, ...action.payload }
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

  const getSessionId = () => {
    if (typeof window === "undefined") return "temp_session";
    let sid = localStorage.getItem("cart_session_id");
    if (!sid) {
      sid = "sess_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("cart_session_id", sid);
    }
    return sid;
  };

  const fetchCart = async () => {
    try {
      const sessionId = getSessionId();
      const response = await api.get(
        `/api/v1/Cart/GetCart/session/${sessionId}`,
      );

      console.log("FULL API RESPONSE:", response.data);
      const items = response.data?.Data?.CartItemList || [];

      dispatch({ type: "LOAD_CART", payload: items });
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (item: ProductType) => {
    try {
      const sessionId = getSessionId();

      console.log("--- START ADD TO CART ---");
      console.log("SESSION ID:", sessionId);
      console.log("PRODUCT ID:", item.id);

      const url = `/api/v1/Cart/AddToCartGuest/session/${sessionId}/add`;
      console.log("FULL API URL:", url);

      const response = await api.post(url, null, {
        params: {
          ProductId: item.id,
          ProductDetailId: 0,
          Quantity: 1,
        },
      });

      // Server ka pura response log karein
      console.log("ADD RESPONSE DATA:", response.data);
      console.log("ADD RESPONSE STATUS:", response.status);

      // Fetch cart se pehle delay
      console.log("Waiting for 500ms before fetching...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("Fetching updated cart now...");
      await fetchCart();

      toast.success("Product added!");
      console.log("--- END ADD TO CART ---");
    } catch (error: any) {
      // Error ko detail mein log karein
      console.error("--- ADD ERROR DETECTED ---");
      if (error.response) {
        console.error("Error Response Data:", error.response.data);
        console.error("Error Status:", error.response.status);
        console.error("Error Headers:", error.response.headers);
      } else {
        console.error("Error Message:", error.message);
      }
    }
  };
  const removeFromCart = async (cartId: string) => {
    try {
      await api.delete(`/api/v1/Cart/DeleteItemFromCart/remove/${cartId}`);
      console.log("REMOVE RESPONSE:", response.data);
      await fetchCart();
      toast.success("Item removed!");
    } catch (error: any) {
      toast.error("Failed to remove item");
    }
  };

  const updateCart = async (
    cartItemId: string,
    quantity: number,
    selectedSize: string = "",
    selectedColor: string = "",
  ) => {
    try {
      const url = `/api/v1/Cart/UpdateCart/update-quantity/${cartItemId}`;

      await api.patch(url, null, {
        params: { quantity: quantity },
        headers: {
          "api-security-key": process.env.NEXT_PUBLIC_SECURITY_KEY,
        },
      });

      dispatch({
        type: "UPDATE_CART",
        payload: { itemId: cartItemId, quantity, selectedSize, selectedColor },
      });
      toast.success("Quantity updated!");
    } catch (error: any) {
      console.error("Update Error:", error);
      toast.error("Failed to update quantity");
    }
  };

  return (
    <CartContext.Provider
      value={{ cartState, addToCart, removeFromCart, updateCart, fetchCart }}
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
