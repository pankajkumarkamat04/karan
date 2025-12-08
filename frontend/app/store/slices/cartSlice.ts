import { loadCartFromStorage, saveCartToStorage } from "@/utils/localStorage/localStorage";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  cartItems: CartItem[];
}

const initialState: CartState = {
  cartItems: loadCartFromStorage(),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
        const existingItem = state.cartItems.find(item => item.id === action.payload.id);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          state.cartItems.push({ ...action.payload, quantity: 1 });
        }
        saveCartToStorage(state.cartItems);
      },

    incrementQty: (state, action: PayloadAction<string>) => {
      const item = state.cartItems.find((item) => item.id === action.payload);
      if (item) {
        item.quantity += 1;
        saveCartToStorage(state.cartItems);
      }
    },

    decrementQty: (state, action: PayloadAction<string>) => {
      const item = state.cartItems.find((item) => item.id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        saveCartToStorage(state.cartItems);
      } else {
        // Optional: Remove item if quantity goes to 0
        state.cartItems = state.cartItems.filter(
          (i) => i.id !== action.payload
        );
        saveCartToStorage(state.cartItems);
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.id !== action.payload
      );
      saveCartToStorage(state.cartItems);
    },

    clearCart: (state) => {
      state.cartItems = [];
      saveCartToStorage([]);
    },

    syncCartWithProduct: (state, action: PayloadAction<{
      id: string;
      name: string;
      price: number;
      image: string;
    }>) => {
      const { id, name, price, image } = action.payload;
      const cartItem = state.cartItems.find(item => item.id === id);
      
      if (cartItem) {
        // Update the cart item with new product details
        cartItem.name = name;
        cartItem.price = price;
        cartItem.image = image;
        // Keep the existing quantity
        saveCartToStorage(state.cartItems);
      }
    },
  },
});

export const {
  addToCart,
  incrementQty,
  decrementQty,
  removeFromCart,
  clearCart,
  syncCartWithProduct,
} = cartSlice.actions;

export default cartSlice.reducer;
