import { siteConfig } from "./site";

/** The optional pages that are on (lib/settings.ts → siteFeatures(); the owner switches them in Settings, C23b). */
export type NavFeatures = { resources: boolean; team: boolean; events: boolean };
/** Build-time defaults, for places that can't read live settings. */
export const DEFAULT_NAV_FEATURES: NavFeatures = { resources: siteConfig.features.resources, team: siteConfig.features.team, events: siteConfig.features.events };

export type NavItem = { label: string; href: string; children?: NavItem[] };

/** D-033 / Step 16.2: primary navigation follows visitor intent. */
export const primaryNavFor = (f: NavFeatures): NavItem[] => [
  { label: "Home", href: "/" }, // WEB-001
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "All services", href: "/services" },
      { label: "Massage & Bodywork", href: "/services/massage-bodywork" },
      { label: "Functional Strength", href: "/services/functional-strength" },
      { label: "Women’s Wellness", href: "/services/womens-wellness" },
      { label: "Integrated Nutrition", href: "/services/integrated-nutrition" },
      { label: "Holistic Life Coaching", href: "/services/holistic-life-coaching" },
    ],
  },
  { label: "The TAB Method", href: "/tab-method" },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "About TAB", href: "/about" },
      { label: "Our Story", href: "/about/our-story" },
      ...(f.team ? [{ label: "Our Team", href: "/about/team" }] : []),
      { label: "Contact", href: "/contact" }, // owner request 2026-10-06: Contact sits under About
    ],
  },
  ...(f.resources ? [{ label: "Resources", href: "/resources" }] : []),
];

export const footerNavFor = (f: NavFeatures) => ({
  explore: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "The TAB Method", href: "/tab-method" },
    { label: "About", href: "/about" },
    ...(f.resources ? [{ label: "Resources", href: "/resources" }] : []),
  ],
  getStarted: [
    { label: "Start Where You Are", href: "/start" },
    { label: "Book", href: "/book" },
    { label: "Contact", href: "/contact" },
  ],
  tab: [
    { label: "Our Story", href: "/about/our-story" },
    ...(f.team ? [{ label: "Our Team", href: "/about/team" }] : []),
    { label: "FAQ", href: "/faq" },
    ...(f.events ? [{ label: "Events & Workshops", href: "/events" }] : []),
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Accessibility", href: "/accessibility" },
    { label: "Client policies", href: "/policies" },
    { label: "Cancellation policy", href: "/policies#cancellation" },
    { label: "Service disclaimers", href: "/policies#scope" },
  ],
});
