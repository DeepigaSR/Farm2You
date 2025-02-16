import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";

export default function LandingPage() {
  const router = useRouter();

  const navigateTo = (path : string) => {
    try {
      router.push(path as any);
    } catch (error) {
      console.error("Navigation Error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Animation */}
      <LottieView 
        source={require("../assets/animations/FarmAnimation1.json")}
        autoPlay 
        loop 
        style={styles.animation}
      />
      
      {/* App Name */}
      <Text style={styles.title}>Farmer's Market</Text>

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
  animation: {
    width: "100%",
    height: 400,
    marginBottom: -30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
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
