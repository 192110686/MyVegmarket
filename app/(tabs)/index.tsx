import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomePage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        <View style={styles.banner}>
          <View style={styles.logoCircle}>
            <Ionicons name="leaf" size={28} color="#1E6B2A" />
          </View>

          <Text style={styles.title}>MyVegmarket</Text>
          <Text style={styles.subtitle}>
            Daily Al Aweer market prices and container listings in one simple app.
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>LIVE UAE MARKET TOOLS</Text>
          </View>
        </View>

        <Text style={styles.sectionHeading}>Choose what you want to explore</Text>

        <Pressable
          style={styles.optionCard}
          onPress={() => router.push("/prices" as any)}
        >
          <View style={styles.optionIconWrap}>
            <MaterialCommunityIcons name="cash-multiple" size={26} color="#1E6B2A" />
          </View>

          <View style={styles.optionTextWrap}>
            <Text style={styles.optionTitle}>Al Aweer Prices</Text>
            <Text style={styles.optionSubtitle}>
              Check daily market prices, categories, and product updates.
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </Pressable>

        <Pressable
          style={styles.optionCard}
          onPress={() => router.push("/containers" as any)}
        >
          <View style={styles.optionIconWrap}>
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={26}
              color="#1E6B2A"
            />
          </View>

          <View style={styles.optionTextWrap}>
            <Text style={styles.optionTitle}>Containers</Text>
            <Text style={styles.optionSubtitle}>
              Open container options and choose View Ads or Post Your Ad.
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F7F8F5",
  },
  screen: {
    flex: 1,
    padding: 16,
  },
  banner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E7ECE8",
    marginBottom: 24,
    alignItems: "center",
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EEF3EC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#1E6B2A",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#667085",
    textAlign: "center",
    fontWeight: "500",
  },
  badge: {
    marginTop: 18,
    backgroundColor: "#E9F1E7",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  badgeText: {
    color: "#2B6B2D",
    fontSize: 12,
    fontWeight: "800",
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 14,
  },
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E7ECE8",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  optionIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#F2F5F1",
    alignItems: "center",
    justifyContent: "center",
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  optionSubtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: "#667085",
  },
});