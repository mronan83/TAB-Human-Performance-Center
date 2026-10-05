import { siteConfig, siteUrl } from "@/config/site";
import { services, type Faq, type Service } from "@/content/services";

/** Structured data (NFR-003; S16 §16.8): Organization / LocalBusiness, Service, breadcrumbs, and FAQ only where eligible. */
const ORG_ID = `${siteUrl}/#organization`;
const areaServed = () => siteConfig.location.areaServed.map((name) => ({ "@type": "City", name }));

/** LocalBusiness structured data; omits address fields until they are configured (Step 16.6). */
export function organizationJsonLd() {
  const { contact, brand, social } = siteConfig;
  const hasAddress = contact.address.street && contact.address.city;
  return {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "@id": ORG_ID,
    name: brand.name,
    alternateName: brand.legacyName, // helps search engines connect the old and new names
    url: siteUrl,
    logo: `${siteUrl}/brand/logo-stacked-600.png`,
    email: contact.email,
    ...(contact.phone ? { telephone: contact.phone } : {}),
    ...(hasAddress
      ? { address: { "@type": "PostalAddress", streetAddress: contact.address.street, addressLocality: contact.address.city, addressRegion: contact.address.region, postalCode: contact.address.postalCode, addressCountry: contact.address.country } }
      : {}),
    areaServed: areaServed(),
    foundingDate: String(brand.foundedYear),
    sameAs: Object.values(social).filter(Boolean),
    makesOffer: services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.name, url: `${siteUrl}/services/${s.path}` } })),
  };
}

/** One Service per service page, provided by the organization above. No medical schema (S16 §16.8). */
export function serviceJsonLd(s: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    serviceType: s.name,
    description: s.metaDescription,
    url: `${siteUrl}/services/${s.path}`,
    provider: { "@id": ORG_ID },
    areaServed: areaServed(),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: `${siteUrl}${item.path}` })),
  };
}

/** FAQ markup only for answers that are reviewed (not draft) and visible on the page; null when none qualify. */
export function faqJsonLd(faqs: Faq[]) {
  const published = faqs.filter((f) => !f.draft);
  if (!published.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: published.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
