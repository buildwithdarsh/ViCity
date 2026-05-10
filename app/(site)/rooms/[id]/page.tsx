import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCachedRoomType, getCachedRoomTypes } from "@/lib/cache";
import { buildPageMetadata, siteUrl } from "@/lib/seo";
import RoomDetailClient from "./RoomDetailClient";

export const revalidate = 3600; // ISR: regenerate every 1 hour

interface PageParams {
  id: string;
}

/** Local storefront room detail shape — SDK's PropertyType uses different field names/types
 *  (unitSize: string|null vs roomSize: number, different amenities nesting).
 *  Keep until SDK aligns storefront response shape or adds a StorefrontRoomType. */
interface RoomData {
  id: string;
  name: string;
  maxGuests: number;
  bedType: string;
  roomSize: number;
  description: string;
  images: string[];
  amenities?: { amenity: { id: string; name: string; icon: string | null } }[];
}

// Pre-render all active rooms at build time for instant loading
export async function generateStaticParams() {
  try {
    const items = (await getCachedRoomTypes()) as { id: string }[];
    return items.map((room) => ({ id: room.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const { id } = await params;

  try {
    const room = (await getCachedRoomType(id)) as RoomData | null;
    if (!room) throw new Error("Room not found");
    const description = room.description?.slice(0, 156) || "Explore room amenities, policies, and availability details for this ViCity stay option in Your City.";

    return buildPageMetadata({
      title: `${room.name} | ViCity Room Details`,
      description,
      path: `/rooms/${id}`,
      type: "article",
    });
  } catch {
    return buildPageMetadata({
      title: "Room Details | ViCity",
      description: "View room details, amenities, and stay information at ViCity.",
      path: `/rooms/${id}`,
      type: "article",
    });
  }
}

export default async function RoomDetailPage({ params }: { params: Promise<PageParams> }) {
  const { id } = await params;

  const room = (await getCachedRoomType(id)) as RoomData | null;
  if (!room) notFound();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Rooms",
        item: `${siteUrl}/rooms`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: room.name,
        item: `${siteUrl}/rooms/${room.id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <RoomDetailClient room={room} />
    </>
  );
}
