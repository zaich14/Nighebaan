import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { getPlans } from "../services/api";

export default function PlansScreen() {
  const [plans, setPlans] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await getPlans();
        setPlans(response.data.data.plans || []);
        setAddOns(response.data.data.addOnServices || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Subscription Plans</Text>
      <Text style={styles.subtitle}>
        View the Basic, Standard, Premium and Caregiver Plus plans for elderly care management.
      </Text>

      {loading ? (
        <Text style={styles.loading}>Loading plans...</Text>
      ) : (
        plans.map((plan) => (
          <View key={plan.id} style={styles.card}>
            <Text style={styles.planTag}>{plan.tag}</Text>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planPrice}>{plan.price}</Text>
            <Text style={styles.planDescription}>{plan.description}</Text>
            {plan.features.map((item, index) => (
              <Text key={index} style={styles.featureText}>• {item}</Text>
            ))}
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>Add-On Services</Text>
      {addOns.map((addOn) => (
        <View key={addOn.id} style={styles.addOnCard}>
          <Text style={styles.addOnTitle}>{addOn.title}</Text>
          <Text style={styles.addOnDescription}>{addOn.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  loading: {
    color: "#94a3b8",
    marginBottom: 24,
  },
  card: {
    marginBottom: 20,
    borderRadius: 30,
    backgroundColor: "#111827",
    padding: 24,
  },
  planTag: {
    color: "#38bdf8",
    textTransform: "uppercase",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10,
  },
  planName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  planPrice: {
    color: "#cbd5e1",
    fontSize: 18,
    marginBottom: 12,
  },
  planDescription: {
    color: "#94a3b8",
    marginBottom: 14,
    lineHeight: 22,
  },
  featureText: {
    color: "#e2e8f0",
    marginBottom: 8,
    lineHeight: 22,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 14,
  },
  addOnCard: {
    borderRadius: 24,
    backgroundColor: "#1f2937",
    padding: 18,
    marginBottom: 14,
  },
  addOnTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  addOnDescription: {
    color: "#cbd5e1",
    lineHeight: 22,
  },
});
