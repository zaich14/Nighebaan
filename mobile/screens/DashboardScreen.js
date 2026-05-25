import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, View, Text, Pressable, ScrollView } from "react-native";
import { AuthContext } from "../App";
import { getAlerts } from "../services/api";

export default function DashboardScreen({ navigation }) {
  const { authState, signOut } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const response = await getAlerts(authState.token);
        setAlerts(response.data?.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
  }, [authState.token]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Dashboard</Text>
        <Pressable onPress={signOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Welcome, {authState.user?.name}</Text>
        <Text style={styles.cardSubtitle}>Role: {authState.user?.role}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Alert records</Text>
        <Text style={styles.alertCount}>{alerts.length}</Text>
        <Text style={styles.cardSubtitle}>Stored alerts from MongoDB.</Text>
        <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("Alerts")}>
          <Text style={styles.primaryButtonText}>View Alerts</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Quick actions</Text>
        <View style={styles.quickList}>
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Review patient vitals</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Open doctor performa</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => navigation.navigate("Plans")}> 
            <Text style={styles.actionButtonText}>View Plans</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    backgroundColor: "#0f172a",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  signOutButton: {
    borderRadius: 24,
    backgroundColor: "#1f2937",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  signOutText: {
    color: "#cbd5e1",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 30,
    padding: 24,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  cardSubtitle: {
    marginTop: 8,
    color: "#94a3b8",
    fontSize: 15,
  },
  sectionLabel: {
    color: "#94a3b8",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  alertCount: {
    marginTop: 12,
    color: "#fff",
    fontSize: 40,
    fontWeight: "bold",
  },
  primaryButton: {
    marginTop: 20,
    borderRadius: 24,
    backgroundColor: "#38bdf8",
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
  },
  quickList: {
    marginTop: 16,
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 24,
    backgroundColor: "#1f2937",
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  actionButton: {
    borderRadius: 24,
    backgroundColor: "#1f2937",
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  actionButtonText: {
    color: "#cbd5e1",
    fontSize: 15,
  },
});
