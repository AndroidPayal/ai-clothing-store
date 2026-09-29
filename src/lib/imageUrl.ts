const ALLOWED_IMAGE_HOSTS = new Set([
  "cdn.europosters.eu", "i00.eu", "babymonk.co", "outlanddenim.com",
  "eirenestudio.com", "images.unsplash.com",
]);

export function validateProductImageUrl(value: string, field: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !ALLOWED_IMAGE_HOSTS.has(url.hostname)) throw new Error();
    return url.toString();
  } catch {
    throw new Error(`Invalid ${field} URL: host must be configured for Next Image`);
  }
}
