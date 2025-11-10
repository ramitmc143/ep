import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const RegistrationScreen = ({ navigation }) => {
  const [prefix, setPrefix] = useState("1");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpass, setCpass] = useState("");
  const [state, setState] = useState("3");
  const [deviceId, setDeviceId] = useState("1234");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fname || !lname || !email || !password || !cpass) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (password !== cpass) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://pratibha.eenadu.net/pratibha_services/api/register_user",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prefix: Number(prefix),
            email: email.trim(),
            fname: fname.trim(),
            lname: lname.trim(),
            queurl: "queurl",
            pass: password,
            cpass: cpass,
            state: Number(state),
            device_id: Number(deviceId),
          }),
        }
      );

      const data = await response.json();
      console.log("Registration Response:", data);

      if (data.status === 1) {
        await AsyncStorage.setItem("userEmail", email);
        await AsyncStorage.setItem("userFname", fname);
        await AsyncStorage.setItem("userLname", lname);

        Alert.alert("Success", data.message || "Successfully Registered", [
          { text: "OK", onPress: () => navigation.replace("HomeScreen") },
        ]);
      } else {
        Alert.alert("Failed", data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      Alert.alert("Error", "Failed to register. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Fixed logo section */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../Assets/pratibha-logo-splash.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join and start your journey</Text>
      </View>

      {/* Scrollable form section (with register button inside) */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Prefix (e.g., 1)"
            value={prefix}
            onChangeText={setPrefix}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={fname}
            onChangeText={setFname}
          />

          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lname}
            onChangeText={setLname}
          />

          <TextInput
            style={styles.input}
            placeholder="Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            value={cpass}
            onChangeText={setCpass}
          />

          <TextInput
            style={styles.input}
            placeholder="State (e.g., 3)"
            value={state}
            onChangeText={setState}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Device ID"
            value={deviceId}
            onChangeText={setDeviceId}
            keyboardType="numeric"
          />

          {/* Register button inside scroll */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.registerLink}
          >
            <Text style={styles.linkText}>
              Already have an account?{" "}
              <Text style={styles.linkHighlight}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  logoContainer: {
    alignItems: "center",
    paddingTop: height * 0.05,
    paddingBottom: height * 0.03,
    backgroundColor: "#F8FAFF",
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    resizeMode: "contain",
    marginBottom: height * 0.015,
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: "700",
    color: "#1C1C1E",
    textAlign: "center",
  },
  subtitle: {
    fontSize: width * 0.04,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: height * 0.05,
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: width * 0.05,
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
    marginBottom: height * 0.015,
    fontSize: width * 0.04,
    backgroundColor: "#F9FAFB",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: height * 0.018,
    borderRadius: 12,
    alignItems: "center",
    marginTop: height * 0.02,
  },
  buttonText: {
    color: "#fff",
    fontSize: width * 0.045,
    fontWeight: "600",
  },
  registerLink: {
    marginTop: height * 0.02,
  },
  linkText: {
    color: "#6B7280",
    textAlign: "center",
    fontSize: width * 0.04,
  },
  linkHighlight: {
    color: "#007AFF",
    fontWeight: "700",
  },
});

export default RegistrationScreen;
