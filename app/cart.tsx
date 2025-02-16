import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useCart } from "./CartContext"; 
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export default function CartScreen() {
  const router = useRouter();
  const { cart, updateCart } = useCart();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const fetchItemsByIds = async (itemsWithQty: Record<string, number>) => {
      const itemIds = Object.keys(itemsWithQty);
      if (itemIds.length === 0) return [];

      try {
        const itemsCollection = collection(db, "products");
        const q = query(itemsCollection, where("__name__", "in", itemIds));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "Unknown",
          price: doc.data().price || 0,
          imageUrl: doc.data().imageUrl || "",
          quantity: itemsWithQty[doc.id] || 1, 
        })) as CartItem[];
      } catch (error) {
        console.error("Error fetching items:", error);
        return [];
      }
    };

    const fetchData = async () => {
      const data = await fetchItemsByIds(cart);
      setCartItems(data);
    };

    fetchData();
  }, [cart]); 

  const totalAmount = cartItems
    .reduce((total, item) => total + item.price * item.quantity, 0)
    .toFixed(2);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 Your Cart</Text>

      {cartItems.length > 0 ? (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id.toString()} 
          renderItem={({ item }: { item: CartItem }) => (
            <View style={styles.cartItem}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{`$${item.price.toFixed(2)} x ${item.quantity}`}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  updateCart(item.id, -1);
                  if (cart[item.id] === 1) {
                    setCartItems(cartItems.filter(cartItem => cartItem.id !== item.id));
                  }
                }}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>🗑</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text style={styles.emptyCartText}>Your cart is empty. 🛍</Text>
      )}

      <Text style={styles.totalText}>{`Total: $${totalAmount}`}</Text>

      <TouchableOpacity style={styles.checkoutButton} onPress={() => router.push("/user")}>
        <Text style={styles.checkoutButtonText}>Continue Shopping</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.proceedButton} onPress={() => router.push("/checkout")}>
        <Text style={styles.proceedButtonText}>Proceed to Checkout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F4C8",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 40,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: 60,
    height: 60,
    marginRight: 15,
    borderRadius: 5,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemPrice: {
    fontSize: 16,
    color: "#555",
  },
  removeButton: {
    backgroundColor: "#FF4C4C",
    padding: 8,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyCartText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  checkoutButton: {
    backgroundColor: "#FFA500",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  proceedButton: {
    backgroundColor: "#008000",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  proceedButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

