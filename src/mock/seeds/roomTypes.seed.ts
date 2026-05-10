/**
 * Seed data for the "roomTypes" store.
 *
 * Represents different villa/room categories at ViCity.
 */

const roomTypes = [
  {
    id: "rt-001",
    name: "The Grand Suite",
    slug: "grand-suite",
    description:
      "An exquisite 4-bedroom private villa with a sprawling courtyard, infinity pool, lush gardens, and panoramic views of the Arabian Sea. Features include a fully equipped modern kitchen, private chef service, home theatre, and dedicated staff quarters. Perfect for families, celebrations, or a luxury getaway.",
    basePrice: 2500000,
    maxGuests: 8,
    bedType: "King",
    unitSize: "5500 sq ft",
    roomSize: 5500,
    images: [
      "/images/villa-exterior-1.jpg",
      "/images/villa-pool-1.jpg",
      "/images/villa-bedroom-1.jpg",
      "/images/villa-living-1.jpg",
      "/images/villa-kitchen-1.jpg",
      "/images/villa-garden-1.jpg",
    ],
    status: "active",
    amenities: [
      { id: "am-001", name: "Private Pool", icon: "FaSwimmingPool", category: "Outdoor" },
      { id: "am-002", name: "Wi-Fi", icon: "FaWifi", category: "Essentials" },
      { id: "am-003", name: "Air Conditioning", icon: "FaSnowflake", category: "Essentials" },
      { id: "am-004", name: "Home Theatre", icon: "FaTv", category: "Entertainment" },
      { id: "am-005", name: "Private Chef", icon: "FaUtensils", category: "Dining" },
      { id: "am-006", name: "Garden", icon: "FaTree", category: "Outdoor" },
      { id: "am-007", name: "Parking", icon: "FaCar", category: "Essentials" },
      { id: "am-008", name: "BBQ Grill", icon: "FaFire", category: "Outdoor" },
      { id: "am-009", name: "Gym", icon: "FaDumbbell", category: "Wellness" },
      { id: "am-010", name: "24/7 Security", icon: "FaShieldAlt", category: "Safety" },
    ],
  },
  {
    id: "rt-002",
    name: "The Garden Suite",
    slug: "garden-suite",
    description:
      "A charming 2-bedroom garden suite nestled within the villa grounds. Features a private sit-out overlooking the tropical garden, kitchenette, and direct pool access. Ideal for couples or small families seeking an intimate retreat.",
    basePrice: 1200000,
    maxGuests: 4,
    bedType: "Queen",
    unitSize: "1800 sq ft",
    roomSize: 1800,
    images: [
      "/images/suite-exterior-1.jpg",
      "/images/suite-bedroom-1.jpg",
      "/images/suite-garden-1.jpg",
    ],
    status: "active",
    amenities: [
      { id: "am-002", name: "Wi-Fi", icon: "FaWifi", category: "Essentials" },
      { id: "am-003", name: "Air Conditioning", icon: "FaSnowflake", category: "Essentials" },
      { id: "am-006", name: "Garden", icon: "FaTree", category: "Outdoor" },
      { id: "am-007", name: "Parking", icon: "FaCar", category: "Essentials" },
      { id: "am-011", name: "Kitchenette", icon: "FaBlender", category: "Dining" },
      { id: "am-010", name: "24/7 Security", icon: "FaShieldAlt", category: "Safety" },
    ],
  },
  {
    id: "rt-003",
    name: "The Pool Cabana",
    slug: "pool-cabana",
    description:
      "A stylish 1-bedroom poolside cabana with floor-to-ceiling windows, rain shower, and a private deck with sun loungers. Wake up to the sound of water and step straight into the pool. Perfect for a romantic getaway.",
    basePrice: 800000,
    maxGuests: 2,
    bedType: "King",
    unitSize: "900 sq ft",
    roomSize: 900,
    images: [
      "/images/cabana-exterior-1.jpg",
      "/images/cabana-interior-1.jpg",
    ],
    status: "active",
    amenities: [
      { id: "am-001", name: "Private Pool", icon: "FaSwimmingPool", category: "Outdoor" },
      { id: "am-002", name: "Wi-Fi", icon: "FaWifi", category: "Essentials" },
      { id: "am-003", name: "Air Conditioning", icon: "FaSnowflake", category: "Essentials" },
      { id: "am-012", name: "Rain Shower", icon: "FaShower", category: "Bathroom" },
      { id: "am-010", name: "24/7 Security", icon: "FaShieldAlt", category: "Safety" },
    ],
  },
  {
    id: "rt-004",
    name: "The Heritage Room",
    slug: "heritage-room",
    description:
      "A beautifully restored heritage room with antique furnishings, exposed brick walls, and hand-painted Rajasthani tiles. Features a four-poster bed, writing desk, and a balcony with garden views.",
    basePrice: 500000,
    maxGuests: 2,
    bedType: "King",
    unitSize: "650 sq ft",
    roomSize: 650,
    images: [
      "/images/heritage-room-1.jpg",
      "/images/heritage-room-2.jpg",
    ],
    status: "active",
    amenities: [
      { id: "am-002", name: "Wi-Fi", icon: "FaWifi", category: "Essentials" },
      { id: "am-003", name: "Air Conditioning", icon: "FaSnowflake", category: "Essentials" },
      { id: "am-013", name: "Balcony", icon: "FaDoorOpen", category: "Outdoor" },
      { id: "am-010", name: "24/7 Security", icon: "FaShieldAlt", category: "Safety" },
    ],
  },
  {
    id: "rt-005",
    name: "The Penthouse Terrace",
    slug: "penthouse-terrace",
    description:
      "An expansive 3-bedroom penthouse with a private rooftop terrace, jacuzzi, and 360-degree city and sea views. The ultimate luxury experience with butler service and a fully stocked bar.",
    basePrice: 3500000,
    maxGuests: 6,
    bedType: "King",
    unitSize: "4200 sq ft",
    roomSize: 4200,
    images: [
      "/images/penthouse-1.jpg",
      "/images/penthouse-terrace-1.jpg",
      "/images/penthouse-bedroom-1.jpg",
    ],
    status: "maintenance",
    amenities: [
      { id: "am-001", name: "Private Pool", icon: "FaSwimmingPool", category: "Outdoor" },
      { id: "am-002", name: "Wi-Fi", icon: "FaWifi", category: "Essentials" },
      { id: "am-003", name: "Air Conditioning", icon: "FaSnowflake", category: "Essentials" },
      { id: "am-004", name: "Home Theatre", icon: "FaTv", category: "Entertainment" },
      { id: "am-014", name: "Jacuzzi", icon: "FaHotTub", category: "Wellness" },
      { id: "am-015", name: "Butler Service", icon: "FaConciergeBell", category: "Service" },
      { id: "am-007", name: "Parking", icon: "FaCar", category: "Essentials" },
      { id: "am-010", name: "24/7 Security", icon: "FaShieldAlt", category: "Safety" },
    ],
  },
];

export default roomTypes;
