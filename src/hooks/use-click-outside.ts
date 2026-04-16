"use client";

import { useEffect, useRef } from "react";

/**
 * Fires `onOutside` when a mousedown/touchstart happens outside the returned ref.
 * Skips Radix portals (dialogs, selects) whose contents are outside the DOM tree
 * but logically "inside" the editing surface.
 */
export function useClickOutside<T extends HTMLElement>(onOutside: () => void, enabled = true) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!enabled) return;
    function handler(event: MouseEvent | TouchEvent) {
      const node = ref.current;
      if (!node) return;
      const target = event.target as Node | null;
      if (!target) return;
      if (node.contains(target)) return;
      // Ignore clicks on Radix portals (Select dropdowns, Popovers, Dialogs)
      const el = target as HTMLElement;
      if (el.closest?.("[data-radix-popper-content-wrapper]")) return;
      if (el.closest?.("[data-slot=dialog-content]")) return;
      if (el.closest?.("[data-slot=dialog-overlay]")) return;
      onOutside();
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [onOutside, enabled]);
  return ref;
}
