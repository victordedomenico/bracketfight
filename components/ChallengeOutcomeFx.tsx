"use client";

import { useMemo } from "react";

type Outcome = "victory" | "defeat";

type ChallengeOutcomeFxProps = {
  outcome: Outcome | null;
};

const VICTORY_COLORS = [
  "#facc15",
  "#ef4444",
  "#22c55e",
  "#38bdf8",
  "#a855f7",
  "#fb7185",
];

const DEFEAT_COLORS = ["#ef4444", "#fb7185", "#94a3b8", "#64748b"];

export default function ChallengeOutcomeFx({ outcome }: ChallengeOutcomeFxProps) {
  const pieces = useMemo(
    () =>
      Array.from({ length: outcome === "victory" ? 44 : 22 }, (_, index) => ({
        id: index,
        left: (index * 37) % 100,
        width: outcome === "victory" ? 6 + (index % 5) : 4 + (index % 3),
        height: outcome === "victory" ? 10 + (index % 6) : 7 + (index % 4),
        rotate: (index * 29) % 360,
        delay: (index * 85) % 900,
        duration:
          (outcome === "victory" ? 1900 : 1400) + ((index * 73) % 1400),
        color:
          outcome === "victory"
            ? VICTORY_COLORS[index % VICTORY_COLORS.length]
            : DEFEAT_COLORS[index % DEFEAT_COLORS.length],
      })),
    [outcome],
  );

  if (!outcome) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
    >
      {outcome === "victory" ? (
        <>
          <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.25),transparent_70%)]" />
          {pieces.map((piece) => (
            <span
              key={`victory-${piece.id}`}
              className="absolute -top-10 rounded-sm opacity-90"
              style={{
                left: `${piece.left}%`,
                width: piece.width,
                height: piece.height,
                backgroundColor: piece.color,
                transform: `rotate(${piece.rotate}deg)`,
                animation: `challenge-confetti-fall ${piece.duration}ms linear ${piece.delay}ms both`,
              }}
            />
          ))}
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.15),rgba(2,6,23,0.55)_68%)] [animation:challenge-defeat-pulse_1400ms_ease-in-out_infinite_alternate]" />
          {pieces.map((piece) => (
            <span
              key={`defeat-${piece.id}`}
              className="absolute -top-8 rounded-full opacity-75 blur-[0.3px]"
              style={{
                left: `${piece.left}%`,
                width: piece.width,
                height: piece.height,
                backgroundColor: piece.color,
                animation: `challenge-defeat-fall ${piece.duration}ms ease-in ${piece.delay}ms both`,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
