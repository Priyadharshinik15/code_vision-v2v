import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Field, PrimaryButton, ErrorText } from "../components/UI";
import api from "../api/client";
import { colors } from "../theme/colors";

export default function ContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", relation: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await api.get("/contacts");
    setContacts(res.data.contacts);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    setError("");
    if (contacts.length >= 5) {
      setError("You can save up to 5 contacts.");
      return;
    }
    if (!form.name || !form.phone) {
      setError("Name and phone are required.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/contacts", form);
      setForm({ name: "", phone: "", relation: "" });
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || "Couldn't add contact.");
    } finally {
      setLoading(false);
    }
  };

  const remove = (id) => {
    Alert.alert("Remove contact?", "", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await api.delete(`/contacts/${id}`);
          load();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <FlatList
        contentContainerStyle={{ padding: 20 }}
        data={contacts}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <Card style={{ marginBottom: 20 }}>
            <Text style={styles.title}>Add a trusted contact</Text>
            <Text style={styles.muted}>Up to 5 people notified the instant you trigger SOS.</Text>
            <Field placeholder="Name" value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} />
            <Field placeholder="Phone number" keyboardType="phone-pad" value={form.phone} onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))} />
            <Field placeholder="Relation (optional)" value={form.relation} onChangeText={(v) => setForm((f) => ({ ...f, relation: v }))} />
            <ErrorText>{error}</ErrorText>
            <PrimaryButton title="Add contact" onPress={add} loading={loading} />
          </Card>
        }
        renderItem={({ item }) => (
          <Card style={styles.contactRow}>
            <View>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactMeta}>{item.phone}{item.relation ? ` · ${item.relation}` : ""}</Text>
            </View>
            <TouchableOpacity onPress={() => remove(item.id)}>
              <Text style={styles.remove}>Remove</Text>
            </TouchableOpacity>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<Text style={styles.muted}>No contacts saved yet.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: "700", color: colors.purple900, fontSize: 16, marginBottom: 4 },
  muted: { color: colors.inkSoft, fontSize: 13, marginBottom: 14 },
  contactRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  contactName: { fontWeight: "700", color: colors.ink },
  contactMeta: { color: colors.inkSoft, fontSize: 13 },
  remove: { color: colors.dangerDark, fontWeight: "600" },
});
