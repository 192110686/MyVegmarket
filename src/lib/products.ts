export type ProductCategory = "vegetables" | "fruits" | "eggs";

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  origin: string;
  type: "Organic" | "Regular";
  unit: string;
  marketAvg: number;
  myPrice: number;
  image: string;
  badgeColor: string;
  about?: string;
  packaging?: string;
  freshness?: string;
};

export const PRODUCTS: Product[] = [
  // Vegetables
  {
    id: "tomato-local",
    name: "Cherry Tomatoes (Local)",
    subtitle: "Premium Hydroponic Grade • 1.5kg Box",
    category: "vegetables",
    origin: "UAE",
    type: "Organic",
    unit: "Box",
    marketAvg: 18.5,
    myPrice: 14.25,
    image:
      "https://images.unsplash.com/photo-1546470427-e26264be0b95?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-red-600",
    packaging: "1.5kg Box",
    freshness: "Harvested 24h ago",
    about:
      "Hand-picked and packed fresh for premium kitchens. Consistent quality, clean grading, and stable supply for daily operations.",
  },
  {
    id: "bellpepper-nl",
    name: "Holland Bell Peppers",
    subtitle: "Mixed Colors (Red, Yellow) • 5kg Carton",
    category: "vegetables",
    origin: "Netherlands",
    type: "Regular",
    unit: "Carton",
    marketAvg: 85,
    myPrice: 72,
    image:
      "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-orange-500",
    packaging: "5kg Carton",
    freshness: "Import Batch Today",
    about:
      "Mixed-color premium peppers with firm texture and vibrant color. Ideal for hotels, restaurants, and bulk menus.",
  },
  {
    id: "iceberg-jo",
    name: "Iceberg Lettuce",
    subtitle: "Premium Export Grade • Per KG",
    category: "vegetables",
    origin: "Jordan",
    type: "Regular",
    unit: "KG",
    marketAvg: 9.5,
    myPrice: 6.75,
    image:
      "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-green-700",
    packaging: "Per KG",
    freshness: "Arrived This Morning",
    about:
      "Fresh iceberg lettuce, crisp and clean. Great for salads and sandwich chains requiring consistent crunch.",
  },
  {
    id: "onion-om",
    name: "Red Onions (Oman)",
    subtitle: "Medium Size • 10kg Bag",
    category: "vegetables",
    origin: "Oman",
    type: "Regular",
    unit: "Bag",
    marketAvg: 32,
    myPrice: 26.5,
    image:
      "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-red-800",
    packaging: "10kg Bag",
    freshness: "Daily Supply",
    about:
      "Stable daily onion supply with consistent sizing, perfect for large kitchens and bulk meal production.",
  },

  // Fruits
  {
    id: "berries-us",
    name: "Mixed Berries",
    subtitle: "Premium Box • 1kg",
    category: "fruits",
    origin: "USA",
    type: "Organic",
    unit: "Box",
    marketAvg: 58,
    myPrice: 49,
    image:
      "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-pink-600",
    packaging: "1kg Box",
    freshness: "Cold Chain Delivered",
    about:
      "Premium organic berries for desserts, smoothie bars and catering. Stored and delivered in cold chain.",
  },
  {
    id: "oranges-eg",
    name: "Valencia Oranges",
    subtitle: "Fresh Import • 15kg Carton",
    category: "fruits",
    origin: "Egypt",
    type: "Regular",
    unit: "Carton",
    marketAvg: 75,
    myPrice: 68,
    image:
      "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-orange-600",
    packaging: "15kg Carton",
    freshness: "Import Batch Today",
    about:
      "Juicy Valencia oranges with consistent sweetness. Ideal for juice stations and hotel breakfast service.",
  },

  // Eggs
  {
    id: "eggs-uae",
    name: "Farm Fresh Eggs",
    subtitle: "Free-range • 30 pcs Tray",
    category: "eggs",
    origin: "UAE",
    type: "Organic",
    unit: "Tray",
    marketAvg: 19,
    myPrice: 16.5,
    image:
      "https://images.unsplash.com/photo-1587486912758-4367d2017d6c?auto=format&fit=crop&w=1600&q=80",
    badgeColor: "bg-neutral-700",
    packaging: "30 pcs Tray",
    freshness: "Collected Today",
    about:
      "Locally sourced eggs with stable daily availability. Perfect for bakeries, cafes, and bulk breakfast operations.",
  },
];
