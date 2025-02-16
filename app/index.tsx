import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useFonts, Baloo2_700Bold } from "@expo-google-fonts/baloo-2";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function LandingPage() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Baloo: Baloo2_700Bold, 
  });

  if (!fontsLoaded) {
    return null; // prevent rendering before font loads
  } else {
    SplashScreen.hideAsync(); 
  }

  const navigateTo = (path: string) => {
    try {
      router.push(path as any);
    } catch (error) {
      console.error("Navigation Error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Box for "Farm Fresh, Waste Less" */}
      <View style={styles.bannerBox}>
        <Text style={styles.bannerText}>Farm Fresh, Waste Less</Text>
      </View>

      {/* Animation */}
      <LottieView 
        source={require("../assets/animations/FarmAnimation1.json")}
        autoPlay 
        loop 
        style={styles.animation}
      />
      
      {/* App Name */}
      <Text style={styles.title}>Farm2You</Text>

      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={() => navigateTo("/login")}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Signup Button */}
      <TouchableOpacity style={styles.button} onPress={() => navigateTo("/signup")}>
        <Text style={styles.buttonText}>Signup</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F4C8",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  bannerBox: {
    backgroundColor: "rgba(255, 255, 255, 0.7)", 
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 30,
    position: "absolute",
    top: 150, 
    left: "8%",
    right: "8%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  bannerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#9932CC", // deep purple 
    textAlign: "center",
    fontFamily: "Avenir",
  },
  animation: {
    width: "100%",
    height: 400,
    marginTop: 30,
    marginBottom: -80,
  },
  title: {
    fontFamily: "Baloo", //  Baloo font for chubby like font
    fontSize: 50,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
    marginTop: 10,
    color: "#9932CC",
  },
  button: {
    backgroundColor: "#FFA500",
    paddingVertical: 15,
    width: "80%",
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
