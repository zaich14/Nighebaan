import React from "react";
import { StyleSheet, View, Text, ScrollView, Pressable } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nigehbaan Mobile</Text>
        <Text style={styles.subtitle}>
          A companion mobile app for elderly care monitoring, alerts, and doctor access.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Features</Text>
        <View style={styles.featureList}>
          <Text style={styles.featureText}>• Real-time alerts for caregivers and doctors.</Text>
          <Text style={styles.featureText}>• Secure login for doctors, nurses, and users.</Text>
          <Text style={styles.featureText}>• Dashboard view with recent alert records.</Text>
          <Text style={styles.featureText}>• Connects to your existing backend API.</Text>
        </View>
      </View>

      <Pressable style={styles.button} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.buttonText}>Login to continue</Text>
      </Pressable>
      <Pressable style={[styles.button, styles.secondaryButton]} onPress={() => navigation.navigate("Plans")}> 
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>View Plans</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0f172a",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    marginTop: 12,
    color: "#94a3b8",
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 30,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  featureList: {
    marginTop: 16,
  },
  featureText: {
    color: "#cbd5e1",
    fontSize: 15,
    marginBottom: 10,
  },
  button: {
    marginTop: 40,
    borderRadius: 30,
    backgroundColor: "#38bdf8",
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryButton: {
    marginTop: 16,
    backgroundColor: "#1f2937",
  },
  buttonText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButtonText: {
    color: "#f8fafc",
