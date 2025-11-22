'use client';

import React, { useEffect, useRef, useState } from "react";

/**
 * MouseShadow
 * Props:
 *  - color: css color for the blob (default: "rgba(0,0,0,0.35)")
 *  - intensity: 0..1 (default 0.6) controls opacity
 *  - lag: 0..1 (default 0.12) lower = snappier, higher = smoother lag
 */
export default function MouseShadow({ color = "0,0,0", intensity = 0.6, lag = 0.12 }) {
  const blobRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const velocity = useRef({ vx: 0, vy: 0 });
  const rafRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  // Only render after client-side mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Initialize position to center or current mouse
    pos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    target.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const onMove = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    const onResize = () => {
      pos.current.x = Math.min(pos.current.x, window.innerWidth);
      pos.current.y = Math.min(pos.current.y, window.innerHeight);
      target.current.x = Math.min(target.current.x, window.innerWidth);
      target.current.y = Math.min(target.current.y, window.innerHeight);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", onResize);

    const blob = blobRef.current;

    const ease = (current, targetVal, factor) => current + (targetVal - current) * factor;

    function loop() {
      if (!blob) return;

      // lerp position
      pos.current.x = ease(pos.current.x, target.current.x, lag);
      pos.current.y = ease(pos.current.y, target.current.y, lag);

      // compute simple velocity
      velocity.current.vx = pos.current.x - (parseFloat(blob.dataset.prevX || pos.current.x) || 0);
      velocity.current.vy = pos.current.y - (parseFloat(blob.dataset.prevY || pos.current.y) || 0);
      blob.dataset.prevX = pos.current.x;
      blob.dataset.prevY = pos.current.y;

      const speed = Math.hypot(velocity.current.vx, velocity.current.vy);

      // map speed to scale (clamped)
      const scale = 1 + Math.min(speed / 80, 0.35);

      // update styles
      blob.style.transform = `translate3d(${pos.current.x - 80}px, ${pos.current.y - 80}px, 0) scale(${scale})`;
      // opacity adapts slightly with scale and intensity
      blob.style.opacity = Math.min(1, 0.12 + intensity * 0.9 + Math.min(speed / 300, 0.15));

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [lag, intensity, mounted]);

  // Don't render until mounted on client
  if (!mounted) return null;

  // Inline minimal styles
  const blobStyle = {
    position: "fixed",
    pointerEvents: "none",
    left: 0,
    top: 0,
    width: "160px",
    height: "160px",
    borderRadius: "50%",
    filter: "blur(32px)",
    transform: "translate3d(0px, 0px, 0)",
    transition: "opacity 160ms linear",
    zIndex: 9999,
    mixBlendMode: "soft-light",
    background: `radial-gradient(circle at 30% 30%, rgba(${color}, 0.95), rgba(${color}, 0.65) 35%, rgba(${color}, 0.2) 60%, rgba(${color}, 0) 100%)`,
    opacity: 0.6,
  };

  return <div ref={blobRef} style={blobStyle} aria-hidden="true" className="mouse-shadow-blob" />;
}
