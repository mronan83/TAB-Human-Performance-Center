# Configuration guide

Most changes need no code. Edit a file, commit, and Vercel redeploys.

## config/site.ts
| Setting | What it controls | Current |
|---|---|---|
| `contact.phone`, `contact.address`, `contact.hours`, `contact.mapUrl` | Footer, Contact page, structured data | Placeholder |
| `booking.timelyBookingUrl` | Every "Book" button | Placeholder → falls back to `/book` with email requests |
| `booking.serviceBookingUrls` | Service-specific booking deep links | Placeholder |
| `booking.timelyClientLoginUrl` | "Client login" and appointment management | Placeholder |
| `booking.giftCardsUrl` | Footer gift card link (hidden until set) | Placeholder |
| `social.*` | Footer links, structured data | Legacy TAB Massage accounts; update after renaming |
| `forms.startRecipient`, `forms.contactRecipient` | Where form emails go | info@tabhumanperformance.com |
| `forms.fromAddress` | Sender (must be verified in Resend) | no-reply@tabhumanperformance.com |
| `analytics.plausibleDomain` | Plausible analytics | Off |
| `analytics.metaPixelId`, `googleTagManagerId` | Only when paid ads start (D-015) | Off |
| `features.resources/events/team/testimonials` | Show or hide sections and nav items | resources, team on |
| `brand.transitionNotice` | "Formerly TAB Massage & Fitness" banner and end date | On until 2027-06-30 |
| `portal.enabled` | `false` = /my-tab shows Timely client login only | `true` |
| `portal.dataSource` | `"mock"` demo data, or `"supabase"` live data | `"mock"` |

## content/
- `services.ts`: all four service pages (headline, description, who it's for, gains, approach, TAB Method, focus areas, what to expect, scope note, FAQs, CTAs, icon).
- `pages.ts`: homepage sections, TAB Method, About, Our Story, Team, general FAQ, resource topics, legal pages.
- Set `draft: false` once reviewed; the launch checklist updates automatically.

## config/redirects.ts
Legacy URL map. Add entries as `"/old-path": "/new-path"` (no trailing slash).

## Environment variables
See `.env.example`. Set them in Vercel → Project → Settings → Environment Variables.
