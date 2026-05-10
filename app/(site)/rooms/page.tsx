import Image from "next/image";
import Link from "next/link";
import { FiUsers, FiMaximize, FiArrowRight } from "react-icons/fi";
import {
  StaggerContainer,
  StaggerItem,
  PageHero,
  BlurFadeIn,
} from "../components/AnimatedSection";
import { getBlurDataURL } from "@/lib/blur-placeholders";
import { getCachedRoomTypes, getCachedVillaBasePrice } from "@/lib/cache";
import { formatCurrency } from "@/lib/utils/currency";

export const revalidate = 3600; // ISR: regenerate every 1 hour

/** Local storefront room shape — SDK's PropertyType uses different field names/types
 *  (unitSize: string|null vs roomSize: number, nullable fields vs required).
 *  Keep until SDK aligns storefront response shape or adds a StorefrontRoomType. */
interface RoomType {
  id: string;
  name: string;
  maxGuests: number;
  bedType: string;
  roomSize: number;
  description: string;
  images: string[];
  status: string;
}

const fallbackImages = [
  "/images/bedroom-brown-wide.webp",
  "/images/bedroom-blue-wide.webp",
  "/images/bedroom-blue-lights.webp",
  "/images/sitting-area-brick-wall.webp",
];

async function getRooms(): Promise<RoomType[]> {
  try {
    const items = (await getCachedRoomTypes()) as RoomType[];

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      maxGuests: item.maxGuests,
      bedType: item.bedType,
      roomSize: item.roomSize,
      description: item.description,
      images: item.images,
      status: item.status,
    }));
  } catch {
    return [];
  }
}

async function getVillaConfig(): Promise<{ basePrice: number; maxGuestsIncluded: number }> {
  try {
    const { getSiteConfig } = await import("@/lib/config");
    const [config, basePrice] = await Promise.all([getSiteConfig(), getCachedVillaBasePrice()]);
    return { basePrice, maxGuestsIncluded: config.property.max_guests_included };
  } catch {
    return { basePrice: 0, maxGuestsIncluded: 6 };
  }
}

export default async function RoomsPage() {
  const [rooms, villaConfig] = await Promise.all([getRooms(), getVillaConfig()]);
  const { basePrice, maxGuestsIncluded } = villaConfig;

  return (
    <div className="bg-cream">
      <PageHero
        eyebrow="ViCity"
        title="Our Rooms"
        subtitle="Three bedrooms. Three stories. All yours."
        backgroundImage="/images/living-room-tv-staircase.webp"
      />

      {/* Rooms Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-5 md:px-6">
          {rooms.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-2xl font-serif text-warm-brown">
                No rooms to display
              </p>
            </div>
          ) : (
            <>
              <h2 className="sr-only">Available room options</h2>
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                {rooms.map((room, i) => (
                  <StaggerItem key={room.id}>
                    <Link href={`/rooms/${room.id}`} className="group block">
                      <div className="rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-charcoal/5 transition-shadow duration-700">
                        <div className="overflow-hidden aspect-[16/10] relative">
                          <Image
                            src={
                              room.images?.[0] ||
                              fallbackImages[i % fallbackImages.length]!
                            }
                            alt={room.name}
                            width={800}
                            height={500}
                            loading="lazy"
                            className="object-cover w-full h-full transition-transform duration-1000 ease-out group-hover:scale-110"
                            placeholder="blur"
                            blurDataURL={getBlurDataURL(room.images?.[0] || fallbackImages[i % fallbackImages.length]!)}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                        <div className="p-6 bg-white">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-serif text-charcoal group-hover:text-gold transition-colors duration-300">
                                {room.name}
                              </h3>
                              <p className="mt-1.5 text-warm-brown/60 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span className="flex items-center gap-1">
                                  <FiMaximize size={13} /> {room.roomSize} sq ft
                                </span>
                                <span className="flex items-center gap-1">
                                  <FiUsers size={13} /> Up to {room.maxGuests}
                                </span>
                                <span>{room.bedType} Bed</span>
                              </p>
                            </div>
                            <FiArrowRight className="text-gold opacity-0 group-hover:opacity-100 mt-1 transition-all duration-500 -translate-x-2 group-hover:translate-x-0" />
                          </div>
                          {room.description && (
                            <p className="mt-3 text-charcoal/50 text-sm line-clamp-2">
                              {room.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </>
          )}
        </div>
      </section>

      {/* Pricing Note */}
      <BlurFadeIn>
        <section className="pb-24">
          <div className="max-w-3xl mx-auto px-5 md:px-6 text-center">
            <div className="border border-sand rounded-2xl py-10 md:py-12 px-6 md:px-8">
              <p className="text-sm uppercase tracking-widest text-gold mb-3">
                Pricing
              </p>
              <p className="text-2xl font-serif text-charcoal leading-relaxed">
                The entire villa — {formatCurrency(basePrice)}/night for up to {maxGuestsIncluded} guests.
              </p>
              <p className="mt-3 text-warm-brown/70 text-base">
                Additional charges for extra guests (up to 10).
              </p>
            </div>
          </div>
        </section>
      </BlurFadeIn>

      {/* CTA */}
      <BlurFadeIn>
        <section className="pb-32">
          <div className="max-w-4xl mx-auto px-5 md:px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-serif text-charcoal">
              Ready to Book?
            </h2>
            <p className="mt-4 text-warm-brown/70 text-lg max-w-xl mx-auto">
              Reserve the entire villa for your next getaway — space for
              everyone, privacy for all.
            </p>
            <Link
              href="/booking"
              className="mt-8 inline-flex items-center gap-2 bg-charcoal text-cream px-8 py-4 rounded-full text-sm tracking-wide uppercase hover:bg-charcoal/90 transition-colors duration-300"
            >
              Book Your Stay
              <FiArrowRight size={16} />
            </Link>
          </div>
        </section>
      </BlurFadeIn>
    </div>
  );
}
