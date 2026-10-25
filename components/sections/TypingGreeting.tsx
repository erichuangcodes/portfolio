"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { colors } from "@/lib/tokens";

const TYPE_MS = 70;
const DELETE_MS = 35;
const HOLD_MS = 2200;
const GAP_MS = 400;

type Phase = "typing" | "holding" | "deleting";

export default function TypingGreeting({ phrases }: { phrases: readonly string[] }) {
  const reduced = useReducedMotion() === true;
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");

  const phrase = phrases[index % phrases.length];

  useEffect(() => {
    if (reduced) return;
    let delay: number;
    let next: () => void;

    if (phase === "typing") {
      if (length < phrase.length) {
        delay = TYPE_MS;
        next = () => setLength((n) => n + 1);
      } else {
        delay = HOLD_MS;
        next = () => setPhase("deleting");
      }
    } else if (phase === "deleting") {
      if (length > 0) {
        delay = DELETE_MS;
        next = () => setLength((n) => n - 1);
      } else {
        delay = GAP_MS;
        next = () => {
          setIndex((i) => (i + 1) % phrases.length);
          setPhase("typing");
        };
      }
    } else {
      return;
    }

    const id = window.setTimeout(next, delay);
    return () => window.clearTimeout(id);
  }, [reduced, phase, length, phrase.length, phrases.length]);

  const shown = reduced ? phrases[0] : phrase.slice(0, length);

  return (
    <h2
      aria-label={phrases[0]}
      style={{
        fontFamily: "var(--font-fraunces)",
        fontOpticalSizing: "auto",
        fontSize: "clamp(1.75rem, 4.5vw, 3.5rem)",
        fontWeight: 500,
        lineHeight: 1.1,
        letterSpacing: "-0.015em",
        color: colors.accent.primary,
        margin: 0,
        minHeight: "1.1em",
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden="true">{shown}</span>
      <span aria-hidden="true" className="typing-cursor">
        |
      </span>
      <style>{`
        .typing-cursor {
          display: inline-block;
          margin-left: 0.04em;
          font-weight: 300;
          animation: typing-blink 1s steps(1, end) infinite;
        }
        @keyframes typing-blink { 50% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .typing-cursor { animation: none; }
        }
      `}</style>
    </h2>
  );
}
