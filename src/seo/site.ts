/** Where the site lives when nothing else says so (the production Vercel domain). */
export const DEFAULT_SITE_URL = "https://landing-page-ontable.vercel.app";

interface SiteEnv {
	VITE_SITE_URL?: string;
	/** Set by Vercel at build time: the production host, without a protocol. */
	VERCEL_PROJECT_PRODUCTION_URL?: string;
}

/**
 * The absolute address every canonical, Open Graph and sitemap URL is built
 * from, without a trailing slash: `VITE_SITE_URL` first, then Vercel's
 * production host, then the default.
 */
export function resolveSiteUrl(env: SiteEnv = {}): string {
	const explicit = env.VITE_SITE_URL?.trim();
	const vercel = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
	const raw = explicit || (vercel ? `https://${vercel}` : DEFAULT_SITE_URL);
	const withProtocol = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
	return withProtocol.replace(/\/+$/, "");
}

/** `path` on the site, as an absolute URL. */
export function absoluteUrl(siteUrl: string, path: string): string {
	return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
