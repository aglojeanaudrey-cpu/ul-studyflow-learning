/**
 * Transforme une URL Cloudinary en URL optimisée (WebP + qualité auto + largeur max).
 * Si l'URL n'est pas Cloudinary, elle est retournée telle quelle.
 */
export function optimizeCloudinaryUrl(
  url: string | null | undefined,
  width = 800,
): string {
  if (!url) return "";
  if (!url.includes("cloudinary.com")) return url;

  // Éviter de doubler les transformations si déjà présente
  if (url.includes("/f_auto") || url.includes("/q_auto")) return url;

  // Insérer la transformation après /upload/
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`);
}
