/**
 * ripperdeck "Jack In" glitch effect — fullscreen visual glitch with
 * screen shake, RGB channel splitting, scanlines, and flicker.
 */

export const GLITCH_DURATION = 850; // ms

export function triggerGlitchEffect(): void {
  if (typeof document === "undefined") return;

  // Prevent stacking if already running
  if (document.getElementById("jack-in-glitch")) return;

  const overlay = document.createElement("div");
  overlay.id = "jack-in-glitch";
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "9999",
    pointerEvents: "none",
  });

  // Cyan RGB split layer (offset left)
  const cyan = document.createElement("div");
  Object.assign(cyan.style, {
    position: "absolute",
    inset: "0",
    background: "rgba(0, 240, 255, 0.15)",
    transform: "translate(-6px, 0)",
    opacity: "0",
    animation: `jack-in-rgb-split ${GLITCH_DURATION}ms ease-out forwards`,
  });

  // Magenta RGB split layer (offset right)
  const magenta = document.createElement("div");
  Object.assign(magenta.style, {
    position: "absolute",
    inset: "0",
    background: "rgba(255, 42, 109, 0.15)",
    transform: "translate(6px, 0)",
    opacity: "0",
    animation: `jack-in-rgb-split ${GLITCH_DURATION}ms ease-out forwards`,
    animationDelay: "40ms",
  });

  // Scanline overlay — starts hidden, fades in/out via animation
  const scanlines = document.createElement("div");
  Object.assign(scanlines.style, {
    position: "absolute",
    inset: "0",
    background:
      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.04) 2px, rgba(0,240,255,0.04) 4px)",
    opacity: "0",
    animation: `jack-in-scanlines ${GLITCH_DURATION}ms linear forwards`,
  });

  // Flicker layer — starts at opacity 0 explicitly
  const flicker = document.createElement("div");
  Object.assign(flicker.style, {
    position: "absolute",
    inset: "0",
    background: "rgba(0, 240, 255, 0.08)",
    opacity: "0",
    animation: `jack-in-flicker ${GLITCH_DURATION}ms ease-out forwards`,
  });

  // Horizontal glitch bars — displaced strips that snap in and out
  const barsContainer = document.createElement("div");
  Object.assign(barsContainer.style, {
    position: "absolute",
    inset: "0",
    overflow: "hidden",
  });

  const barCount = 16;
  const colors = [
    "rgba(0, 240, 255, 0.25)",
    "rgba(255, 42, 109, 0.2)",
    "rgba(252, 238, 9, 0.15)",
    "rgba(5, 217, 232, 0.2)",
  ];
  const zoneSize = 100 / barCount;
  for (let i = 0; i < barCount; i++) {
    const bar = document.createElement("div");
    // Place each bar within its own vertical zone + random jitter
    const top = zoneSize * i + Math.random() * zoneSize * 0.7;
    const height = 8 + Math.random() * 28;
    const offset = (Math.random() > 0.5 ? 1 : -1) * (8 + Math.random() * 20);
    const color = colors[Math.floor(Math.random() * colors.length)];
    Object.assign(bar.style, {
      position: "absolute",
      top: `${top}%`,
      left: "0",
      right: "0",
      height: `${height}px`,
      background: color,
      transform: `translateX(${offset}px)`,
      opacity: "0",
      animation: `jack-in-bar ${GLITCH_DURATION}ms step-end forwards`,
      animationDelay: `${Math.random() * 200}ms`,
    });
    barsContainer.appendChild(bar);
  }

  overlay.append(cyan, magenta, scanlines, flicker, barsContainer);
  document.body.appendChild(overlay);

  // Screen shake on the html element
  const html = document.documentElement;
  html.style.animation = `jack-in-shake ${GLITCH_DURATION}ms ease-out`;
  html.style.animationFillMode = "forwards";

  // Cleanup
  setTimeout(() => {
    overlay.remove();
    html.style.animation = "";
    html.style.animationFillMode = "";
  }, GLITCH_DURATION + 50);
}
