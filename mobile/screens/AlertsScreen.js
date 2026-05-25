import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, View, Text, FlatList, Pressable } from "react-native";
import { AuthContext } from "../App";
import { getAlerts } from "../services/api";

export default function AlertsScreen({ navigation }) {
  const { authState } = useContext(AuthContext);
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
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Alerts</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </View>

      <View style={styles.listContainer}>
        {loading ? (
          <Text style={styles.messageText}>Loading alerts...</Text>
        ) : alerts.length === 0 ? (
          <Text style={styles.messageText}>No alerts found.</Text>
        ) : (
          <FlatList
            data={alerts}
            keyExtractor={(item) => item._id || item.id}
            renderItem={({ item }) => (
              <View style={styles.alertCard}>
                <Text style={styles.alertType}>{item.type?.toUpperCase() || "Alert"}</Text>
                <Text style={styles.alertMessage}>{item.message}</Text>
                <Text style={styles.alertSeverity}>{item.severity}</Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
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
  backButton: {
    borderRadius: 24,
    backgroundColor: "#1f2937",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  backButtonText: {
    color: "#cbd5e1",
  },
  listContainer: {
    flex: 1,
    marginTop: 24,
    backgroundColor: "#111827",
    borderRadius: 30,
    padding: 16,
  },
  alertCard: {
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: "#1f2937",
    padding: 18,
  },
  alertType: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  alertMessage: {
    marginTop: 8,
    color: "#cbd5e1",
    fontSize: 14,
  },
  alertSeverity: {
    marginTop: 10,
    color: "#94a3b8",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  messageText: {
    color: "#cbd5e1",
    fontSize: 15,
  },
});
