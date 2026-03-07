"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface CardLightboxProps {
  imageUrl: string;
  alt: string;
  colorHex: string;
}

export function CardLightbox({ imageUrl, alt, colorHex }: CardLightboxProps) {
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rotateY = (x - 0.5) * 20;
      const rotateX = (0.5 - y) * 20;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;

      const glareX = x * 100;
      const glareY = y * 100;
      card.style.setProperty("--glare-x", `${glareX}%`);
      card.style.setProperty("--glare-y", `${glareY}%`);
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    cancelAnimationFrame(rafRef.current);
    card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
    card.style.setProperty("--glare-x", "50%");
    card.style.setProperty("--glare-y", "50%");
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full h-full cursor-zoom-in"
        aria-label={`View ${alt} full size`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-cyber-black/90 backdrop-blur-sm animate-in fade-in duration-200" />

          {/* Card container */}
          <div
            className="relative z-10 max-w-sm w-full mx-4 animate-in zoom-in-95 fade-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative rounded-xl overflow-hidden border-2 shadow-2xl transition-transform duration-150 ease-out"
              style={{
                borderColor: `${colorHex}60`,
                boxShadow: `0 0 40px ${colorHex}30, 0 0 80px ${colorHex}10`,
                transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={alt}
                className="w-full h-auto block"
                draggable={false}
              />

              {/* Glare overlay */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.15) 0%, transparent 60%)`,
                }}
              />
            </div>

            {/* Close hint */}
            <div className="text-center mt-4 text-xs font-mono text-cyber-light/30">
              Click outside or press ESC to close
            </div>
          </div>
        </div>
      )}
    </>
  );
}
