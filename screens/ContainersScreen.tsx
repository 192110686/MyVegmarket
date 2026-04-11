import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
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
  is_active?: boolean | null;
};

export default function ContainersScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<ContainerItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContainers();
  }, []);

  async function loadContainers(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);

    const { data, error } = await supabase
      .from("containers")
      .select(`
        id,
        title,
        packaging,
        qty,
        quantity_unit,
        price,
        currency,
        route_from,
        route_to,
        availability_date,
        image_url,
        image_path,
        company_name,
        contact_person,
        whatsapp,
        market_location,
        container_type,
        category,
        created_at,
        is_active
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setItems([]);
    } else {
      setItems((data as ContainerItem[]) ?? []);
    }

    setLoading(false);
    setRefreshing(false);
  }

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      const haystack = [
        item.title,
        item.route_from,
        item.route_to,
        item.company_name,
        item.category,
        item.container_type,
        item.market_location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [items, search]);

  function openDetails(item: ContainerItem) {
    router.push({
      pathname: "/container-details",
      params: {
        item: JSON.stringify(item),
      },
    } as any);
  }

  function renderItem({ item }: { item: ContainerItem }) {
    const imageUrl = item.image_url || null;

    return (
      <Pressable style={styles.card} onPress={() => openDetails(item)}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.cardImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={30} color="#7B9488" />
            <Text style={styles.imagePlaceholderText}>No Image</Text>
          </View>
        )}

        <View style={styles.cardBody}>
          <View style={styles.topRow}>
            <Text style={styles.productName} numberOfLines={1}>
              {item.title || "Container Listing"}
            </Text>
            {!!item.price && (
              <Text style={styles.priceText}>
                {item.currency || "USD"} {item.price}
              </Text>
            )}
          </View>

          <Text style={styles.companyText} numberOfLines={1}>
            {item.company_name || "Unknown Company"}
          </Text>

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color="#648770" />
            <Text style={styles.metaText} numberOfLines={1}>
              {item.route_from || "—"} → {item.route_to || "—"}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="cube-outline" size={14} color="#648770" />
            <Text style={styles.metaText} numberOfLines={1}>
              {item.packaging || "Packaging not set"} • {item.qty ?? "—"}{" "}
              {item.quantity_unit || ""}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color="#648770" />
            <Text style={styles.metaText}>
              Ready: {item.availability_date || "Not specified"}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>View Ads</Text>
          <Text style={styles.subtitle}>
            Browse approved container listings
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#648770" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search product, origin, destination..."
            placeholderTextColor="#8BA094"
            style={styles.searchInput}
          />
        </View>

        {loading ? (
          <View style={styles.centerWrap}>
            <ActivityIndicator size="large" color="#1DB954" />
            <Text style={styles.loadingText}>Loading containers...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerWrap}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={() => loadContainers()}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.centerWrap}>
            <Text style={styles.emptyTitle}>No containers found</Text>
            <Text style={styles.emptyText}>
              Try a different product or location search.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadContainers(true)}
              />
            }
          />
        )}
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
  },
  header: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111713",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "#648770",
    fontWeight: "500",
  },
  searchBox: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E0E8E3",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111713",
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E0E8E3",
    overflow: "hidden",
    marginBottom: 14,
  },
  cardImage: {
    width: "100%",
    height: 190,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    height: 150,
    backgroundColor: "#F2F5F3",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    marginTop: 6,
    fontSize: 13,
    color: "#7B9488",
    fontWeight: "600",
  },
  cardBody: {
    padding: 14,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  productName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
    color: "#111713",
  },
  priceText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#1E6B2A",
  },
  companyText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#111713",
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginTop: 8,
  },
  metaText: {
    flex: 1,
    fontSize: 13,
    color: "#648770",
    fontWeight: "600",
  },
  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#648770",
    fontWeight: "600",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111713",
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#648770",
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: "#1DB954",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111713",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#648770",
    textAlign: "center",
  },
});