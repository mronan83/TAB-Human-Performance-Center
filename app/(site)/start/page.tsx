import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { InquiryForm } from "@/components/InquiryForm";

export const metadata: Metadata = { title: "Start Where You Are", description: "Tell us where you are and what you want to change. We’ll help you find the right starting point." };

export default function StartPage() {
  return (
    <>
      <PageHero eyebrow="Start Where You Are" title="You don’t need to know exactly where to start." lead="Tell us what you’re experiencing, what you want to change, or what you hope to be able to do. We’ll reply with a suggested starting point—no pressure, no sales pitch." />
      <section className="section"><div className="container-prose"><InquiryForm kind="start" /></div></section>
    </>
  );
}
