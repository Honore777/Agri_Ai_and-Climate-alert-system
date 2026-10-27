/**
 * Translate a backend disease class name (e.g. "Maize_Common_rust")
 * into the active locale. Falls back to a humanized English label
 * when no translation exists (e.g. legacy 38-class names).
 */
export function diseaseLabel(
  t: (key: string) => string,
  name?: string | null
): string {
  if (!name) return '';
  const key = `diseases.${name}`;
  const translated = t(key);
  // t() returns the key itself when no locale has an entry
  return translated === key ? name.replace(/_/g, ' ').trim() : translated;
}
