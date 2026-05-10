import { getCachedRoomTypes } from "@/lib/cache";

/**
 * Get the primary villa/property type ID from the Central Backend.
 * Returns the first active property type's ID.
 */
export async function getVillaRoomTypeId(): Promise<string> {
  const types = (await getCachedRoomTypes()) as { id: string; status?: string }[];
  if (Array.isArray(types) && types.length > 0) {
    return types[0]!.id;
  }
  return '';
}
