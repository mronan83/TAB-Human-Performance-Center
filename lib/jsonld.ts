import { siteConfig, siteUrl } from "@/config/site";
import { services } from "@/content/services";

/** LocalBusiness structured data; omits address fields until they are configured (Step 16.6). */
export function organizationJsonLd() {
  const { contact, brand, social } = siteConfig;
  const hasAddress = contact.address.street && contact.address.city;
  return {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: brand.name,
    alternateName: brand.legacyName, // helps search engines connect the old and new names
    url: siteUrl,
    logo: `${siteUrl}/brand/logo-primary-stacked.png`,
    email: contact.email,
    ...(contact.phone ? { telephone: contact.phone } : {}),
    ...(hasAddress
      ? { address: { "@type": "PostalAddress", streetAddress: contact.address.street, addressLocality: contact.address.city, addressRegion: contact.address.region, postalCode: contact.address.postalCode, addressCountry: contact.address.country } }
      : {}),
    foundingDate: String(brand.foundedYear),
    sameAs: Object.values(social).filter(Boolean),
    makesOffer: services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.name, url: `${siteUrl}/services/${s.slug}` } })),
  };
}
