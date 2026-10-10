import fs from "node:fs";
import path from "node:path";

/** Largest team photo the editor may upload (bytes); the site resizes it for display. */
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/**
 * Where the photos are all present: while building and in the checks. A deployed function rebuilding the page may not
 * carry public/ (Vercel serves it separately), so the check doesn't run there; the build already ran it (as with the
 * resource library's PDFs, lib/resources.ts).
 */
const checkFilesByDefault = () => process.env.NEXT_PHASE === "phase-production-build" || !process.env.VERCEL;

/**
 * Checks the team photos uploaded in the content editor (C35): each one exists under public/images/team, is a JPEG,
 * PNG or WebP, and is at most 5 MB. Called while /about/team is built, so a bad upload fails the checks, naming it.
 */
export function checkTeamPhotos(members: { name: string; photo?: string | null }[], root = process.cwd(), checkFiles = checkFilesByDefault()): void {
  if (!checkFiles) return;
  for (const m of members) {
    if (!m.photo) continue;
    const rel = path.posix.normalize(`public${m.photo}`);
    const where = `content/pages/team.json (${m.name})`;
    if (!rel.startsWith("public/images/team/")) throw new Error(`${where}: the photo must be uploaded through the editor.`);
    if (!/\.(jpe?g|png|webp)$/i.test(rel)) throw new Error(`${where}: the photo must be a JPEG, PNG or WebP image.`);
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) throw new Error(`${where}: the photo ${rel} is missing.`);
    const bytes = fs.statSync(abs).size;
    if (bytes > MAX_PHOTO_BYTES) throw new Error(`${where}: the photo is ${(bytes / 1048576).toFixed(1)} MB; the limit is 5 MB.`);
  }
}
