import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Alert, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import LottieView from "lottie-react-native";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isFarmer, setIsFarmer] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !phone) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(collection(db, "users"), user.uid), {
        name,
        email,
        password,
        phone,
        role: isFarmer ? "farmer" : "user",
        createdAt: new Date(),
      });

      Alert.alert("Success", "Account created successfully!");
      router.push("/login");
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Login Failed", error.message);
      } else {
        Alert.alert("Login Failed", "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <LottieView source={require("../assets/animations/SignupAnimation1.json")} autoPlay loop style={styles.animation} />
        <View style={styles.formContainer}>
          <Text style={styles.title}>Signup</Text>

          {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/")}>
          <Ionicons name="arrow-back" size={24} color="black" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

          <TextInput style={styles.input} placeholder="Name" placeholderTextColor="black" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="black" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor="black" secureTextEntry value={password} onChangeText={setPassword} />
          <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="black" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>User</Text>
            <Switch value={isFarmer} onValueChange={setIsFarmer} />
            <Text style={styles.toggleText}>Farmer</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Signing Up..." : "Signup"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F4C8",
  },
  scrollView: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: -330,
    left: 0,
    zIndex: 10,
  },
  backText: {
    fontSize: 18,
    marginLeft: 5,
  },
  animation: {
    width: 300,
    height: 300,
    marginBottom: -10,
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "80%",
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#FFA500",
    borderRadius: 8,
    backgroundColor: "white",
    textAlign: "center",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  button: {
    backgroundColor: "#FFA500",
    paddingVertical: 15,
    width: "80%",
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

