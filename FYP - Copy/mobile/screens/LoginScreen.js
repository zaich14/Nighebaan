import React, { useContext, useState } from "react";
import { StyleSheet, View, Text, TextInput, Pressable, Alert } from "react-native";
import { AuthContext } from "../App";
import { loginUser } from "../services/api";

export default function LoginScreen() {
  const { signIn } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Login required", "Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser({ email, password });
      const { token, user } = response.data;
      signIn({ token, user });
    } catch (error) {
      Alert.alert("Login failed", error.response?.data?.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.subtitle}>Enter your doctor, nurse, or caregiver credentials.</Text>

      <View style={styles.form}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />
      </View>

      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>{loading ? "Signing in..." : "Sign In"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    marginTop: 12,
    color: "#94a3b8",
    fontSize: 16,
  },
  form: {
    marginTop: 32,
  },
  input: {
    backgroundColor: "#111827",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: "#fff",
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    marginTop: 32,
    borderRadius: 24,
    backgroundColor: "#38bdf8",
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
  },
});
