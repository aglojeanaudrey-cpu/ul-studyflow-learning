import { useEffect, useRef, useState } from "react";
import { PopupCampaign } from "../types";

const STORAGE_PREFIX = "ulsf_popup_";

function canShowByFrequency(popup: PopupCampaign): boolean {
  const key = `${STORAGE_PREFIX}${popup.id}`;
  const freq = popup.frequency;

  if (freq === "always") return true;

  if (freq === "session") {
    return !sessionStorage.getItem(key);
  }

  if (freq === "once") {
    return !localStorage.getItem(key);
  }

  if (freq === "per_day") {
    const lastSeen = localStorage.getItem(key);
    if (!lastSeen) return true;
    const lastDate = new Date(lastSeen).toDateString();
    const today = new Date().toDateString();
    return lastDate !== today;
  }

  if (freq === "custom") {
    const lastSeen = localStorage.getItem(key);
    if (!lastSeen) return true;
    const hours = popup.frequency_custom_hours || 24;
    const diffHours =
      (Date.now() - new Date(lastSeen).getTime()) / (1000 * 60 * 60);
    return diffHours >= hours;
  }

  return true;
}

export function markPopupAsSeen(popup: PopupCampaign) {
  const key = `${STORAGE_PREFIX}${popup.id}`;
  const freq = popup.frequency;

  if (freq === "always") return;

  if (freq === "session") {
    sessionStorage.setItem(key, "1");
    return;
  }

  localStorage.setItem(key, new Date().toISOString());
}

export function usePopupTrigger(popup: PopupCampaign | null) {
  const [shouldShow, setShouldShow] = useState(false);
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (!popup) {
      setShouldShow(false);
      return;
    }

    if (!canShowByFrequency(popup)) {
      setShouldShow(false);
      return;
    }

    triggeredRef.current = false;
    setShouldShow(false);

    const trigger = () => {
      if (triggeredRef.current) return;
      triggeredRef.current = true;
      setShouldShow(true);
    };

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let scrollHandler: (() => void) | null = null;
    let mouseLeaveHandler: ((e: MouseEvent) => void) | null = null;

    if (popup.trigger_type === "on_load") {
      timeoutId = setTimeout(trigger, 300);
    } else if (popup.trigger_type === "after_delay") {
      const delayMs = Math.max(0, (popup.trigger_delay_seconds || 3) * 1000);
      timeoutId = setTimeout(trigger, delayMs);
    } else if (popup.trigger_type === "on_scroll") {
      const percent = Math.max(
        1,
        Math.min(100, popup.trigger_scroll_percent || 50),
      );
      scrollHandler = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;
        if ((scrollTop / docHeight) * 100 >= percent) trigger();
      };
      window.addEventListener("scroll", scrollHandler, { passive: true });
      scrollHandler();
    } else if (popup.trigger_type === "on_exit_intent") {
      mouseLeaveHandler = (e: MouseEvent) => {
        if (e.clientY <= 0) trigger();
      };
      document.addEventListener("mouseleave", mouseLeaveHandler);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (scrollHandler) window.removeEventListener("scroll", scrollHandler);
      if (mouseLeaveHandler)
        document.removeEventListener("mouseleave", mouseLeaveHandler);
    };
  }, [popup]);

  return { shouldShow, setShouldShow };
}
