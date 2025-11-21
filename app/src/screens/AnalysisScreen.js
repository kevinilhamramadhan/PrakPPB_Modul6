import { useCallback, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Api } from "../services/api.js";
import { DataTable } from "../components/DataTable.js";
import { SafeAreaView } from "react-native-safe-area-context";

export function AnalysisScreen() {
  const [readings, setReadings] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [readingsData, statsData] = await Promise.all([
        Api.getSensorReadingsWithDifference(),
        Api.getReadingsStatistics(),
      ]);
      setReadings(readingsData ?? []);
      setStatistics(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } finally {
      setRefreshing(false);
    }
  }, [fetchData]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Temperature Analysis</Text>
          <Text style={styles.description}>
            Analysis of temperature readings that exceeded the threshold
          </Text>
          
          {statistics && statistics.total > 0 && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Average Difference</Text>
                <Text style={styles.statValue}>
                  {statistics.average_difference?.toFixed(2) ?? "--"}°C
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Maximum Difference</Text>
                <Text style={styles.statValue}>
                  {statistics.max_difference?.toFixed(2) ?? "--"}°C
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Minimum Difference</Text>
                <Text style={styles.statValue}>
                  {statistics.min_difference?.toFixed(2) ?? "--"}°C
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Readings</Text>
                <Text style={styles.statValue}>{statistics.total}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Avg Temperature</Text>
                <Text style={styles.statValue}>
                  {statistics.average_temperature?.toFixed(2) ?? "--"}°C
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Avg Threshold</Text>
                <Text style={styles.statValue}>
                  {statistics.average_threshold?.toFixed(2) ?? "--"}°C
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Temperature Difference Details</Text>
          {loading && <ActivityIndicator />}
        </View>
        {error && <Text style={styles.errorText}>Failed to load data: {error}</Text>}
        <DataTable
          columns={[
            {
              key: "recorded_at",
              title: "Timestamp",
              render: (value) => (value ? new Date(value).toLocaleString() : "--"),
            },
            {
              key: "temperature",
              title: "Temp (°C)",
              render: (value) =>
                typeof value === "number" ? `${Number(value).toFixed(2)}` : "--",
            },
            {
              key: "threshold_value",
              title: "Threshold (°C)",
              render: (value) =>
                typeof value === "number" ? `${Number(value).toFixed(2)}` : "--",
            },
            {
              key: "difference",
              title: "Diff (°C)",
              render: (value) =>
                typeof value === "number" ? `+${value.toFixed(2)}` : "--",
            },
          ]}
          data={readings}
          keyExtractor={(item) => item.id}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fb",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    color: "#666",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  statItem: {
    width: "50%",
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2563eb",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    marginTop: 8,
    marginBottom: 8,
    color: "#c82333",
  },
});