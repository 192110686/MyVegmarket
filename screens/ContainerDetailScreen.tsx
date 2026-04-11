import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
    Image,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ContainerItem = {
  id: string;
  title: string | null;
  packaging: string | null;
  qty: number | null;
  quantity_unit: string | null;
  price: number | null;
  currency: string | null;
  route_from: string | null;
  route_to: string | null;
  availability_date: string | null;
  image_url: string | null;
  image_path: string | null;
  company_name: string | null;
  contact_person: string | null;
  whatsapp: string | null;
  market_location: string | null;
  container_type: string | null;
  category: string | null;
  created_at?: string | null;
};

export default function ContainerDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const item = useMemo(() => {
    if (!params?.item || typeof params.item !== "string") return null;
    try {
      return JSON.parse(params.item) as ContainerItem;
    } catch {
      return null;
    }
  }, [params]);

  async function openWhatsApp() {
    if (!item?.whatsapp) return;

    const phone = item.whatsapp.replace(/[^\d]/g, "");
    const url = `https://wa.me/${phone}`;
    await Linking.openURL(url);
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.centerWrap}>
          <Text style={styles.errorTitle}>Listing not found</Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backRow} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#111713" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={36} color="#7B9488" />
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        <Text style={styles.title}>{item.title || "Container Listing"}</Text>

        <Text style={styles.company}>
          {item.company_name || "Unknown Company"}
        </Text>

        {!!item.price && (
          <Text style={styles.price}>
            {item.currency || "USD"} {item.price}
          </Text>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Route</Text>
          <Text style={styles.value}>
            {item.route_from || "—"} → {item.route_to || "—"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Packaging</Text>
          <Text style={styles.value}>{item.packaging || "Not specified"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Quantity</Text>
          <Text style={styles.value}>
            {item.qty ?? "—"} {item.quantity_unit || ""}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Container Type</Text>
          <Text style={styles.value}>
            {item.container_type || "Not specified"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Availability Date</Text>
          <Text style={styles.value}>
            {item.availability_date || "Not specified"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <Text style={styles.value}>{item.category || "Not specified"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Market Location</Text>
          <Text style={styles.value}>
            {item.market_location || "Not specified"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Contact Person</Text>
          <Text style={styles.value}>
            {item.contact_person || "Not specified"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>WhatsApp</Text>
          <Text style={styles.value}>{item.whatsapp || "Not provided"}</Text>
        </View>

        {!!item.whatsapp && (
          <Pressable style={styles.whatsappBtn} onPress={openWhatsApp}>
            <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
            <Text style={styles.whatsappText}>Contact on WhatsApp</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F6F8F7",
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  backText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111713",
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 24,
    resizeMode: "cover",
    backgroundColor: "#EAEFEC",
  },
  placeholder: {
    height: 220,
    borderRadius: 24,
    backgroundColor: "#F2F5F3",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#7B9488",
  },
  title: {
    marginTop: 16,
    fontSize: 28,
    fontWeight: "900",
    color: "#111713",
  },
  company: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#648770",
  },
  price: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: "900",
    color: "#1E6B2A",
  },
  section: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E0E8E3",
    padding: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#648770",
    marginBottom: 6,
  },
  value: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111713",
    lineHeight: 22,
  },
  whatsappBtn: {
    marginTop: 22,
    backgroundColor: "#1E6B2A",
    borderRadius: 18,
    minHeight: 54,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  whatsappText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111713",
  },
  backBtn: {
    marginTop: 16,
    backgroundColor: "#1E6B2A",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  backBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});