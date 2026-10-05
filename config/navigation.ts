import { siteConfig } from "./site";

export type NavItem = { label: string; href: string; children?: NavItem[] };

/** D-033 / Step 16.2: primary navigation follows visitor intent. */
export const primaryNav: NavItem[] = [
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
      ...(siteConfig.features.team ? [{ label: "Our Team", href: "/about/team" }] : []),
    ],
  },
  ...(siteConfig.features.resources ? [{ label: "Resources", href: "/resources" }] : []),
];

export const footerNav = {
  explore: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "The TAB Method", href: "/tab-method" },
    { label: "About", href: "/about" },
    ...(siteConfig.features.resources ? [{ label: "Resources", href: "/resources" }] : []),
  ],
  getStarted: [
    { label: "Start Where You Are", href: "/start" },
    { label: "Book", href: "/book" },
    { label: "Contact", href: "/contact" },
  ],
  tab: [
    { label: "Our Story", href: "/about/our-story" },
    ...(siteConfig.features.team ? [{ label: "Our Team", href: "/about/team" }] : []),
    { label: "FAQ", href: "/faq" },
    ...(siteConfig.features.events ? [{ label: "Events & Workshops", href: "/events" }] : []),
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Accessibility", href: "/accessibility" },
    { label: "Client policies", href: "/policies" },
    { label: "Cancellation policy", href: "/policies#cancellation" },
    { label: "Service disclaimers", href: "/policies#scope" },
  ],
};
