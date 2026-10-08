// One site name for the visible home identity, og:site_name and the
// WebSite JSON-LD, with the project's production URL as the canonical url.
export const SITE_NAME = "Devlinks"
export const SITE_URL = "https://link-sharing-app.royeradames.com"
export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: `${SITE_URL}/`,
}

/** Open Graph for one route: the shared site name plus that route's own og:url.
 *  A page's openGraph replaces the layout's, so each page passes its path. */
export function openGraphFor(path: string) {
  return { siteName: SITE_NAME, type: "website" as const, url: path }
}
