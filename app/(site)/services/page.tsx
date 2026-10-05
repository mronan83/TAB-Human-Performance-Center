import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { services } from "@/content/services";
import { PageHero } from "@/components/PageHero";
import { ServiceCard } from "@/components/ServiceCard";
import { Cta } from "@/components/Cta";

export const metadata: Metadata = pageMetadata({
  title: "Services",
  description: "Massage & Bodywork, Functional Strength, Women’s Wellness, Integrated Nutrition and Holistic Life Coaching: five connected areas of support.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrow="Services" title="Support for how you feel, move, live, and grow." lead="Each service stands on its own. Together, they form one connected, personalized approach. Start with what fits what you need today.">
        <Cta kind="start" label="Help me choose" />
      </PageHero>
      <section className="section">
        <div className="container-page grid gap-6 md:grid-cols-2">
          {services.map((s) => (<ServiceCard headingLevel={2} key={s.slug} service={s} />))}
        </div>
      </section>
    </>
  );
}
