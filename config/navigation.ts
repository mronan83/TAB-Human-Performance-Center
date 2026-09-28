import { siteConfig } from "./site";

export type NavItem = { label: string; href: string; children?: NavItem[] };

/** D-033 / Step 16.2: primary navigation follows visitor intent. */
export const primaryNav: NavItem[] = [
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "Massage & Bodywork", href: "/services/massage-bodywork" },
      { label: "Personal Strength Training", href: "/services/personal-strength-training" },
      { label: "Women’s Wellness Coaching", href: "/services/womens-wellness-coaching" },
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
    { label: "My TAB", href: "/my-tab" },
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
  ],
};
