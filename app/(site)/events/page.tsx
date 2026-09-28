import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = pageMetadata({ title: "Events & Workshops", description: "Workshops, classes and community events from TAB Wellness Collective.", path: "/events" });

export default function EventsPage() {
  if (!siteConfig.features.events) notFound();
  return (
    <>
      <PageHero eyebrow="Events" title="Workshops and community events" lead="Upcoming events will appear here." />
    </>
  );
}
