import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import { services } from "@/content/services";
import { siteConfig } from "@/config/site";
import { bookingHref } from "@/lib/links";
import { PageHero } from "@/components/PageHero";
import { SmartLink } from "@/components/SmartLink";
import { Cta } from "@/components/Cta";

export const metadata: Metadata = pageMetadata({ title: "Book", description: "Book massage, strength training, or a coaching conversation with TAB Human Performance Center.", path: "/book" });

/** Two paths (Step 16.4): know what you need → book; not sure → Start Where You Are. Booking stays in Timely (D-003). */
export default function BookPage() {
  const online = !!siteConfig.booking.timelyBookingUrl;
  return (
    <>
      <PageHero eyebrow="Book" title="Ready when you are." lead="Know what you need? Choose a service below. Not sure? We’ll help you find the right starting point.">
        <Cta kind="start" label="Help me choose" variant="outline" />
      </PageHero>
      <section className="section">
        <div className="container-page grid gap-6 md:grid-cols-2">
          {services.map((s) => {
            const b = bookingHref(s.slug);
            return (
              <div key={s.slug} className="card flex items-center gap-5 p-6">
                <Image src={s.icon} alt="" width={72} height={72} />
                <div className="flex-1">
                  <h2 className="text-h4">{s.name}</h2>
                  <p className="text-sm text-text-secondary">{s.primaryCta.label}</p>
                </div>
                {b.external ? (
                  <SmartLink href={b.href} external className="btn btn-primary btn-sm" data-event="Booking: Clicked">Book</SmartLink>
                ) : (
                  <a href={`mailto:${siteConfig.contact.email}?subject=${encodeURIComponent("Booking request: " + s.name)}`} className="btn btn-primary btn-sm">Request</a>
                )}
              </div>
            );
          })}
        </div>
        {!online && (
          <p className="container-page mt-8 text-sm text-text-secondary">Online booking is being connected. For now, send a request and we’ll confirm a time with you.</p>
        )}
      </section>
    </>
  );
}
