import { supabase } from "@/lib/supabase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ProductRow = {
  id: string;
  slug: string | null;
  name: string;
  category: string | null;
  unit: string | null;
  packaging: string | null;
  image_url: string | null;
  active?: boolean | null;
  market_price_aed: number | null;
  myveg_price_aed: number | null;
  price_note: string | null;
  origin_country: string | null;
  shipment_mode: string | null;
  updated_at: string | null;
  sort_order: number | null;
  selected_date_price?: number | null;
  min_price?: number | null;
  max_price?: number | null;
  latest_updated_at?: string | null;
};

type PriceUpdateRow = {
  published_product_id: string | null;
  price: number | null;
  created_at: string | null;
};

const FALLBACK_CATEGORIES = [
  "All",
  "Vegetables",
  "Fruits",
  "Spices",
  "Nuts",
  "Eggs",
  "Oils",
];

export default function PricesScreen() {
  const { width } = useWindowDimensions();
  const isSmallPhone = width < 380;

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [showDateModal, setShowDateModal] = useState(false);

  async function fetchProducts(isRefresh = false) {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select(`
          id,
          slug,
          name,
          category,
          unit,
          packaging,
          image_url,
          active,
          market_price_aed,
          myveg_price_aed,
          price_note,
          origin_country,
          shipment_mode,
          updated_at,
          sort_order
        `)
        .eq("active", true)
        .order("category", { ascending: true })
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (productsError) throw productsError;

      const { startIso, endIso } = getDayRange(selectedDate);

      const { data: updatesData, error: updatesError } = await supabase
        .from("price_updates")
        .select(`
          published_product_id,
          price,
          created_at
        `)
        .eq("status", "approved")
        .not("published_product_id", "is", null)
        .gte("created_at", startIso)
        .lte("created_at", endIso)
        .order("created_at", { ascending: true });

      if (updatesError) throw updatesError;

      const groupedMap = new Map<
        string,
        {
          min_price: number | null;
          max_price: number | null;
          latest_updated_at: string | null;
          selected_date_price: number | null;
        }
      >();

      (updatesData as PriceUpdateRow[] | null)?.forEach((row) => {
        if (!row.published_product_id || row.price == null) return;

        const existing = groupedMap.get(row.published_product_id);

        if (!existing) {
          groupedMap.set(row.published_product_id, {
            min_price: row.price,
            max_price: row.price,
            latest_updated_at: row.created_at,
            selected_date_price: row.price,
          });
        } else {
          const rowDate = row.created_at ? new Date(row.created_at) : null;
          const existingDate = existing.latest_updated_at
            ? new Date(existing.latest_updated_at)
            : null;

          const isNewer =
            !!rowDate && (!existingDate || rowDate.getTime() > existingDate.getTime());

          groupedMap.set(row.published_product_id, {
            min_price:
              existing.min_price == null
                ? row.price
                : Math.min(existing.min_price, row.price),
            max_price:
              existing.max_price == null
                ? row.price
                : Math.max(existing.max_price, row.price),
            latest_updated_at: isNewer ? row.created_at : existing.latest_updated_at,
            selected_date_price: isNewer ? row.price : existing.selected_date_price,
          });
        }
      });

      const mergedProducts: ProductRow[] = (productsData ?? []).map((product) => {
        const stats = groupedMap.get(product.id);

        return {
          ...product,
          selected_date_price: stats?.selected_date_price ?? null,
          min_price: stats?.min_price ?? null,
          max_price: stats?.max_price ?? null,
          latest_updated_at: stats?.latest_updated_at ?? null,
        };
      });

      setProducts(mergedProducts);
    } catch (err) {
      console.error("fetchProducts error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [selectedDate]);

  const categoryOptions = useMemo(() => {
    const dbCategories = Array.from(
      new Set(products.map((p) => (p.category || "").trim()).filter(Boolean))
    );

    const normalized =
      dbCategories.length > 0 ? dbCategories : FALLBACK_CATEGORIES.slice(1);

    return ["All", ...normalized];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const categoryMatch =
        selectedCategory === "All" ||
        (item.category || "").toLowerCase() === selectedCategory.toLowerCase();

      const q = search.trim().toLowerCase();
      const searchMatch =
        q.length === 0 ||
        item.name.toLowerCase().includes(q) ||
        (item.category || "").toLowerCase().includes(q) ||
        (item.packaging || "").toLowerCase().includes(q) ||
        (item.origin_country || "").toLowerCase().includes(q);

      return categoryMatch && searchMatch;
    });
  }, [products, search, selectedCategory]);

  function formatPrice(value: number | null | undefined) {
    if (value === null || value === undefined) return "--";
    return Number(value).toFixed(2);
  }

  function formatUpdatedTime(dateString: string | null | undefined) {
    if (!dateString) return "No update";

    const now = new Date();
    const updated = new Date(dateString);

    if (Number.isNaN(updated.getTime())) return "No update";

    const diffMs = now.getTime() - updated.getTime();
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  function formatBadgeDate(date: Date) {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).toUpperCase();
  }

  function formatInputDate(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function parseInputDate(value: string) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function getDayRange(date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return {
      startIso: start.toISOString(),
      endIso: end.toISOString(),
    };
  }

  function getCategoryIcon(category?: string | null) {
    const c = (category || "").toLowerCase();

    if (c.includes("vegetable")) return "sprout-outline";
    if (c.includes("fruit")) return "food-apple-outline";
    if (c.includes("spice")) return "shaker-outline";
    if (c.includes("nut")) return "peanut-outline";
    if (c.includes("egg")) return "egg-outline";
    if (c.includes("oil")) return "water-outline";

    return "leaf";
  }

  function openDateModal() {
    setTempDate(selectedDate);
    setShowDateModal(true);
  }

  function applyDateSelection() {
    setSelectedDate(tempDate);
    setShowDateModal(false);
  }

  function renderHeader() {
    return (
      <View>
        <View style={styles.headerRow}>
          <View style={styles.brandLeft}>
            <View style={styles.brandIconWrap}>
              <Ionicons name="leaf" size={20} color="#1E6B2A" />
            </View>

            <View>
              <Text style={styles.brandTitle}>MyVegmarket</Text>
              <Text style={styles.brandSubtitle}>Al Aweer Market Prices</Text>
            </View>
          </View>

          <Pressable style={styles.calendarButton} onPress={openDateModal}>
            <Ionicons name="calendar-outline" size={20} color="#64748B" />
          </Pressable>
        </View>

        <View style={styles.dateBadgeWrap}>
          <Text style={styles.dateBadge}>
            {formatBadgeDate(selectedDate)} • LIVE PRICES
          </Text>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search products..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={categoryOptions}
          horizontal
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          renderItem={({ item }) => {
            const active = selectedCategory === item;
            return (
              <Pressable
                onPress={() => setSelectedCategory(item)}
                style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
              >
                <Text
                  style={[
                    styles.chipText,
                    active ? styles.chipTextActive : styles.chipTextInactive,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>
    );
  }

  function renderProduct({ item }: { item: ProductRow }) {
    return (
      <Pressable style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={styles.leftSide}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons
                name={getCategoryIcon(item.category) as any}
                size={isSmallPhone ? 24 : 28}
                color="#7AA27F"
              />
            </View>

            <View style={styles.productTextWrap}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>

              <Text style={styles.productSubtext} numberOfLines={1}>
                {[item.packaging, item.unit].filter(Boolean).join(" • ") ||
                  "Packaging details unavailable"}
              </Text>
            </View>
          </View>

          <View style={styles.rightSide}>
            <Text style={styles.priceText}>
              {formatPrice(item.selected_date_price)}{" "}
              <Text style={styles.aedText}>AED</Text>
            </Text>

            <View style={styles.updatedRow}>
              <Ionicons name="time-outline" size={12} color="#94A3B8" />
              <Text style={styles.updatedText}>
                {formatUpdatedTime(item.latest_updated_at)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBottomRow}>
          <View style={styles.minMaxWrap}>
            <Text style={styles.minMaxText}>
              Min: <Text style={styles.minMaxValue}>{formatPrice(item.min_price)}</Text>
            </Text>
            <Text style={styles.minMaxText}>
              Max: <Text style={styles.minMaxValue}>{formatPrice(item.max_price)}</Text>
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
        </View>

        {!!item.price_note && (
          <Text style={styles.noteText} numberOfLines={2}>
            {item.price_note}
          </Text>
        )}
      </Pressable>
    );
  }

  function renderDateModal() {
    return (
      <Modal
        transparent
        visible={showDateModal}
        animationType="fade"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Date</Text>
            <Text style={styles.modalSubtitle}>
              Choose a date to view that day’s Al Aweer prices.
            </Text>

            {Platform.OS === "web" ? (
              <View style={styles.webDateWrap}>
                <input
                  type="date"
                  value={formatInputDate(tempDate)}
                  max={formatInputDate(new Date())}
                  onChange={(e) => setTempDate(parseInputDate(e.target.value))}
                  style={{
                    width: "100%",
                    height: 48,
                    borderRadius: 12,
                    border: "1px solid #D0D5DD",
                    padding: "0 14px",
                    fontSize: 16,
                    outline: "none",
                    boxSizing: "border-box",
                    display: "block",
                    backgroundColor: "#FFFFFF",
                  }}
                />
              </View>
            ) : (
              <View style={styles.nativePickerWrap}>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  maximumDate={new Date()}
                  onChange={(_, date) => {
                    if (date) setTempDate(date);
                  }}
                />
              </View>
            )}

            <View style={styles.modalButtonRow}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.applyButton]}
                onPress={applyDateSelection}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#1E6B2A" />
          <Text style={styles.loaderText}>Loading prices...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.screen}>
        {renderDateModal()}

        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={() => fetchProducts(true)}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySubtitle}>Try another search or category.</Text>
            </View>
          }
        />
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
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  brandLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEF3EC",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E6B2A",
  },
  brandSubtitle: {
    fontSize: 13,
    color: "#667085",
    marginTop: 2,
  },
  calendarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E8ECEF",
  },
  dateBadgeWrap: {
    alignItems: "center",
    marginBottom: 18,
  },
  dateBadge: {
    backgroundColor: "#E9F1E7",
    color: "#2B6B2D",
    fontWeight: "800",
    fontSize: 13,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    overflow: "hidden",
  },
  searchWrap: {
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
    marginLeft: 10,
  },
  chipsRow: {
    paddingBottom: 10,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 999,
  },
  chipActive: {
    backgroundColor: "#1E6B2A",
  },
  chipInactive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipText: {
    fontSize: 15,
    fontWeight: "700",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  chipTextInactive: {
    color: "#475467",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#EFF2F4",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  leftSide: {
    flexDirection: "row",
    flex: 1,
    gap: 12,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F2F5F1",
    alignItems: "center",
    justifyContent: "center",
  },
  productTextWrap: {
    flex: 1,
    paddingTop: 2,
  },
  productName: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  productSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: "#667085",
  },
  rightSide: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
    maxWidth: 120,
  },
  priceText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E6B2A",
    textAlign: "right",
  },
  aedText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E6B2A",
  },
  updatedRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  updatedText: {
    fontSize: 12,
    color: "#94A3B8",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEF2F6",
    marginTop: 14,
    marginBottom: 12,
  },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  minMaxWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    flex: 1,
    flexWrap: "wrap",
  },
  minMaxText: {
    fontSize: 13,
    color: "#667085",
  },
  minMaxValue: {
    color: "#0F172A",
    fontWeight: "700",
  },
  noteText: {
    marginTop: 10,
    fontSize: 12,
    color: "#7C8A9A",
    lineHeight: 18,
  },
  emptyWrap: {
    paddingTop: 60,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#667085",
  },
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loaderText: {
    fontSize: 15,
    color: "#667085",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "#667085",
  },
  webDateWrap: {
    marginTop: 18,
    width: "100%",
  },
  nativePickerWrap: {
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 18,
  },
  modalButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  applyButton: {
    backgroundColor: "#1E6B2A",
  },
  cancelButtonText: {
    color: "#475467",
    fontWeight: "700",
    fontSize: 14,
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});