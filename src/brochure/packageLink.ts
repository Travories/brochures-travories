import type { BrochurePackageSource } from "./source.js";

const SITE_ORIGIN = "https://travories.com";

/** Shape returned by `GET /packages/resolve`. */
interface ResolvedPath {
  canonicalPath?: string | null;
}

/**
 * Public URL for a package, or null when it has no public page.
 *
 * Package payloads carry their canonical `url` and `packageCode`; the
 * agency-suffixed `slug` is gone from the API. We still ask the resolver that
 * backs every package 301, by code (or, for an older payload, by slug):
 * `uniqueCode` ("VH-NPHHL8QJ") is a different identifier from `packageCode`
 * ("hij") and must never be used here.
 *
 * Returns null for unpublished packages — the resolver answers null for
 * anything not live, and a QR code pointing at a 404 is worse than none.
 */
export async function resolvePackageUrl(pkg: BrochurePackageSource): Promise<string | null> {
  const ref = pkg.packageCode?.trim() || pkg.slug?.trim();
  if (!ref) return null;

  const base = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL)?.replace(/\/$/, "");
  if (!base) return null;

  try {
    const response = await fetch(
      `${base}/packages/resolve?path=${encodeURIComponent(`/package/${ref}`)}`,
      { cache: "no-store" },
    );
    if (!response.ok) return null;

    const text = await response.text();
    if (!text.trim()) return null;

    const resolved = JSON.parse(text) as ResolvedPath | null;
    const path = resolved?.canonicalPath?.trim();
    return path ? `${SITE_ORIGIN}${path}` : null;
  } catch {
    return null;
  }
}
