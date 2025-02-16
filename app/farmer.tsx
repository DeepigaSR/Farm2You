"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { Ionicons } from "@expo/vector-icons"
import type { NavigationProp, ParamListBase } from "@react-navigation/native"
import { format } from "date-fns";
import React from "react"
import { db } from "../firebaseConfig";
import { addDoc, collection, doc, query, where, getDocs, onSnapshot, Timestamp, updateDoc, deleteDoc, getFirestore, getDoc } from "firebase/firestore";
import { auth } from "../firebaseConfig"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import { Picker } from '@react-native-picker/picker';
import { RadioButton } from 'react-native-paper';
import WeatherScreen from "./weather"

interface GrowingItem {
  id: string
  name: string
  plantedDate: Date
  expectedHarvest: Date
  quantity: number
  notes: string
}//not used

interface Product {
  id: string
  name: string
  price: number
  count: number
  imageUrl: string
  farmer_id: string
  farmer_name: string
  isDiscounted?: boolean
  isGrowing?: boolean
  shelfLife: number
  createdAt: Timestamp
}

interface Order {
  id: string
  productId: number
  quantity: number
  status: "pending" | "delivered"
}

interface Props {
  navigation: NavigationProp<ParamListBase>
}

const SCREEN_WIDTH = Dimensions.get("window").width
const CARD_MARGIN = 10
const CARD_WIDTH = (SCREEN_WIDTH - 3 * CARD_MARGIN) / 2

const logout = async () => {
  console.log("Logging out...")
}

export default function FarmerScreen({ navigation }: Props) {
  const [modalVisible, setModalVisible] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productName, setProductName] = useState<string>("")
  const [productPrice, setProductPrice] = useState<string>("")
  const [productCount, setProductCount] = useState<string>("")
  const [productImage, setProductImage] = useState<string | null>(null)
  const [isDiscounted, setProductDiscounted] = useState<boolean>(false)
  const [farmerId, setProductFarmer] = useState<string>("")
  const [isGrowing, setProductGrowing] = useState<boolean>(false)
  // const [isSelling, setProductSelling] = useState<boolean>(false)
  const [productShelf, setProductShelf] = useState<string>(""); 
  const [createdAt, setProductCreated] = useState<Date | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<"home" | "products" | "discounted" | "weather">("home")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [showScheduledModal, setShowScheduledModal] = useState(false)
  const [userName, setUserName] = useState("");

  const resetForm = () => {
    setProductName("")
    setProductPrice("")
    setProductCount("")
    setProductImage(null)
    setEditingProduct(null)
  }

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const db = getFirestore();
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserName(userSnap.data().name || "User");
          }
        }
      });
      return () => unsubscribe();
    }, []);

  const [growingItems, setGrowingItems] = useState<GrowingItem[]>([
    {
      id: '1',
      name: 'Tomatoes',
      plantedDate: new Date('2025-01-15'),
      expectedHarvest: new Date('2025-03-15'),
      quantity: 100,
      notes: 'Cherry variety, greenhouse'
    },
    {
      id: '2',
      name: 'Lettuce',
      plantedDate: new Date('2025-02-01'),
      expectedHarvest: new Date('2025-03-01'),
      quantity: 200,
      notes: 'Romaine, outdoor beds'
    }
  ])//not used

  const [showGrowingModal, setShowGrowingModal] = useState(false)
  const [newGrowingItem, setNewGrowingItem] = useState<Partial<GrowingItem>>({})

  useEffect(() => {
    const fetchProductsWithFarmerNames = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.error("No authenticated user found");
          return;
        }
  
        const q = query(collection(db, "products"), where("farmer_email", "==", currentUser.email));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const productsWithNames: Product[] = [];
          querySnapshot.forEach((productDoc) => {
            const productData = productDoc.data();
            productsWithNames.push({
              id: productDoc.id,
              name: productData.name,
              price: productData.price,
              count: productData.count,
              imageUrl: productData.imageUrl,
              farmer_id: productDoc.id,
              farmer_name: productData.farmer_name || "Unknown",
              isDiscounted: productData.isDiscounted,
              isGrowing: productData.isGrowing,
              shelfLife: productData.shelfLife,
              createdAt: productData.createdAt,
            });
          });
          setProducts(productsWithNames);
          console.log("Products updated in real-time", productsWithNames);
        });
  
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching products with farmer names:", error);
      }
    };
  
    fetchProductsWithFarmerNames();
  }, []);

  const growingProducts = products.filter((product) => product.isGrowing);

  const handleAddGrowingItem = () => {
    if (!newGrowingItem.name ) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    setGrowingItems([...growingItems])
    setShowGrowingModal(false)
    setNewGrowingItem({})
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setProductName(product.name)
    setProductPrice(product.price.toString())
    setProductCount(product.count.toString())
    setProductImage(product.imageUrl)
    setProductDiscounted(product.isDiscounted ?? false);
    setProductFarmer(product.farmer_id);
    setProductGrowing(product.isGrowing ?? false);
    setProductShelf(product.shelfLife.toString()); 
    setProductCreated(product.createdAt.toDate()); 
    setModalVisible(true)
  }

  const handleAddProduct = async () => {
    if (!productName || !productPrice || !productCount || !productImage) {
      Alert.alert("Error", "Please fill in all fields and select an image.")
      return
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Error", "No authenticated user found.");
      return;
    }

    const userQuery = query(collection(db, "users"), where("email", "==", currentUser.email));
    const userSnapshot = await getDocs(userQuery);
    if (userSnapshot.empty) {
      Alert.alert("Error", "User not found.");
      return;
    }

    const farmerName = userSnapshot.docs[0].data().name;
  
    const newProduct = {
      name: productName,
      price: parseFloat(productPrice),
      count: parseInt(productCount),
      imageUrl: productImage,
      farmer_email: currentUser.email,
      farmer_name: farmerName, 
      isDiscounted: isDiscounted ?? false,
      isGrowing: isGrowing ?? false,
      shelfLife: parseInt(productShelf),
      createdAt: Timestamp.now(),
    };

    try {
      await addDoc(collection(db, "products"), newProduct);
      console.log("Product added successfully with farmer name:", farmerName);
      resetForm();
      setModalVisible(false);
    } catch (error) {
      console.error("Error adding product:", error);
      Alert.alert("Error", "Failed to add the product.");
    }
  };

  const addProductToDB = async (product: Omit<Product, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, "products"), product);
      console.log("Document written with ID: ", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this product?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              console.log("Deleting product with ID:", productId);
              await deleteProductFromDB(productId); 
              setProducts((prevProducts) =>
                prevProducts.filter((product) => product.id !== productId)
              );
            } catch (error) {
              console.error("Error deleting product:", error);
            }
          },
        },
      ]
    );
  };
  
  const deleteProductFromDB = async (productId: string) => {
    try {
      console.log("Deleting document from Firestore...");
      const productRef = doc(db, "products", productId);
      await deleteDoc(productRef);
      console.log("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleUpdateProduct = () => {
    if (!productName || !productPrice || !productCount || !productImage || !editingProduct) {
      Alert.alert("Error", "Please fill in all fields and select an image.")
      return
    }

    const updatedProduct: Product = {
      ...editingProduct,
      name: productName,
      price: Number.parseFloat(productPrice),
      count: Number.parseInt(productCount),
      imageUrl: productImage,
      farmer_id: farmerId || "",
      isDiscounted: isDiscounted ?? false, 
      isGrowing: isGrowing ?? false, 
      shelfLife: Number.parseInt(productShelf),
      createdAt: editingProduct?.createdAt ?? Timestamp.now()
    }

    setProducts(products.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)))
    updateProductToDB(updatedProduct.id, updatedProduct)
    setModalVisible(false)
    resetForm()
  }

  const updateProductToDB = async (productId: string, updatedData: Partial<Product>) => {
    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, updatedData);
      console.log("Product updated successfully!");
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const toggleDiscounts = (productId: string) => {
    setProducts(
      products.map((product) =>
        product.id === productId ? { ...product, isDiscounted: !product.isDiscounted } : product,
      ),
    )
  }

  const renderHomeTab = () => (
    <ScrollView>
      <Text style={styles.homeText}>Here's your daily summary:</Text>
      <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>Inventory</Text>
        <Text style={styles.summaryItem}>Total Products: {products.length}</Text>
        <Text style={styles.summaryItem}>Total Stock: {products.reduce((sum, product) => sum + product.count, 0)}</Text>
        <Text style={styles.summaryItem}>Latest Product: {products[products.length - 1]?.name || "N/A"}</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Sales Overview</Text>
        <Text style={styles.summaryItem}>Total Sales: $1,234.56</Text>
        <Text style={styles.summaryItem}>Feature coming out soon 2 you!</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Low Stock Alerts</Text>
        {products
          .filter((p) => p.count < 5)
          .map((p) => (
            <Text key={p.id} style={styles.alertItem}>
              {p.name}: Only {p.count} left!
            </Text>
          ))}
      </View>
      
{/* Growing Items Section */}
<View style={styles.summaryCard}>
      <View style={styles.growingHeaderContainer}>
        <Text style={styles.summaryTitle}>Currently Growing</Text>
      </View>
      
      {products.filter(p => p.isGrowing).length === 0 ? (
          <Text style={styles.noItemsText}>No crops currently growing</Text>
        ) : (
          products.filter(p => p.isGrowing).map((item) => (
            <View key={item.id} style={styles.growingItemCard}>
              <View style={styles.growingItemHeader}>
                <Text style={styles.growingItemName}>{item.name}</Text>
              </View>
            </View>
          ))
        )}
      </View>

    {/* Growing Items Modal */}
    <Modal
      animationType="slide"
      transparent={true}
      visible={showGrowingModal}
      onRequestClose={() => setShowGrowingModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Add New Growing Item</Text>
          
          <TextInput
            style={styles.modalInput}
            placeholder="Crop Name"
            value={newGrowingItem.name}
            onChangeText={(text) => setNewGrowingItem({...newGrowingItem, name: text})}
          />

          <TextInput
            style={styles.modalInput}
            placeholder="Quantity"
            keyboardType="numeric"
            value={newGrowingItem.quantity?.toString()}
            onChangeText={(text) => setNewGrowingItem({...newGrowingItem, quantity: parseInt(text) || 0})}
          />

          <Text style={styles.inputLabel}>Planting Date:</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="YYYY-MM-DD"
            value={newGrowingItem.plantedDate?.toISOString().split('T')[0]}
            onChangeText={(text) => {
              const date = new Date(text);
              if (!isNaN(date.getTime())) {
                setNewGrowingItem({...newGrowingItem, plantedDate: date});
              }
            }}
          />

          <Text style={styles.inputLabel}>Expected Harvest Date:</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="YYYY-MM-DD"
            value={newGrowingItem.expectedHarvest?.toISOString().split('T')[0]}
            onChangeText={(text) => {
              const date = new Date(text);
              if (!isNaN(date.getTime())) {
                setNewGrowingItem({...newGrowingItem, expectedHarvest: date});
              }
            }}
          />

          <TextInput
            style={[styles.modalInput, styles.notesInput]}
            placeholder="Notes (optional)"
            multiline
            value={newGrowingItem.notes}
            onChangeText={(text) => setNewGrowingItem({...newGrowingItem, notes: text})}
          />

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowGrowingModal(false);
                setNewGrowingItem({});
              }}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleAddGrowingItem}
            >
              <Text style={styles.modalButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    </ScrollView>
  )

  const renderProductsTab = (showDiscounted: boolean) => {
    const filteredProducts = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDiscount = product.isDiscounted === showDiscounted
      return matchesSearch && matchesDiscount
    })

    const toggleDiscount = async (productId: string, currentDiscountStatus: boolean) => {
      try {
        const productRef = doc(db, "products", productId);
        await updateDoc(productRef, {
          isDiscounted: !currentDiscountStatus, 
        });
        const updatedProducts = products.map((product) =>
          product.id === productId
            ? { ...product, isDiscounted: !currentDiscountStatus }
            : product
        );
        setProducts(updatedProducts); 
      } catch (error) {
        console.error("Error updating isDiscounted: ", error);
      }
    };  

    return (
      <>
        <Text style={styles.sectionTitle}>{showDiscounted ? "Discounted Products" : "My Products"}</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Search for products..."
          placeholderTextColor="#FFA500"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {filteredProducts.length === 0 ? (
          <Text style={styles.noResultsText}>No products found</Text>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => `${item.name}-${item.id}`}
            renderItem={({ item }) => (
              <View style={styles.productCard}>
                <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                <View style={styles.productInfo}>

                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                  <Text style={styles.productCount}>Stock: {item.count}</Text>
                  <Text style={styles.productFarmer}>Farmer: {item.farmer_name || "Unknown"}</Text>

                  {/* {item.isGrowing && <Text style={styles.growingText}>Growing</Text>} */}

                  {item.isDiscounted && (
                    <View style={styles.discountSticker}>
                    <Text style={styles.discountText}>Discounted</Text>
                    </View>
                  )}
<View style={styles.cardButtonContainer}>
                <TouchableOpacity style={[styles.cardButton, styles.editButton]} onPress={() => handleEdit(item)}>
                  <Ionicons name="pencil" size={16} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cardButton, styles.deleteButton]}
                  onPress={() => handleDeleteProduct(item.id)}
                >
                  <Ionicons name="trash" size={16} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                    styles.cardButton,
                    item.isDiscounted ? styles.removeDiscountButton : styles.discountButton,
                  ]}
                  onPress={() => toggleDiscount(item.id, item.isDiscounted ?? false)} // Default to false if undefined
                  >
                  <Ionicons name={item.isDiscounted ? "close-circle" : "pricetag"} size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
            )}
          />
        )}
        {!showDiscounted && (
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() => {
              resetForm()
              setModalVisible(true)
            }}
          >
            <Ionicons name="add-circle" size={24} color="#FFF" />
            <Text style={styles.addNewText}>Add New Product</Text>
          </TouchableOpacity>
        )}
      </>
    )
  }


  const renderWeatherTab = (products: any[] ) => {
    return (
      <WeatherScreen 
        growingItems={products.filter((p) => p.isGrowing)}
      />
    );
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      setProductImage(result.assets[0].uri)
    }
  }

  const router = useRouter();
  const handleSignOut = async () => {
      try {
        await signOut(auth);
        router.replace("/login"); 
      } catch (error) {
        Alert.alert("Sign Out Failed", "Something went wrong. Please try again.");
      }
    };
    
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome, Farmer {userName}!</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setShowScheduledModal(true)}>
            <Ionicons name="calendar" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleSignOut}>
            <Ionicons name="log-out" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Menu */}
      <View style={styles.navMenu}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {["home", "products", "discounted", "weather"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.navItem, activeTab === tab && styles.activeNavItem]}
              onPress={() => setActiveTab(tab as typeof activeTab)}
            >
              <Text style={[styles.navText, activeTab === tab && styles.activeNavText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main  */}
      <View style={styles.mainContent}>
        {activeTab === "home" && renderHomeTab()}
        {activeTab === "products" && renderProductsTab(false)}
        {activeTab === "discounted" && renderProductsTab(true)}
        {/* {activeTab === "ai" && renderAIAnalysisTab()} */}
        {activeTab === "weather" && renderWeatherTab(products)}
      </View>

      {/* Add/Edit Product Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible)
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{editingProduct ? "Edit Product" : "Add New Product"}</Text>
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
              {productImage ? (
                <Image source={{ uri: productImage }} style={styles.modalImage} />
              ) : (
                <View style={[styles.modalImage, styles.placeholderImage]}>
                  <Ionicons name="camera" size={30} color="#28A745" />
                  <Text style={styles.placeholderText}>Tap to select image</Text>
                </View>
              )}
            </TouchableOpacity>
            <TextInput
              style={styles.modalInput}
              placeholder="Product Name"
              placeholderTextColor="#888"
              value={productName}
              onChangeText={setProductName}
              returnKeyType="done"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Price"
              placeholderTextColor="#888"
              value={productPrice}
              onChangeText={setProductPrice}
              keyboardType="numeric"
              returnKeyType="done"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Stock"
              placeholderTextColor="#888"
              value={productCount}
              onChangeText={setProductCount}
              keyboardType="numeric"
              returnKeyType="done"
            />

              <View style={styles.radioContainer}>
                <Text style={styles.modalLabel}>Currently Growing?</Text>
                <View style={styles.radioGroup}>
                  <View style={styles.radioButton}>
                    <RadioButton
                      value="Yes"
                      status={isGrowing ? 'checked' : 'unchecked'}
                      onPress={() => setProductGrowing(true)}
                      color="#FF9800" 
                    />
                    <Text>Yes</Text>
                  </View>
                  <View style={styles.radioButton}>
                    <RadioButton
                      value="No"
                      status={!isGrowing ? 'checked' : 'unchecked'}
                      onPress={() => setProductGrowing(false)}
                      color="#FF9800"
                    />
                    <Text>No</Text>
                  </View>
                </View>
              </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={editingProduct ? handleUpdateProduct : handleAddProduct}
              >
                <Text style={styles.modalButtonText}>{editingProduct ? "Update" : "Add"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Scheduled Items Modal */}
      <Modal transparent={true} visible={showScheduledModal} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Scheduled Deliveries</Text>
            {orders.filter((o) => o.status === "pending").length === 0 ? (
              <Text>No scheduled deliveries.</Text>
            ) : (
              orders
                .filter((o) => o.status === "pending")
                .map((order) => (
                  <View key={order.id} style={styles.pickupItem}>
                    <Text>
                      Order #{order.id}: {order.quantity} x Product {order.productId}
                    </Text>
                  </View>
                ))
            )}
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
        <TouchableOpacity onPress={() => Alert.alert("Contact Us", "Email: support@farm2you.com")}>
          <Text style={styles.footerText}>|  Contact Us  |</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert("Terms & Conditions", "These are our terms and conditions.")}>
          <Text style={styles.footerText}>Terms & Conditions</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F4C8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#28A745",
    padding: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  weatherContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    flexDirection: "row",
  },
  iconButton: {
    backgroundColor: "#FFA500",
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  
  navMenu: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  navItem: {
    padding: 10,
    marginRight: 10,
  },
  navText: {
    color: "#333",
    fontSize: 16,
  },
  activeNavItem: {
    borderBottomWidth: 2,
    borderBottomColor: "#28A745",
  },
  activeNavText: {
    color: "#28A745",
    fontWeight: "bold",
  },
  mainContent: {
    flex: 1,
    padding: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  homeText: {
    fontSize: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  summaryItem: {
    fontSize: 14,
    marginBottom: 5,
  },
  // alertItem: {
  //   color: "#FF4136",
  //   fontSize: 14,
  //   marginBottom: 5,
  // },
  growingHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  addGrowingButton: {
    padding: 5,
  },
  
  growingItemCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  
  growingItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  growingItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  
  growingItemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  
  growingItemDates: {
    marginBottom: 8,
  },
  
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  
  growingItemNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  modalLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    marginLeft: 4,
  },
  noItemsText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
  
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    marginLeft: 4,
  },
  
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },


  searchBar: {
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  noResultsText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  productImage: {
    width: 60,
    height: 60,
    marginRight: 15,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  productPrice: {
    fontSize: 16,
    color: "#28A745",
  },
  productCount: {
    fontSize: 14,
    color: "#555",
  },
  productFarmer: {
    fontSize: 14,
    color: "#555",
  },
  growingText: {
    color: "green",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 5,
  },
  productShelfLife: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  cardButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  cardButton: {
    padding: 5,
    borderRadius: 5,
    marginLeft: 5,
  },
  editButton: {
    backgroundColor: "#FFC107",
  },
  deleteButton: {
    backgroundColor: "#DC3545",
  },
  discountButton: {
    backgroundColor: "#FF4136",
  },
  removeDiscountButton: {
    backgroundColor: "#0074D9",
  },
  discountSticker: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#FF4136",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  addNewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28A745",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  addNewText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  aiContainer: {
    padding: 15,
  },
  aiText: {
    fontSize: 16,
    marginBottom: 15,
  },
  aiCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  aiInsight: {
    fontSize: 14,
    marginBottom: 10,
  },
  weatherTabCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  weatherTabTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  orderItem: {
    fontSize: 14,
    marginBottom: 5,
  },
  stockItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  setLimitButton: {
    backgroundColor: "#0074D9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  setLimitButtonText: {
    color: "#FFF",
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start", 
    alignItems: "center",
    paddingTop: 140, 
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  imagePicker: {
    width: "50%",
    aspectRatio: 1,
    marginBottom: 15,
  },
  modalImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  placeholderText: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
  modalInput: {
    backgroundColor: '#fff',
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  radioContainer: {
    backgroundColor: '#fff',
    width: "100%",
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 14,
    padding: 10,
    opacity: 0.6,
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    color: "gray",
  },
  radioButtonText: {
    color: "gray",
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "45%",
  },
  cancelButton: {
    backgroundColor: "#DC3545",
  },
  saveButton: {
    backgroundColor: "#28A745",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalCloseButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#FF4C4C",
    borderRadius: 5,
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  pickupItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%",
  },
  footer: { 
    flexDirection: "row", 
    justifyContent: "center", 
    backgroundColor: "#FFA500", 
    padding: 10, 
    borderRadius: 10, 
    marginTop: 20 ,
    marginRight: 10,
    marginLeft: 10
  },

  footerText: { 
    color: "#FFF", 
    fontSize: 14, 
    marginHorizontal: 5 },
    weatherCard: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    weatherIcon: {
      width: 80, 
      height: 80,
      marginRight: 15,
    },
    weatherTemp: {
      fontSize: 30,
      fontWeight: "bold",
    },
    weatherDescription: {
      fontSize: 18,
    },
    weatherAlerts: {
      marginTop: 20,
    },
    weatherAlertTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
    },
    weatherAlert: {
      color: "red",
      marginBottom: 5,
      fontSize: 16, 
    },
    currentWeatherCard: {
      backgroundColor: '#FFF',
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      elevation: 3,
    },
    weatherInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
    },
    weatherDetails: {
      marginTop: 20, 
      fontSize: 16,  
      marginLeft: 15,
    },
    temperature: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    humidity: {
      fontSize: 16,
      color: '#666',
    },
    windSpeed: {
      fontSize: 16,
      color: '#666',
    },
    alertCard: {
      backgroundColor: '#FFF',
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardIcon: {
      marginRight: 10,
    },
    alertItem: {
      backgroundColor: '#FFF5F5',
      borderRadius: 8,
      padding: 12,
      marginBottom: 10,
      borderLeftWidth: 4,
      borderLeftColor: '#FF4136',
    },
    alertTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
      color: '#FF4136',
    },
    alertDescription: {
      fontSize: 14,
      color: '#666',
    },
    cropRecommendationCard: {
      backgroundColor: '#FFF',
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      elevation: 3,
    },
    recommendationItem: {
      backgroundColor: '#F0FFF4',
      borderRadius: 8,
      padding: 12,
      marginBottom: 10,
      borderLeftWidth: 4,
      borderLeftColor: '#28A745',
    },
    cropType: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#28A745',
      marginBottom: 5,
    },
    recommendationText: {
      fontSize: 14,
      color: '#666',
      lineHeight: 20,
    },
    forecastCard: {
      backgroundColor: '#FFF',
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      elevation: 3,
    },
    forecastContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
    },
    forecastDay: {
      alignItems: 'center',
      flex: 1,
    },
    dayText: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    tempText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 8,
    },
    weatherText: {
      fontSize: 14,
      color: '#666',
      marginTop: 4,
    },
  })

function now(): Timestamp {
  throw new Error("Function not implemented.")
}
