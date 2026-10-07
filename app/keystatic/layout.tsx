import type { Metadata } from "next";
import { keystaticMode } from "../../keystatic.config";
import KeystaticApp from "./keystatic";

export const metadata: Metadata = { title: "Content editor", robots: { index: false, follow: false } };

/**
 * The content editor at /keystatic (proposed D-069, D-071; docs/CONTENT-GUIDE.md). Keystatic Cloud signs editors in
 * once the owner has created the project (backlog A31); until then production shows how to ask for a change instead.
 */
export default function KeystaticLayout() {
  if (keystaticMode === "off") {
    return (
      <main id="main" className="grid min-h-dvh place-items-center bg-bone px-5">
        <div className="max-w-lg rounded-[20px] border border-border bg-white p-8">
          <p className="text-label text-secondary">TAB Human Performance Center</p>
          <h1 className="text-h2 mt-3">The content editor isn’t connected yet</h1>
          <p className="mt-4 text-text-secondary">
            It opens here once the owner has set up its sign-in. Until then, ask for content changes in TAB Practice → Website
            changes.
          </p>
          <a href="/practice/website" className="btn btn-primary mt-6">Go to Website changes</a>
        </div>
      </main>
    );
  }
  return <KeystaticApp />;
}
