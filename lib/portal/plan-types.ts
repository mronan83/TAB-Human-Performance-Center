/**
 * Plan types and their sections (docs/design/plans-programs-stages.md §2.2, confirmed by the owner 2026-09-29).
 * A new type is a new entry here, not a migration. Sections marked `private` are practitioner-only: they are stored in
 * plan_private_details, which clients can never read. Copy uses the client's own language, never clinical terms
 * (Step 15 §15.8).
 */
import type { PlanType } from "./types";

export type PlanSection = { key: string; label: string; hint?: string; private?: boolean };
export type PlanTypeDef = { label: string; short: string; capability?: "nutrition"; sections: PlanSection[] };

export const planTypes: Record<PlanType, PlanTypeDef> = {
  wellness: { label: "TAB Wellness Plan", short: "Wellness Plan", sections: [] },
  "personal-strength-training": {
    label: "Strength plan", short: "Strength",
    sections: [
      { key: "training_focus", label: "Training focus" },
      { key: "weekly_structure", label: "Weekly structure", hint: "Sessions, days, and what each one covers." },
      { key: "current_blocks", label: "Current blocks and loads" },
      { key: "progress_measures", label: "Progress measures" },
      { key: "movement_notes", label: "Movement notes", private: true },
    ],
  },
  "massage-bodywork": {
    label: "Massage & Bodywork plan", short: "Massage & Bodywork",
    sections: [
      { key: "focus_areas", label: "Focus areas", hint: "The areas you'd like us to focus on." },
      { key: "session_frequency", label: "Session frequency" },
      { key: "techniques_pressure", label: "Techniques and pressure preferences" },
      { key: "response_aftercare", label: "Response and aftercare" },
      { key: "contraindication_notes", label: "Contraindication notes", private: true },
    ],
  },
  "womens-wellness-coaching": {
    label: "Women's Wellness plan", short: "Women's Wellness",
    sections: [
      { key: "coaching_focus", label: "Coaching focus" },
      { key: "habits", label: "Habits" },
      { key: "life_stage_context", label: "Life-stage context", hint: "In the client's own words; not diagnostic." },
      { key: "resources", label: "Resources" },
    ],
  },
  "holistic-life-coaching": {
    label: "Life Coaching plan", short: "Life Coaching",
    sections: [
      { key: "goals_commitments", label: "Goals and commitments" },
      { key: "values", label: "Values" },
      { key: "reflections", label: "Reflections" },
      { key: "accountability_rhythm", label: "Accountability rhythm" },
    ],
  },
  nutrition: {
    // Nutrition coaching within an IIN health-coach scope: habits and general guidance, never meal plans for medical
    // conditions (design §2.3). Only practitioners with the `nutrition` capability can create or change these.
    label: "Nutrition coaching plan", short: "Nutrition coaching", capability: "nutrition",
    sections: [
      { key: "habit_targets", label: "Habit targets" },
      { key: "eating_patterns", label: "Eating pattern preferences" },
      { key: "guidance", label: "Practitioner guidance", hint: "General guidance and accountability, not a meal plan." },
      { key: "nutrition_notes", label: "Notes", private: true },
    ],
  },
};

export const servicePlanTypes = (Object.keys(planTypes) as PlanType[]).filter((t) => t !== "wellness");
export const canUsePlanType = (type: PlanType, capabilities: string[] = []) => {
  const cap = planTypes[type].capability;
  return !cap || capabilities.includes(cap);
};

/** Keeps only this type's section keys, as trimmed strings (the design's "validated against the type's schema"). */
export function splitSections(type: PlanType, input: Record<string, string>) {
  const shared: Record<string, string> = {}, priv: Record<string, string> = {};
  for (const s of planTypes[type].sections) {
    const v = String(input[s.key] ?? "").trim().slice(0, 4000);
    if (v) (s.private ? priv : shared)[s.key] = v;
  }
  return { shared, priv };
}
