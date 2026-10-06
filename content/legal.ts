/**
 * Privacy policy and terms of use (A7). Drafted 2026-10-06 from how the site actually works (config/site.ts,
 * lib/csp.ts, app/api/inquiry, lib/email*.ts, the My TAB design) for the owner's review, then an attorney's; the owner
 * approved both on 2026-10-06 (A7). `draft` keeps the "Pending review" flag on the page and the item on /launch-checklist; `reviewNotes` are shown only while
 * the draft flag is on and never become part of the policy. Plain language on purpose: these are read by clients.
 */

import { siteConfig } from "@/config/site";
import { formatAddress } from "@/lib/links";

const { contact } = siteConfig;
const ADDRESS = formatAddress(contact.address);
const REACH = `email ${contact.email}${contact.phone ? ` or call ${contact.phone}` : ""}`;

export type LegalBlock = string | { list: string[] };
export type LegalDoc = {
  title: string;
  draft: boolean;
  /** Shown as "Last updated"; set when the owner approves. */
  updated: string | null;
  intro: string[];
  sections: { heading: string; body: LegalBlock[] }[];
  /** Questions for the owner and attorney; rendered only while `draft` is true. */
  reviewNotes: string[];
};

export const privacyPolicy: LegalDoc = {
  title: "Privacy policy",
  draft: false, // owner, 2026-10-06 (A7): "Done"
  updated: "October 6, 2026",
  intro: [
    "TAB Human Performance Center (formerly TAB Massage & Fitness) respects your privacy. This policy explains what information we collect through our website, how we use it, who helps us handle it, and the choices you have.",
    "It covers tabhumanperformance.com and the forms and emails that come from it. Booking through Timely and payments through Stripe are also covered by those companies' own privacy policies.",
  ],
  sections: [
    {
      heading: "Information you give us",
      body: [
        "When you use Start Where You Are, we ask for your name, email address and, if you choose, your phone number and preferred way to be contacted. Every other question is a set of choices you pick from: what you'd like help with, which services interest you, what would change if things improved, in person or virtual, your availability and how you found us. The form has no free-text box, so it never asks you to describe a health condition.",
        "When you use the contact form, we ask for your name, email address, an optional phone number, a topic and your message. Please don't include medical details in a message.",
        "If you tick the box for news and events, we'll use your email address to send them. You can unsubscribe at any time.",
        "When you email or call us, we keep that correspondence so we can help you.",
      ],
    },
    {
      heading: "Information collected automatically",
      body: [
        {
          list: [
            "Website analytics: we use Plausible Analytics, which counts visits without cookies and without identifying you. We see totals such as pages viewed, the site that referred you, your device type and your country, and anonymous counts of how many people start and finish Start Where You Are. We can't use it to follow you across websites.",
            "Spam protection: our forms use Cloudflare Turnstile, which looks at technical signals from your browser to tell people from automated spam. Cloudflare's privacy policy applies to that check.",
            "Server logs: our hosting provider, Vercel, records technical details of each request, such as your IP address, browser and the time, to run and secure the site. These logs are kept for a short time.",
          ],
        },
        "Cookies: our public website doesn't use advertising or tracking cookies. My TAB uses essential cookies to keep you signed in. If we ever advertise online, we may add an advertising pixel to public pages only, never to My TAB, Start Where You Are or the contact page, and we'll update this policy first.",
      ],
    },
    {
      heading: "How we use your information",
      body: [
        {
          list: [
            "To reply to you and suggest a starting point",
            "To schedule and provide our services, and to keep records of the care and coaching we provide",
            "To send news and events, only if you asked for them",
            "To keep the website secure and free of spam",
            "To understand, in aggregate, how the website is used so we can improve it",
            "To meet our legal and professional obligations",
          ],
        },
        "We never sell or rent your information, and we never use health-related information for advertising.",
      ],
    },
    {
      heading: "Health information",
      body: [
        "We keep health details out of our website forms and out of email. Our emails never put personal or health details in the subject line, and the copy of your message that we email back to you leaves out what you wrote.",
        "Detailed health intake happens privately: in person, or in My TAB, our secure client portal, when it's available to you. In My TAB, you and your practitioner can record goals, plans, progress and session notes. Only you, the practitioners assigned to you and the owner can see your record. Some practitioner notes are visible to the care team only. Information is encrypted in transit and at rest, and changes to client records are logged.",
      ],
    },
    {
      heading: "Who we share information with",
      body: [
        "We share information only with companies that help us run TAB, only for that purpose, and under their own privacy and security commitments:",
        {
          list: [
            "Vercel (website hosting)",
            "Resend (sending our website emails)",
            "Google Workspace (our email)",
            "Plausible Analytics (privacy-friendly website statistics)",
            "Cloudflare (form spam protection)",
            "Timely (appointment booking, packages and client login)",
            "Stripe (payment for digital programs and memberships)",
            "Supabase (secure storage for My TAB)",
          ],
        },
        "We may also share information if the law requires it, to protect someone's safety, or as part of a sale or transfer of the business, in which case this policy would continue to apply to it.",
      ],
    },
    {
      heading: "How long we keep information",
      body: [
        "We keep emails and records of our work with you for as long as you're a client and afterward as long as we need them for our records and legal obligations. Start Where You Are and contact submissions are kept with your client record.",
        "Website analytics are aggregate and contain no personal information. Server logs are kept for a short time.",
      ],
    },
    {
      heading: "Your choices",
      body: [
        {
          list: [
            "Ask to see the information we hold about you",
            "Ask us to correct it",
            "Ask us to delete it, unless we need to keep it for our records or by law",
            "Unsubscribe from news and events at any time, using the link in any such email or by contacting us",
          ],
        },
        `To make a request, ${REACH}. We may need to confirm your identity first.`,
      ],
    },
    {
      heading: "Security",
      body: [
        "We use encrypted connections throughout the website. In My TAB, staff need two-step verification to reach client records, each person sees only what their role allows, and changes to records are logged. No system is perfectly secure, but we work to protect your information and will tell you promptly if a breach affects you.",
      ],
    },
    {
      heading: "Children",
      body: [
        "Our services are for adults. Our website isn't directed to children under 13, and we don't knowingly collect their information. If you believe a child has sent us information, contact us and we'll delete it.",
      ],
    },
    {
      heading: "Changes to this policy",
      body: [
        "We'll post any changes here and update the date at the top. If a change materially affects how we use information you've already given us, we'll tell you directly.",
      ],
    },
    {
      heading: "Contact us",
      body: [
        `${siteConfig.brand.name}, ${ADDRESS}. You can ${REACH}.`,
      ],
    },
  ],
  reviewNotes: [
    "Retention conflicts with an earlier ruling: proposed D-058 keeps Start and contact submissions indefinitely and never deletes them, while this draft promises deletion on request \"unless we need to keep it\". Decide which you want. Recommendation: honour deletion requests for prospects who never became clients; keep client records for as long as Michigan and your professional rules require.",
    "HIPAA: you ruled on 2026-09-28 that HIPAA doesn't apply (proposed D-060). The draft says nothing about HIPAA either way, which is the safer choice. If you bill health insurance or plan to, have counsel confirm before launch.",
    "Plausible and Cloudflare Turnstile are planned but not switched on yet (A3, A4). Keep them in the policy if they'll be on at launch; otherwise remove them until they are.",
    "Supabase and Stripe hold no client data until My TAB and online programs launch. Listing them now is harmless and avoids an update later.",
    "Breach notification: Michigan's Identity Theft Protection Act sets notice duties for certain data. Counsel should confirm the wording in Security.",
    "Have a Michigan attorney review the final text before launch. This draft reflects how the site works, not legal advice.",
  ],
};

export const termsOfUse: LegalDoc = {
  title: "Terms of use",
  draft: false, // owner, 2026-10-06 (A7): "Done"
  updated: "October 6, 2026",
  intro: [
    "These terms apply to your use of tabhumanperformance.com and the services offered through it by TAB Human Performance Center (\"TAB\", \"we\", \"us\"). By using the site, you agree to them. If you don't agree, please don't use the site.",
  ],
  sections: [
    {
      heading: "Information, not medical advice",
      body: [
        "The content on this site, including articles, resources and descriptions of our services, is general information to help you understand your options. It isn't medical advice, and it isn't a diagnosis or treatment of any condition.",
        "Our massage, strength, women's wellness, nutrition and life coaching services support your health and performance within each practitioner's scope of practice. Nutrition coaching offers general guidance and habits, not medical nutrition therapy. Coaching isn't therapy or medical care. Talk with your doctor before starting a new exercise or nutrition program, especially if you have a health condition, are pregnant or are recovering from injury or surgery.",
        "If you have a medical emergency, call 911.",
      ],
    },
    {
      heading: "Booking, payments and policies",
      body: [
        "Appointments and packages are booked and paid through Timely, and digital programs and memberships through Stripe. Those purchases are also subject to their terms and to our client policies, including cancellation and late arrival, which we'll share when you book.",
        "Prices, availability and services may change. A booking is confirmed only when you receive confirmation from our booking system.",
      ],
    },
    {
      heading: "My TAB accounts",
      body: [
        "If we invite you to My TAB, keep your sign-in secure and don't share access. Tell us right away if you think someone else has used your account. We may suspend access to protect you or our other clients.",
      ],
    },
    {
      heading: "Using the site",
      body: [
        "Please don't misuse the site, for example by sending spam through our forms, trying to get into accounts or systems that aren't yours, interfering with how the site works, or copying its content for commercial use.",
      ],
    },
    {
      heading: "Our content",
      body: [
        "The TAB Human Performance Center name and logo, the TAB Method, and the text, design and other content on this site belong to TAB or are used with permission. You're welcome to share links and view, download or print pages for your own personal use. Please don't reproduce or adapt our content for other purposes without written permission.",
        "Some photographs are licensed stock images. People shown in them are models, not TAB clients or staff.",
      ],
    },
    {
      heading: "Links to other sites",
      body: [
        "We link to services such as Timely, Stripe and social media. We aren't responsible for their content or practices.",
      ],
    },
    {
      heading: "No warranties",
      body: [
        "We work to keep the site accurate and available, but we provide it \"as is\" and can't promise it will always be error-free or uninterrupted. Results from our services vary from person to person, and we don't guarantee any particular outcome.",
      ],
    },
    {
      heading: "Limitation of liability",
      body: [
        "To the extent the law allows, TAB isn't liable for indirect or consequential losses arising from your use of the website. Nothing in these terms limits liability that can't be limited by law.",
      ],
    },
    {
      heading: "Governing law",
      body: [
        "These terms are governed by the laws of the State of Michigan. Any dispute will be handled in the state or federal courts serving Livingston County, Michigan.",
      ],
    },
    {
      heading: "Changes and contact",
      body: [
        `We may update these terms and will post the new version here with the date at the top. Questions? Please ${REACH}.`,
      ],
    },
  ],
  reviewNotes: [
    "Client policies (cancellation, late arrival, illness) are still a placeholder at /policies. Send the current TAB cancellation policy and I'll carry it over under the new name.",
    "\"People shown are models\" is true for the stock library. Remove that line if you add your own photography of real clients or staff.",
    "Liability and governing-law wording is standard; your attorney or insurer may want specific language, especially for massage and training services. Your intake and waiver forms for in-person services are separate documents and aren't replaced by these terms.",
    "Have a Michigan attorney review before launch. This draft isn't legal advice.",
  ],
};
