import React, { useEffect, useState } from "react";
import { 
  View, Text, TextInput, FlatList, Image, TouchableOpacity, 
  StyleSheet, Alert, Modal
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../firebaseConfig"; 
import { signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc,  collection, onSnapshot } from "firebase/firestore";
import { useCart } from "./CartContext";
import { getAuth } from "firebase/auth";


export default function UserPage() {
  const router = useRouter();

  // User state
  const [userName, setUserName] = useState("");

  const { cart, updateCart } = useCart();  // Use global cart state
  const totalCartItems = Object.values(cart).reduce((acc, qty) => acc + qty, 0);

  const handleCartNavigation = () => {
    router.push("/cart");  // No need to pass cart in URL anymore!
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("Regular");
  const [showScheduledModal, setShowScheduledModal] = useState(false);
  interface Product {
    id: string;
    name: string;
    price: number;
    count: number;
    imageUrl: string;
    isDiscounted: boolean;
    isGrowing: boolean;
    shelfLife: number;
    createdAt: any;
  }
  
  const [products, setProducts] = useState<Product[]>([]);
  

  const [scheduledItems, setScheduledItems] = useState([]);

  // fetch user data from firestore
  useEffect(() => {
    const db = getFirestore();
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const fetchedProducts = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "Unnamed",
          price: data.price || 0,
          count: data.count || 0,
          imageUrl: data.imageUrl || "",
          isDiscounted: data.isDiscounted || false,
          isGrowing: data.isGrowing || false,
          shelfLife: data.shelfLife || 0,
          createdAt: data.createdAt || new Date(),
        };
      });
      setProducts(fetchedProducts);
    });
    
  
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      Alert.alert("Sign Out Failed", "Something went wrong. Please try again.");
    }
  };
  useEffect(() => {
    const fetchUserName = async () => {
      const auth = getAuth();
      const user = auth.currentUser; // get the logged-in user
      if (user) {
        const db = getFirestore();
        const userRef = doc(db, "users", user.uid); // match user by UID
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserName(userSnap.data().name); //  set username from firestore
        }
      }
    };

  fetchUserName();
}, []);

  const filteredProducts = products.filter(
    (item) =>
      (selectedTab === "Regular" ? !item.isDiscounted : item.isDiscounted) &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
      <Text style={styles.welcomeText}>Welcome, {userName ? String(userName) : "User"}!</Text>
        <View style={styles.iconContainer}>
          {/* Cart Icon */}
          <TouchableOpacity style={styles.iconButton} onPress={handleCartNavigation}>
            <Ionicons name="cart" size={24} color="white" />
            {totalCartItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{String(totalCartItems)}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Scheduled Items */}
          <TouchableOpacity style={styles.iconButton} onPress={() => setShowScheduledModal(true)}>
            <Ionicons name="calendar" size={24} color="white" />
          </TouchableOpacity>

          {/* Sign Out */}
          <TouchableOpacity style={styles.iconButton} onPress={handleSignOut}>
            <Ionicons name="log-out" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === "Regular" && styles.activeTab]}
          onPress={() => setSelectedTab("Regular")}
        >
          <Text style={[styles.tabText, selectedTab === "Regular" && styles.activeTabText]}>Regular</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === "MisFit" && styles.activeTab]}
          onPress={() => setSelectedTab("MisFit")}
        >
          <Text style={[styles.tabText, selectedTab === "MisFit" && styles.activeTabText]}>MisFit</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.searchBar}
        placeholder="Search for products..."
        placeholderTextColor="#FFA500"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Image source={{ uri: item.imageUrl }} style={styles.productImage} />

            <View>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>${Number(item.price).toFixed(2)}</Text>
              <View style={styles.cartButtons}>
                <TouchableOpacity onPress={() => updateCart(item.id, -1)} style={styles.button}>
                  <Text style={styles.buttonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{String(cart[item.id] || 0)}</Text>
                <TouchableOpacity onPress={() => updateCart(item.id, 1)} style={styles.button}>
                  <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      {/* Modal */}
      <Modal transparent visible={showScheduledModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Scheduled Pickups</Text>
            {/* {scheduledItems.map((item) => (
              <View key={item.id} style={styles.pickupItem}>
                <Text>{item.name}</Text>
                <Text>{item.date} at {item.time}</Text>
              </View>
            ))} */}
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowScheduledModal(false)}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

       {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => Alert.alert("About Us", "We connect farmers with consumers directly!")}>
          <Text style={styles.footerText}>About Us</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert("Contact Us", "Email: support@farmersmarket.com")}>
          <Text style={styles.footerText}>| Contact Us |</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert("Terms & Conditions", "By using this platform, you agree to abide by our terms and conditions. Please be respectful to others.")}>
          <Text style={styles.footerText}>Terms & Conditions</Text>
        </TouchableOpacity>
      </View>
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6F4C8", padding: 20 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, marginTop: 50 },

  welcomeText: { fontSize: 22, fontWeight: "bold" },

  iconContainer: { flexDirection: "row" },

  iconButton: { backgroundColor: "#FFA500", padding: 10, borderRadius: 8, marginLeft: 10 },

  cartBadge: { position: "absolute", top: -5, right: -5, backgroundColor: "red", borderRadius: 10, paddingHorizontal: 6 },

  cartBadgeText: { color: "white", fontSize: 12, fontWeight: "bold" },

  searchBar: { backgroundColor: "#FFF", padding: 10, borderRadius: 8, marginBottom: 20, fontSize: 16 },

  noResultsText: { textAlign: "center", fontSize: 18, fontWeight: "bold", color: "#555" },

  productCard: { 
    flexDirection: "row", 
    backgroundColor: "#FFF", 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15, 
    alignItems: "center" 
  },

  productImage: { width: 60, height: 60, marginRight: 15 },

  productName: { fontSize: 18, fontWeight: "bold" },

  productPrice: { fontSize: 16, color: "#555" },

  cartButtons: { flexDirection: "row", alignItems: "center", marginTop: 5 },

  button: { backgroundColor: "#FFA500", padding: 8, borderRadius: 5, marginHorizontal: 5 },

  buttonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },

  counterValue: { fontSize: 18, fontWeight: "bold" },

  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },

  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%", alignItems: "center" },

  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },

  modalCloseButton: { marginTop: 10, padding: 10, backgroundColor: "#FF4C4C", borderRadius: 5 },

  modalCloseButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },

  pickupItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc", width: "100%", textAlign: "center" },

  footer: { flexDirection: "row", justifyContent: "center", backgroundColor: "#FFA500", padding: 10, borderRadius: 10, marginTop: 20 },

  footerText: { color: "#FFF", fontSize: 14, marginHorizontal: 5 },
  backButton: { padding: 10, marginRight: 10 },

  tabContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 10 },

  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#ccc",
  },

  activeTab: { backgroundColor: "#FFA500" },

  tabText: { fontSize: 16, fontWeight: "bold", color: "black" },

  activeTabText: { color: "white" },

 });
