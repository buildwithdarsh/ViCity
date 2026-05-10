import HomeClient, { type HomeReview } from "./HomeClient";
import { getCachedPublicReviews, getCachedVillaBasePrice } from "@/lib/cache";
import { getSiteConfig } from "@/lib/config";

export const revalidate = 3600; // ISR: regenerate every 1 hour

async function getHomeData(): Promise<{ reviews: HomeReview[]; currencySymbol: string; maxGuestsIncluded: number; basePrice: number }> {
  const config = await getSiteConfig();

  try {
    const [rawReviews, basePrice] = await Promise.all([
      getCachedPublicReviews(),
      getCachedVillaBasePrice(),
    ]);

    const reviews: HomeReview[] = ((Array.isArray(rawReviews) ? rawReviews : []) as Record<string, unknown>[])
      .slice(0, 3)
      .map((item) => ({
        id: (item['id'] as string) ?? '',
        rating: (item['rating'] as number) ?? 5,
        body: (item['body'] as string) ?? '',
        user: { name: ((item['user'] as Record<string, unknown>)?.['name'] as string) ?? 'Guest' },
        roomType: { name: ((item['roomType'] as Record<string, unknown>)?.['name'] as string) ?? '' },
      }));

    return { currencySymbol: config.branding.currency_symbol, maxGuestsIncluded: config.property.max_guests_included, basePrice, reviews };
  } catch {
    return { reviews: [], currencySymbol: config.branding.currency_symbol, maxGuestsIncluded: config.property.max_guests_included, basePrice: 0 };
  }
}

export default async function HomePage() {
  const { reviews, currencySymbol, maxGuestsIncluded, basePrice } = await getHomeData();
  return <HomeClient reviews={reviews} currencySymbol={currencySymbol} maxGuestsIncluded={maxGuestsIncluded} basePrice={basePrice} />;
}
