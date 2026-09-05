"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useId,
  useMemo,
} from "react";

/* Safe layout-effect that avoids SSR warnings in Next.js */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ═══════════════════════════════════════════════════════════
   SpinningCounter — Transitions.dev reel-style number spin
   ═══════════════════════════════════════════════════════════
   Usage:
     <p className="text-3xl font-bold">
       <SpinningCounter text="₹16,000" />
     </p>

   The component inherits font-size / line-height / color from
   its parent and auto-measures the cell height at mount.
   Any non-digit characters (₹ , . etc.) render static while
   digits spin through 0-9 reels and land on target.
   ═══════════════════════════════════════════════════════════ */

interface SpinningCounterProps {
  /** Fully formatted display string, e.g. "₹16,000" */
  text: string;
  /** Extra CSS classes forwarded to the root <span> */
  className?: string;
  /** Number of full 0-9 spin cycles before landing (default 2) */
  spins?: number;
}

export function SpinningCounter({
  text,
  className = "",
  spins = 2,
}: SpinningCounterProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [cellH, setCellH] = useState(0);

  // Measure the inherited line-height synchronously before paint
  useIsomorphicLayoutEffect(() => {
    if (!containerRef.current) return;
    const cs = getComputedStyle(containerRef.current);
    const lh = parseFloat(cs.lineHeight);
    setCellH(!isNaN(lh) && lh > 0 ? lh : parseFloat(cs.fontSize) * 1.35);
  }, []);

  return (
    <span
      ref={containerRef}
      className={`t-reel ${className}`}
      style={{ "--reel-cell": `${cellH || 30}px` } as React.CSSProperties}
    >
      {cellH > 0 ? (
        /* key={text} forces re-mount → re-animation when value changes */
        <ReelStrip key={text} text={text} cellH={cellH} spins={spins} />
      ) : (
        /* Invisible placeholder so the browser can compute line-height */
        <span style={{ visibility: "hidden" }}>{text}</span>
      )}
    </span>
  );
}

/* ──────────────────────────────────────────────
   ReelStrip  – inner container; re-mounts on text change
   ────────────────────────────────────────────── */

function ReelStrip({
  text,
  cellH,
  spins,
}: {
  text: string;
  cellH: number;
  spins: number;
}) {
  const id = useId().replace(/:/g, "");
  const chars = useMemo(() => text.split(""), [text]);

  // Collect digit indices so we can emit one SVG filter per column
  const digitCharIndices = useMemo(() => {
    const indices: number[] = [];
    chars.forEach((c, i) => {
      if (/\d/.test(c)) indices.push(i);
    });
    return indices;
  }, [chars]);

  let digitCol = 0;

  return (
    <>
      {/* SVG blur filters (one per digit column, directional Y-only) */}
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        style={{ position: "absolute", pointerEvents: "none" }}
      >
        <defs>
          {digitCharIndices.map((ci) => (
            <filter key={ci} id={`${id}b${ci}`}>
              <feGaussianBlur in="SourceGraphic" stdDeviation="0 0" />
            </filter>
          ))}
        </defs>
      </svg>

      {chars.map((char, i) => {
        if (/\d/.test(char)) {
          const col = digitCol++;
          return (
            <ReelColumn
              key={i}
              digit={parseInt(char)}
              colIndex={col}
              filterId={`${id}b${i}`}
              cellH={cellH}
              spins={spins}
            />
          );
        }
        // Static character (₹ , . − space etc.)
        return (
          <span key={i} className="t-reel-static">
            {char}
          </span>
        );
      })}
    </>
  );
}

/* ──────────────────────────────────────────────
   ReelColumn  – single spinning digit position
   ────────────────────────────────────────────── */

function ReelColumn({
  digit,
  colIndex,
  filterId,
  cellH,
  spins,
}: {
  digit: number;
  colIndex: number;
  filterId: string;
  cellH: number;
  spins: number;
}) {
  const stripRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const DUR = 1400; // ms
    const STAGGER = 90; // ms between columns
    const BLUR_MAX = 3; // px peak vertical blur
    const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

    const totalCells = spins * 10 + digit;
    const offset = totalCells * cellH;
    const delay = colIndex * STAGGER;

    // 1. Park at the start (no transition)
    strip.style.transform = "translateY(0)";
    strip.style.transition = "none";
    void strip.offsetHeight; // force reflow

    // 2. Animate to target digit
    strip.style.transition = `transform ${DUR}ms ${EASE} ${delay}ms`;
    strip.style.transform = `translateY(-${offset}px)`;

    // 3. Directional blur: decay from BLUR_MAX → 0 as reel settles
    const blurEl = document
      .getElementById(filterId)
      ?.querySelector("feGaussianBlur");
    let raf: number;

    if (blurEl) {
      strip.style.filter = `url(#${filterId})`;
      const t0 = performance.now() + delay;
      const blurDur = DUR * 0.75;

      const tick = (now: number) => {
        const elapsed = now - t0;
        if (elapsed < 0) {
          blurEl.setAttribute("stdDeviation", `0 ${BLUR_MAX}`);
          raf = requestAnimationFrame(tick);
          return;
        }
        const progress = Math.min(elapsed / blurDur, 1);
        // Quadratic ease-out decay
        const currentBlur = BLUR_MAX * (1 - progress * progress);
        blurEl.setAttribute("stdDeviation", `0 ${currentBlur.toFixed(2)}`);
        if (progress < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          blurEl.setAttribute("stdDeviation", "0 0");
          strip.style.filter = "none";
        }
      };
      raf = requestAnimationFrame(tick);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [digit, colIndex, filterId, cellH, spins]);

  // Build the cell strip: (spins + 1) complete 0-9 sequences
  const cells = useMemo(() => {
    const arr: number[] = [];
    for (let s = 0; s <= spins; s++) {
      for (let d = 0; d <= 9; d++) {
        arr.push(d);
      }
    }
    return arr;
  }, [spins]);

  return (
    <span className="t-reel-col">
      <span ref={stripRef} className="t-reel-strip">
        {cells.map((d, j) => (
          <span key={j} className="t-reel-digit">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}
