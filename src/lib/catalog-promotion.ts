import { db } from "@/db";
import { items, catalogProducts } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";

const STABILITY_DAYS = 7;

/**
 * Check if an item qualifies for catalog promotion and insert it if so.
 * Called when an item is added to a trip pack.
 *
 * Criteria:
 * - Item has both brand AND model filled in
 * - Item name hasn't changed in 7+ days (stable)
 * - No duplicate exists in catalog_products for this brand+model
 */
export async function maybePromoteToCatalog(itemId: string): Promise<boolean> {
  const item = await db.query.items.findFirst({
    where: eq(items.id, itemId),
  });

  if (!item) return false;

  // Must have brand and model
  if (!item.brand?.trim() || !item.model?.trim()) return false;

  // Must be stable (not updated in the last 7 days)
  const updatedAt = item.updatedAt;
  const now = new Date();
  const daysSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate < STABILITY_DAYS) return false;

  // Check for existing catalog entry
  const brand = item.brand.trim();
  const model = item.model.trim();
  const existing = await db
    .select({ id: catalogProducts.id })
    .from(catalogProducts)
    .where(
      and(
        sql`lower(${catalogProducts.brand}) = ${brand.toLowerCase()}`,
        sql`lower(${catalogProducts.model}) = ${model.toLowerCase()}`
      )
    )
    .limit(1);

  if (existing.length > 0) return false;

  // Promote to catalog
  await db.insert(catalogProducts).values({
    brand,
    model,
    searchText: `${brand} ${model}`.toLowerCase(),
    categorySuggestion: null, // Could infer from item's category
    source: "community",
    sourceCount: 1,
  });

  return true;
}
