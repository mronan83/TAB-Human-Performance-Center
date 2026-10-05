/**
 * Legacy tabmassage.com → TAB Human Performance Center redirect map (Step 17.7, Step 19.3, D-040).
 * Built from a crawl of the live tabmassage.com sitemaps on 2026-09-27 (64 URLs).
 * Keys are legacy paths without trailing slash; values are new destinations.
 * Applied as permanent (308) redirects in middleware.ts in a single hop (no chains).
 * Point both tabmassage.com and www.tabmassage.com at this deployment at cutover.
 */
import { siteConfig } from "./site";

export const legacyRedirects: Record<string, string> = {
  // Pages
  // The legacy staff portal. The My TAB sign-in page is the one entry for clients and staff (staff continue to TAB
  // Practice after signing in); /my-tab and /practice would add a hop, since they send signed-out visitors there.
  // While the portal is off, /my-tab is the page itself (Timely Client Login).
  "/employee-login": siteConfig.portal.enabled ? "/my-tab/login" : "/my-tab",
  "/newsletter-archives": "/resources",
  "/sitemap": "/",
  "/terms-and-conditions": "/terms",
  "/stretching": "/resources",
  "/massage-therapy-effects-on-adhd": "/services/massage-bodywork",
  "/yoga-benefits": "/resources",
  "/my-calendar": "/book",
  "/classes-events": "/resources",
  "/massage-benefits": "/services/massage-bodywork",
  "/massage-therapy-faq": "/faq",
  "/purchase-gift-cards": "/contact",
  "/hiring-join-our-team": "/about/team",
  "/chair-massage": "/services/massage-bodywork",
  "/prenatal-massage-therapy": "/services/massage-bodywork",
  "/sports-injury-rehab": "/services/massage-bodywork",
  "/about-us": "/about",
  "/appointments": "/book",
  "/appointments/customer-reviews": "/about",
  "/appointments/reviews": "/about",
  "/introduction-to-massage": "/services/massage-bodywork",
  "/tab-lifequest": "/services/holistic-life-coaching",
  "/yoga-faq": "/faq",
  "/small-group-training-lifequest": "/services/personal-strength-training",
  "/nutrition": "/services/womens-wellness-coaching",
  "/massage_therapy": "/services/massage-bodywork",
  "/yoga-room-tab": "/services",
  "/privacy-policy": "/privacy",
  "/cancellation-policy": "/policies",
  "/personal_training": "/services/personal-strength-training",
  "/test": "/",
  "/contact-us": "/contact",
  "/our-team-2": "/about/team",
  // Posts
  "/blog": "/resources",
  "/tab-fit-quest-kids-and-teens": "/services/personal-strength-training",
  "/5-ways-to-celebrate-national-womens-health-and-fitness-day": "/services/womens-wellness-coaching",
  "/21-days-for-21": "/resources",
  "/how-to-meal-prep-and-plan-ahead": "/resources",
  "/tricias-fit-kitchen": "/resources",
  "/remote-personal-training": "/services/personal-strength-training",
  "/tricias-fit-kitchen-powered-by-simpled": "/resources",
  "/3-easy-random-acts-kindness": "/resources",
  "/the-importance-of-water": "/resources",
  "/tricias-fit-kitchen-powered-by-simpled-2": "/resources",
  "/tricias-fit-kitchen-powered-by-simpled-3": "/resources",
  "/win-a-free-month-tricias-fit-kitchen-menu": "/resources",
  "/402-2": "/resources",
  "/celebrate-sleep-awareness-month": "/resources",
  "/body-image-risk-reward-massage": "/services/massage-bodywork",
  "/often-get-massage": "/services/massage-bodywork",
  "/cancel-massage-im-sick": "/policies",
  "/pregnancy-fitness": "/services/personal-strength-training",
  "/414-2": "/resources",
  "/massage-for-a-sore-jaw-tmj": "/services/massage-bodywork",
  "/diet-will-help-restore-stomach-acids-back-health-includes": "/resources",
  "/working-out-in-moderation": "/services/personal-strength-training",
  "/7-strange-things-stress-can-do-to-your-body": "/resources",
  "/can-destress-employees-work-office-massages": "/services/massage-bodywork",
  "/massage-cupping": "/services/massage-bodywork",
  "/common-health-problems-massage-therapy-can-help": "/services/massage-bodywork",
  "/skin-and-sun-safety": "/resources",
  "/why-you-cant-afford-not-to-get-a-massage": "/services/massage-bodywork",
};

/** Prefix rules for legacy archives (tags, testimonials, authors, WordPress feeds). */
export const legacyPrefixRedirects: Array<{ prefix: string; to: string }> = [
  { prefix: "/tag/", to: "/resources" },
  { prefix: "/category/", to: "/resources" },
  { prefix: "/testimonial-item/", to: "/about" },
  { prefix: "/author/", to: "/about" },
  { prefix: "/feed", to: "/resources" },
  { prefix: "/wp-content/", to: "/" },
];
