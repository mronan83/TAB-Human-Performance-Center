/**
 * Resources a practitioner shares with a client (C4). The quick picks come from the resource library (C35,
 * lib/resources.ts, read on the server); a practitioner can also share any page on the site or an https link.
 * Kept free of server code: client components import this.
 */
export const resourceKinds = ["Article", "Guide", "Video", "Worksheet", "Link"] as const;

/** A link a client may follow: a page on this site or an https address. Anything else falls back to the Resources page. */
export const isSafeResourceHref = (href: string) => /^\/(?![/\\])/.test(href) || /^https:\/\/[^\s]+$/i.test(href);
export const safeResourceHref = (href?: string | null) => (href && isSafeResourceHref(href) ? href : "/resources");
