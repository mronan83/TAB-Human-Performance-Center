import { siteConfig } from "@/config/site";
import { transitionNoticeActive } from "@/lib/links";

/** Step 19 transition notice; disappears automatically after `hideAfter`. */
export function TransitionBanner() {
  if (!transitionNoticeActive()) return null;
  return (
    <div className="bg-olive text-white">
      <p className="container-page py-2 text-center text-sm">{siteConfig.brand.transitionNotice.text}</p>
    </div>
  );
}
