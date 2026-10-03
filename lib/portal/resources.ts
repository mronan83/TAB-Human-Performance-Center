/**
 * Resources a practitioner shares with a client (C4). Until per-resource pages exist (WEB-010), the library is the
 * topic list on the public Resources page; a practitioner can also share any page on the site or an https link.
 */
import { resourceClusters } from "@/content/pages";

export const resourceKinds = ["Article", "Guide", "Video", "Worksheet", "Link"] as const;

/** Topics from the public Resources page, offered as quick picks. */
export const resourceLibrary = resourceClusters.flatMap((c) => c.topics.map((topic) => ({ title: topic, group: c.title, href: "/resources" })));

/** A link a client may follow: a page on this site or an https address. Anything else falls back to the Resources page. */
export const isSafeResourceHref = (href: string) => /^\/(?![/\\])/.test(href) || /^https:\/\/[^\s]+$/i.test(href);
export const safeResourceHref = (href?: string | null) => (href && isSafeResourceHref(href) ? href : "/resources");
