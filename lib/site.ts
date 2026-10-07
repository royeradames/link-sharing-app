// One site name for the visible home identity, og:site_name and the
// WebSite JSON-LD, with the project's production URL as the canonical url.
export const SITE_NAME = "Devlinks"
export const SITE_URL = "https://link-sharing-app-self.vercel.app"
export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: `${SITE_URL}/`,
}
