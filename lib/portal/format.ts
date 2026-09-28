import { getService, type ServiceSlug } from "@/content/services";
import type { MethodStage } from "./types";

export const serviceName = (s?: ServiceSlug) => (s ? getService(s)?.name ?? s : "");
export const fmtDate = (d: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) =>
  new Date(d.length === 10 ? d + "T12:00:00" : d).toLocaleDateString("en-US", { timeZone: "America/Detroit", ...opts });
export const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString("en-US", { timeZone: "America/Detroit", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
export const fmtMoney = (cents?: number) => (cents == null ? "" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100));
export const weekStartISO = (d = new Date()) => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x.toISOString().slice(0, 10); };
export const daysUntil = (d: string) => Math.ceil((new Date(d.length === 10 ? d + "T12:00:00" : d).getTime() - Date.now()) / 86400000);

export const STAGES: { key: MethodStage; label: string; blurb: string }[] = [
  { key: "start", label: "Start where you are", blurb: "Understanding where you are and what matters." },
  { key: "transform", label: "Transform", blurb: "Creating meaningful change." },
  { key: "align", label: "Align", blurb: "Bringing the pieces together." },
  { key: "become", label: "Become", blurb: "Building confidence and ownership." },
  { key: "evolve", label: "Evolve", blurb: "Adapting as life changes." },
];
