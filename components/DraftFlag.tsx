/** Visible marker for temporary copy. Hidden in production unless NEXT_PUBLIC_SHOW_DRAFTS=true. */
export function DraftFlag({ show = true, label = "Draft copy" }: { show?: boolean; label?: string }) {
  if (!show || process.env.NEXT_PUBLIC_SHOW_DRAFTS !== "true") return null;
  return <span className="draft-flag">{label}</span>;
}
