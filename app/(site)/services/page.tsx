import type { Metadata } from "next";
import { services } from "@/content/services";
import { PageHero } from "@/components/PageHero";
import { ServiceCard } from "@/components/ServiceCard";
import { Cta } from "@/components/Cta";

export const metadata: Metadata = {
  title: "Services",
  description: "Massage & Bodywork, Personal Strength Training, Women’s Wellness Coaching, and Holistic Life Coaching—four connected areas of support.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrow="Services" title="Support for how you feel, move, live, and grow." lead="Each service stands on its own. Together, they form one connected, personalized approach. Start with what fits what you need today.">
        <Cta kind="start" label="Help me choose" />
      </PageHero>
      <section className="section">
        <div className="container-page grid gap-6 md:grid-cols-2">
          {services.map((s) => (<ServiceCard key={s.slug} service={s} />))}
        </div>
      </section>
    </>
  );
}
