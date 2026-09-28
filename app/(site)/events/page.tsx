import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "Events & Workshops" };

export default function EventsPage() {
  if (!siteConfig.features.events) notFound();
  return (
    <>
      <PageHero eyebrow="Events" title="Workshops and community events" lead="Upcoming events will appear here." />
    </>
  );
}
