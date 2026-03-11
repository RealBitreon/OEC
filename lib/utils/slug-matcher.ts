/**
 * Utility for matching Arabic slugs with various normalizations
 */

// Enhanced Arabic text normalization function
export function normalizeArabic(text: string): string {
  return text
    // Normalize ALL forms of Alif (أ إ آ ا)
    .replace(/[\u0623\u0625\u0622\u0627]/g, '\u0627') // Replace with plain Alif
    // Normalize different forms of Ya (ى ئ ي)
    .replace(/[\u0649\u0626\u064A]/g, '\u064A') // Replace with plain Ya
    // Normalize Taa Marbuta and Ha (ة ه)
    .replace(/[\u0629\u0647]/g, '\u0647') // Replace with Ha
    // Normalize different forms of Hamza (ؤ ء ئ)
    .replace(/[\u0624\u0621\u0626]/g, '\u0621') // Replace with plain Hamza
    // Remove ALL diacritics (tashkeel)
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    // Normalize spaces and dashes
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    // Remove trailing dashes
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .trim()
}

/**
 * Find a competition by slug with fuzzy matching
 */
export function findCompetitionBySlug<T extends { slug: string }>(
  competitions: T[],
  slug: string
): T | null {
  // CRITICAL: Decode the slug first if it's URL-encoded
  let decodedSlug = slug
  try {
    // Check if slug is URL-encoded (contains %)
    if (slug.includes('%')) {
      decodedSlug = decodeURIComponent(slug)
    }
  } catch (e) {
    console.error('[SLUG-MATCHER] Error decoding slug:', e)
  }
  
  const trimmedSlug = decodedSlug.replace(/-+$/, '')
  
  console.log('[SLUG-MATCHER] Searching for:', {
    original: slug,
    decoded: decodedSlug,
    trimmed: trimmedSlug,
    normalized: normalizeArabic(decodedSlug)
  })
  
  console.log('[SLUG-MATCHER] Available competitions:', 
    competitions.map(c => ({
      slug: c.slug,
      normalized: normalizeArabic(c.slug)
    }))
  )
  
  // Try exact matches first
  const slugVariations = [
    slug,
    decodedSlug, 
    trimmedSlug,
    normalizeArabic(decodedSlug),
    normalizeArabic(trimmedSlug)
  ]
  
  for (const variation of slugVariations) {
    const found = competitions.find(c => c.slug === variation)
    if (found) {
      console.log('[SLUG-MATCHER] ✓ Found exact match with variation:', variation)
      return found
    }
  }
  
  // If no exact match, try normalized fuzzy matching
  const normalizedSearch = normalizeArabic(decodedSlug)
  
  const found = competitions.find(c => {
    const normalizedDbSlug = normalizeArabic(c.slug || '')
    const match = normalizedDbSlug === normalizedSearch
    if (match) {
      console.log('[SLUG-MATCHER] ✓ Found fuzzy match:', {
        dbSlug: c.slug,
        normalizedDb: normalizedDbSlug,
        normalizedSearch
      })
    }
    return match
  })
  
  if (!found) {
    console.error('[SLUG-MATCHER] ✗ No match found. Available slugs:', 
      competitions.map(c => c.slug)
    )
  }
  
  return found || null
}
