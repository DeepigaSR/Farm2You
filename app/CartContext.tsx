import React, { createContext, useContext, useState } from "react";

interface CartContextType {
  cart: Record<string, number>;
  setCart: React.Dispatch<React.SetStateAction<Record<string, number>>>; // Added setCart
  updateCart: (id: string, change: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Record<string, number>>({});

  const updateCart = (id: string, change: number) => {
    setCart((prevCart) => {
      const newQuantity = (prevCart[id] || 0) + change;

      if (newQuantity <= 0) {
        // Remove item completely from the cart when quantity reaches 0
        const updatedCart = { ...prevCart };
        delete updatedCart[id];
        return updatedCart;
      }

      return {
        ...prevCart,
        [id]: newQuantity,
      };
    });
  };

  return (
    <CartContext.Provider value={{ cart, setCart, updateCart }}> {/* Added setCart */}
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartProvider;
