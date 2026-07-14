import { useEffect } from "react";

const SELECTORS = "a, button, input, [tabindex='0']";

export function useTvNav(active: boolean = true) {
  useEffect(() => {
    if (!active) return;

    function getFocusableElements(): HTMLElement[] {
      const elements = Array.from(document.querySelectorAll(SELECTORS)) as HTMLElement[];
      return elements.filter((el) => {
        if ((el as any).disabled) return false;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        
        // Ensure it is visible in the computed styles
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") return false;
        
        // Skip elements inside collapsed/hidden menus
        let parent = el.parentElement;
        while (parent) {
          const parentStyle = window.getComputedStyle(parent);
          if (parentStyle.display === "none" || parentStyle.visibility === "hidden") return false;
          parent = parent.parentElement;
        }
        
        return true;
      });
    }

    function moveFocus(direction: "left" | "right" | "up" | "down") {
      const focusable = getFocusableElements();
      const current = document.activeElement as HTMLElement;

      if (!focusable.length) return;

      // If nothing is focused, focus the first visible element
      if (!current || !focusable.includes(current)) {
        focusable[0].focus();
        return;
      }

      const currentRect = current.getBoundingClientRect();
      const cx = currentRect.left + currentRect.width / 2;
      const cy = currentRect.top + currentRect.height / 2;

      let bestElement: HTMLElement | null = null;
      let bestScore = Infinity;

      focusable.forEach((el) => {
        if (el === current) return;

        const r = el.getBoundingClientRect();
        const ex = r.left + r.width / 2;
        const ey = r.top + r.height / 2;

        const dx = ex - cx;
        const dy = ey - cy;

        let isValid = false;
        let primaryDist = 0;
        let orthoDist = 0;

        if (direction === "left") {
          isValid = dx < -2;
          primaryDist = -dx;
          orthoDist = Math.abs(dy);
        } else if (direction === "right") {
          isValid = dx > 2;
          primaryDist = dx;
          orthoDist = Math.abs(dy);
        } else if (direction === "up") {
          isValid = dy < -2;
          primaryDist = -dy;
          orthoDist = Math.abs(dx);
        } else if (direction === "down") {
          isValid = dy > 2;
          primaryDist = dy;
          orthoDist = Math.abs(dx);
        }

        if (!isValid) return;

        // Weight orthogonal distance heavily to prefer direct alignments
        const score = primaryDist + orthoDist * 2.2;
        if (score < bestScore) {
          bestScore = score;
          bestElement = el;
        }
      });

      if (bestElement) {
        (bestElement as HTMLElement).focus();
        bestElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Enter", " "].includes(e.key)) {
        // Skip overriding standard behavior for typing in search inputs
        if (document.activeElement?.tagName === "INPUT" && ["ArrowLeft", "ArrowRight", "Enter", " "].includes(e.key)) {
          return;
        }

        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            moveFocus("down");
            break;
          case "ArrowUp":
            e.preventDefault();
            moveFocus("up");
            break;
          case "ArrowLeft":
            e.preventDefault();
            moveFocus("left");
            break;
          case "ArrowRight":
            e.preventDefault();
            moveFocus("right");
            break;
          case "Enter":
          case " ":
            if (document.activeElement && document.activeElement !== document.body) {
              e.preventDefault();
              (document.activeElement as HTMLElement).click();
            }
            break;
        }
      }
    }

    // Set tabIndex dynamically for non-standard clickable items to make them focusable
    const observer = new MutationObserver(() => {
      const elements = document.querySelectorAll(SELECTORS);
      elements.forEach((el) => {
        if (!el.hasAttribute("tabindex") && el.tagName !== "BUTTON" && el.tagName !== "A" && el.tagName !== "INPUT") {
          el.setAttribute("tabindex", "0");
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("keydown", handleKeyDown);
    
    // Focus first element on page load/mount
    setTimeout(() => {
      const elements = getFocusableElements();
      if (elements.length && (!document.activeElement || document.activeElement === document.body)) {
        elements[0].focus();
      }
    }, 200);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      observer.disconnect();
    };
  }, [active]);
}
