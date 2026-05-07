"use client";

import { useEffect } from "react";

export function HeroEffects() {
  useEffect(() => {
    // Cursor-reactive blush blob
    const blob = document.getElementById("gd-blob");
    const hero = document.getElementById("hero");
    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMove = (e: MouseEvent) => {
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width - 0.5;
      const cy = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = cx * 220;
      targetY = cy * 160;
    };
    const onLeave = () => {
      targetX = 0;
      targetY = 0;
    };
    const tick = () => {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      if (blob) {
        blob.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`;
      }
      raf = requestAnimationFrame(tick);
    };
    if (hero && blob) {
      hero.addEventListener("mousemove", onMove);
      hero.addEventListener("mouseleave", onLeave);
      tick();
    }

    // Sticky header scrolled state
    const header = document.getElementById("gd-header");
    const onScroll = () => {
      if (!header) return;
      if (window.scrollY > 16) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      hero?.removeEventListener("mousemove", onMove);
      hero?.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
