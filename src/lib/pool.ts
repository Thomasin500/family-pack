// Pool filter rules for the trip Gear Pool.
//
// Items live either in the pool or in a pack — never both — UNLESS
// item.allowMultiple is true, in which case they always stay visible in
// the pool so they can be assigned to additional packs (think: water
// bottles, fuel canisters, days-of-food).

interface PackItemLite {
  itemId?: string | null;
  quantity?: number | null;
  item?: { id?: string | null } | null;
}

interface PackLite {
  packItems?: PackItemLite[] | null;
}

interface ItemLite {
  id: string;
  allowMultiple?: boolean | null;
}

/** Map of itemId → total quantity assigned across all packs in a trip. */
export function computePackedQuantities(packs: PackLite[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const pack of packs ?? []) {
    for (const pi of pack.packItems ?? []) {
      const id = pi.item?.id ?? pi.itemId;
      if (!id) continue;
      counts[id] = (counts[id] ?? 0) + (pi.quantity ?? 1);
    }
  }
  return counts;
}

/** Items eligible to appear in the Gear Pool for a trip. */
export function filterPoolItems<T extends ItemLite>(
  items: T[],
  packedQuantities: Record<string, number>
): T[] {
  return items.filter((it) => {
    const packed = packedQuantities[it.id] ?? 0;
    if (packed === 0) return true;
    return !!it.allowMultiple;
  });
}
