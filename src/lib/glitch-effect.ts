/**
 * ripperdeck "Jack In" glitch effect — fullscreen VHS-style digital
 * corruption with displaced horizontal slices, staircase tearing,
 * RGB channel splitting, scanlines, and flicker.
 *
 * Each glitch slice runs its own randomized setTimeout chain so
 * nothing pulses in lockstep — timing is unpredictable per-element.
 */

export const GLITCH_DURATION = 850; // ms

/**
 * Generate a staircase clip-path — a horizontal strip with blocky,
 * stepped edges like a digital signal breaking up.
 */
function digitalClipPath(yTop: number, yBottom: number): string {
  const points: string[] = [];
  const steps = 20 + Math.floor(Math.random() * 15);
  const stepW = 100 / steps;
  const notchDepth = 0.3 + Math.random() * 0.6;

  for (let i = 0; i <= steps; i++) {
    const x = Math.min(i * stepW, 100);
    const notch = i % 2 === 0 ? 0 : (Math.random() > 0.4 ? notchDepth : -notchDepth);
    if (i > 0 && i < steps) {
      points.push(`${x}% ${yTop + (i % 2 === 0 ? notchDepth : 0)}%`);
    }
    points.push(`${x}% ${yTop + notch}%`);
  }

  for (let i = steps; i >= 0; i--) {
    const x = Math.min(i * stepW, 100);
    const notch = i % 2 === 0 ? 0 : (Math.random() > 0.4 ? -notchDepth : notchDepth);
    if (i < steps && i > 0) {
      points.push(`${x}% ${yBottom + (i % 2 === 0 ? -notchDepth : 0)}%`);
    }
    points.push(`${x}% ${yBottom + notch}%`);
  }

  return `polygon(${points.join(", ")})`;
}

/**
 * Drive a single element's visibility with randomized on/off intervals.
 * Each "on" and "off" duration is independently random so nothing
 * feels rhythmic. Returns a cleanup function.
 */
function flickerElement(
  el: HTMLElement,
  totalMs: number,
  onRange: [number, number],
  offRange: [number, number],
  startDelay: number,
): () => void {
  let elapsed = startDelay;
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  const schedule = () => {
    if (elapsed >= totalMs) return;

    // Random "off" gap before next appearance
    const offTime = offRange[0] + Math.random() * (offRange[1] - offRange[0]);
    elapsed += offTime;
    if (elapsed >= totalMs) return;

    // Turn on
    timeouts.push(setTimeout(() => { el.style.opacity = "1"; }, elapsed));

    // Random "on" duration — how long this glitch lingers
    const onTime = onRange[0] + Math.random() * (onRange[1] - onRange[0]);
    elapsed += onTime;

    // Turn off
    timeouts.push(setTimeout(() => { el.style.opacity = "0"; }, Math.min(elapsed, totalMs)));

    schedule();
  };

  schedule();

  return () => timeouts.forEach(clearTimeout);
}

export function triggerGlitchEffect(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById("jack-in-glitch")) return;

  const cleanups: (() => void)[] = [];

  const overlay = document.createElement("div");
  overlay.id = "jack-in-glitch";
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "9999",
    pointerEvents: "none",
  });

  // Cyan RGB split layer
  const cyan = document.createElement("div");
  Object.assign(cyan.style, {
    position: "absolute",
    inset: "0",
    background: "rgba(0, 240, 255, 0.15)",
    transform: "translate(-6px, 0)",
    opacity: "0",
  });
  cleanups.push(flickerElement(cyan, GLITCH_DURATION, [20, 150], [30, 250], 0));

  // Magenta RGB split layer
  const magenta = document.createElement("div");
  Object.assign(magenta.style, {
    position: "absolute",
    inset: "0",
    background: "rgba(255, 42, 109, 0.15)",
    transform: "translate(6px, 0)",
    opacity: "0",
  });
  cleanups.push(flickerElement(magenta, GLITCH_DURATION, [15, 130], [40, 280], 40));

  // Scanline overlay
  const scanlines = document.createElement("div");
  Object.assign(scanlines.style, {
    position: "absolute",
    inset: "0",
    background:
      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.04) 2px, rgba(0,240,255,0.04) 4px)",
    opacity: "0",
    animation: `jack-in-scanlines ${GLITCH_DURATION}ms linear forwards`,
  });

  // Flicker layer
  const flicker = document.createElement("div");
  Object.assign(flicker.style, {
    position: "absolute",
    inset: "0",
    background: "rgba(0, 240, 255, 0.08)",
    opacity: "0",
  });
  cleanups.push(flickerElement(flicker, GLITCH_DURATION, [10, 80], [60, 350], 0));

  // --- VHS-style displaced slices ---
  const barsContainer = document.createElement("div");
  Object.assign(barsContainer.style, {
    position: "absolute",
    inset: "0",
    overflow: "hidden",
  });

  const colors = [
    "rgba(0, 240, 255, 0.3)",
    "rgba(255, 42, 109, 0.25)",
    "rgba(252, 238, 9, 0.2)",
    "rgba(5, 217, 232, 0.25)",
  ];

  // Thin displaced pixel-row strips
  for (let i = 0; i < 24; i++) {
    const bar = document.createElement("div");
    const yTop = Math.random() * 98;
    const thickness = 0.2 + Math.random() * 1.2;
    const yBottom = Math.min(yTop + thickness, 100);
    const offset = (Math.random() > 0.5 ? 1 : -1) * (8 + Math.random() * 50);
    const color = colors[Math.floor(Math.random() * colors.length)];

    Object.assign(bar.style, {
      position: "absolute",
      inset: "0",
      background: color,
      transform: `translateX(${offset}px)`,
      clipPath: `inset(${yTop}% 0 ${100 - yBottom}% 0)`,
      opacity: "0",
    });
    // Thin bars: 15-120ms on, 20-250ms off — wide variance
    const startDelay = Math.random() * 300;
    cleanups.push(flickerElement(bar, GLITCH_DURATION, [15, 120], [20, 250], startDelay));
    barsContainer.appendChild(bar);
  }

  // Medium displaced blocks with staircase edges
  for (let i = 0; i < 10; i++) {
    const block = document.createElement("div");
    const yTop = Math.random() * 90;
    const height = 1.5 + Math.random() * 4;
    const yBottom = Math.min(yTop + height, 100);
    const offset = (Math.random() > 0.5 ? 1 : -1) * (12 + Math.random() * 35);
    const color = colors[Math.floor(Math.random() * colors.length)];

    Object.assign(block.style, {
      position: "absolute",
      inset: "0",
      background: color,
      transform: `translateX(${offset}px)`,
      clipPath: digitalClipPath(yTop, yBottom),
      opacity: "0",
    });
    // Medium blocks: 20-250ms on, 40-350ms off
    const startDelay = Math.random() * 250;
    cleanups.push(flickerElement(block, GLITCH_DURATION, [20, 250], [40, 350], startDelay));
    barsContainer.appendChild(block);
  }

  // Large corruption blocks
  for (let i = 0; i < 3; i++) {
    const chunk = document.createElement("div");
    const yTop = Math.random() * 75;
    const height = 5 + Math.random() * 12;
    const yBottom = Math.min(yTop + height, 100);
    const offset = (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 60);

    Object.assign(chunk.style, {
      position: "absolute",
      inset: "0",
      background: `rgba(${Math.random() > 0.5 ? "0, 240, 255" : "255, 42, 109"}, 0.1)`,
      transform: `translateX(${offset}px)`,
      clipPath: digitalClipPath(yTop, yBottom),
      opacity: "0",
    });
    // Big chunks: 30-350ms on, 50-400ms off — some linger, some barely flash
    const startDelay = Math.random() * 200;
    cleanups.push(flickerElement(chunk, GLITCH_DURATION, [30, 350], [50, 400], startDelay));
    barsContainer.appendChild(chunk);
  }

  overlay.append(cyan, magenta, scanlines, flicker, barsContainer);
  document.body.appendChild(overlay);

  // Screen shake
  const html = document.documentElement;
  html.style.animation = `jack-in-shake ${GLITCH_DURATION}ms ease-out`;
  html.style.animationFillMode = "forwards";

  // Cleanup
  setTimeout(() => {
    cleanups.forEach((fn) => fn());
    overlay.remove();
    html.style.animation = "";
    html.style.animationFillMode = "";
  }, GLITCH_DURATION + 50);
}
