export const loadCartFromStorage = () => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure it's always an array
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error("Error loading cart from storage:", error);
      // Clear corrupted data
      localStorage.removeItem("cart");
    }
  }
  return [];
};

export const saveCartToStorage = (cartItems: any[]) => {
  console.log(cartItems);
  if (typeof window !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }
};
