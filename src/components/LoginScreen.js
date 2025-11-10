import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";

const { width, height } = Dimensions.get("window");
const scale = width / 375; // Base scaling factor for font & sizing

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://pratibha.eenadu.net/pratibha_services/api/loginCheck",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            device_id: 123,
            email: email.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();
      console.log("Login Response:", data);

      if (data.status === 1) {
        Alert.alert("Success", data.message || "Login Successful", [
          { text: "OK", onPress: () => navigation.replace("HomeScreen") },
        ]);
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoiding}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Logo */}
          <Image
            source={require("../Assets/pratibha-logo-splash.png")}
            style={styles.logo}
          />

          {/* Titles */}
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to continue your journey</Text>

          {/* Card */}
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              style={styles.registerLink}
            >
              <Text style={styles.linkText}>
                Don’t have an account?{" "}
                <Text style={styles.linkHighlight}>Register</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: height * 0.05,
    paddingHorizontal: width * 0.06,
  },
  container: {
    alignItems: "center",
  },
  logo: {
    width: width * 0.35,
    height: width * 0.35,
    resizeMode: "contain",
    marginBottom: height * 0.03,
  },
  title: {
    fontSize: 28 * scale,
    fontWeight: "700",
    color: "#1C1C1E",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16 * scale,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: height * 0.04,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: width * 0.06,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  input: {
    height: height * 0.065,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: height * 0.02,
    fontSize: 16 * scale,
    backgroundColor: "#F9FAFB",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: height * 0.02,
    borderRadius: 12,
    alignItems: "center",
    marginTop: height * 0.01,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16 * scale,
    fontWeight: "600",
  },
  registerLink: {
    marginTop: height * 0.025,
  },
  linkText: {
    color: "#6B7280",
    textAlign: "center",
    fontSize: 14 * scale,
  },
  linkHighlight: {
    color: "#007AFF",
    fontWeight: "700",
  },
});

export default LoginScreen;
