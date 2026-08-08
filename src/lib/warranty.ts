const WARRANTY_KEYWORDS = [
  "charger",
  "charging",
  "adapter",
  "earbud",
  "earbuds",
  "earphone",
  "earphones",
  "headphone",
  "headphones",
  "tws",
  "neckband",
  "wire",
  "cable",
  "data cable",
  "accessor",
];

/**
 * Lifetime warranty eligibility: chargers, earbuds and wires/cables.
 * An explicit product flag always wins; otherwise we match on category/name.
 */
export const isWarrantyEligible = (
  opts: { flag?: boolean | null; category?: string | null; name?: string | null }
): boolean => {
  if (opts.flag === true) return true;
  const haystack = `${opts.category ?? ""} ${opts.name ?? ""}`.toLowerCase();
  if (!haystack.trim()) return false;
  return WARRANTY_KEYWORDS.some((k) => haystack.includes(k));
};

export const WARRANTY_SUMMARY =
  "Lifetime warranty against internal faults (dead unit, charging or audio failure). Physical, water, burn, cut-wire or tampering damage is not covered.";
