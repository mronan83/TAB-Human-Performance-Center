import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { siteFeatures } from "@/lib/settings";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = pageMetadata({ title: "Events & Workshops", description: "Workshops, classes and community events from TAB Human Performance Center.", path: "/events" });

export default async function EventsPage() {
  if (!(await siteFeatures()).events) notFound();
  return (
    <>
      <PageHero eyebrow="Events" title="Workshops and community events" lead="Upcoming events will appear here." />
    </>
  );
}
