import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../components/UI";
import api from "../api/client";
import { colors, radii } from "../theme/colors";

export default function AdminScreen() {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("");

  const load = useCallback(async () => {
    const [statsRes, reportsRes] = await Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/reports", { params: filter ? { status: filter } : {} }),
    ]);
    setStats(statsRes.data);
    setReports(reportsRes.data.reports);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id, status) => {
    await api.patch(`/admin/reports/${id}`, { status });
    load();
  };

  const deleteReport = async (id) => {
    await api.delete(`/admin/reports/${id}`);
    load();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <FlatList
        contentContainerStyle={{ padding: 20 }}
        data={reports}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <View>
            {stats && (
              <View style={styles.statsRow}>
                <Card style={styles.statCard}><Text style={styles.statNum}>{stats.active_alerts}</Text><Text style={styles.statLabel}>Active SOS</Text></Card>
                <Card style={styles.statCard}><Text style={styles.statNum}>{stats.open_reports}</Text><Text style={styles.statLabel}>Open reports</Text></Card>
                <Card style={styles.statCard}><Text style={styles.statNum}>{stats.total_users}</Text><Text style={styles.statLabel}>Users</Text></Card>
              </View>
            )}
            <View style={styles.filterRow}>
              {["", "open", "reviewing", "resolved"].map((s) => (
                <TouchableOpacity key={s} onPress={() => setFilter(s)} style={[styles.filterChip, filter === s && styles.filterChipActive]}>
                  <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>{s || "All"}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 10 }}>
            <Text style={styles.reportCategory}>{item.category.replace("_", " ")}</Text>
            <Text style={styles.reportMeta}>{new Date(item.created_at).toLocaleString()}</Text>
            {item.description ? <Text style={styles.reportDesc}>{item.description}</Text> : null}
            <View style={styles.actionsRow}>
              {["open", "reviewing", "resolved"].map((s) => (
                <TouchableOpacity key={s} onPress={() => updateStatus(item.id, s)} style={[styles.statusChip, item.status === s && styles.statusChipActive]}>
                  <Text style={[styles.statusText, item.status === s && styles.statusTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
              {item.latitude && (
                <TouchableOpacity onPress={() => Linking.openURL(`https://maps.google.com/?q=${item.latitude},${item.longitude}`)}>
                  <Text style={styles.mapLink}>Map</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => deleteReport(item.id)}>
                <Text style={styles.deleteLink}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListEmptyComponent={<Text style={{ color: colors.inkSoft }}>No reports match this filter.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: { flex: 1, alignItems: "center", padding: 14 },
  statNum: { fontSize: 20, fontWeight: "800", color: colors.purple900 },
  statLabel: { fontSize: 11, color: colors.inkSoft, marginTop: 2, textAlign: "center" },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  filterChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: colors.purple300 },
  filterChipActive: { backgroundColor: colors.purple500, borderColor: colors.purple500 },
  filterText: { color: colors.purple700, fontSize: 12 },
  filterTextActive: { color: "#fff", fontWeight: "700" },
  reportCategory: { fontWeight: "700", color: colors.ink, textTransform: "capitalize" },
  reportMeta: { color: colors.inkSoft, fontSize: 12, marginTop: 2 },
  reportDesc: { color: colors.ink, fontSize: 13, marginTop: 6 },
  actionsRow: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 12, flexWrap: "wrap" },
  statusChip: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999, backgroundColor: colors.purple100 },
  statusChipActive: { backgroundColor: colors.purple700 },
  statusText: { fontSize: 11, color: colors.purple700 },
  statusTextActive: { color: "#fff", fontWeight: "700" },
  mapLink: { color: colors.purple700, fontWeight: "600", fontSize: 12 },
  deleteLink: { color: colors.dangerDark, fontWeight: "600", fontSize: 12 },
});
