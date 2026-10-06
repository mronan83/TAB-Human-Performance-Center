import { siteConfig } from "@/config/site";
import { transitionNoticeActive } from "@/lib/links";
import { getSettings } from "@/lib/settings";

/** Step 19 transition notice: the owner can switch it off in Settings (C23); it also ends on its own after `hideAfter`. */
export async function TransitionBanner() {
  if (!transitionNoticeActive() || !(await getSettings()).transitionBanner) return null;
  return (
    <div className="on-dark bg-olive text-white">
      <p className="container-page py-2 text-center text-sm">{siteConfig.brand.transitionNotice.text}</p>
    </div>
  );
}
