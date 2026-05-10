// Server-side data — mock mode: returns static seed data directly (no fetch).

import roomTypesSeed from "@/src/mock/seeds/roomTypes.seed";
import reviewsSeed from "@/src/mock/seeds/reviews.seed";

/**
 * Transform flat amenities into the nested shape the UI expects:
 * { amenity: { id, name, icon } }
 */
function transformRoomType(rt: (typeof roomTypesSeed)[number]) {
  return {
    ...rt,
    amenities: rt.amenities.map((a) => ({ amenity: { id: a.id, name: a.name, icon: a.icon } })),
  };
}

export async function getCachedRoomTypes() {
  return roomTypesSeed.map(transformRoomType);
}

export async function getCachedRoomType(id: string) {
  const rt = roomTypesSeed.find((r) => r.id === id);
  return rt ? transformRoomType(rt) : null;
}

export async function getCachedVillaBasePrice(): Promise<number> {
  return roomTypesSeed[0]?.basePrice ?? 0;
}

export async function getCachedPublicReviews() {
  return reviewsSeed.filter((r) => r.status === "approved");
}
