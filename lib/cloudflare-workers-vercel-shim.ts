/**
 * Vercel build shim for the Cloudflare-only runtime module.
 *
 * The API's existing binding guard treats the absent DB as unavailable and
 * returns an explicit 503. The Sites build continues to resolve the real
 * `cloudflare:workers` module through Vinext/Cloudflare.
 */
export const env: Record<string, never> = {};