import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ContainersPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.title}>Containers</Text>
          <Text style={styles.subtitle}>
            Choose what you want to do.
          </Text>

          <Pressable
            style={styles.optionBtn}
            onPress={() => router.push("/post-ad" as Href)}
          >
            <Ionicons name="add-circle-outline" size={22} color="#111713" />
            <Text style={styles.optionText}>Post Your Ad</Text>
          </Pressable>

          <Pressable
            style={styles.optionBtn}
            onPress={() => router.push("/containers-list" as Href)}
          >
            <Ionicons name="eye-outline" size={22} color="#111713" />
            <Text style={styles.optionText}>View Ads</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F6F8F7",
  },
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#E0E8E3",
    padding: 22,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#111713",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "#648770",
    fontWeight: "500",
    marginBottom: 16,
  },
  optionBtn: {
    marginTop: 14,
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E0E8E3",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111713",
  },
});