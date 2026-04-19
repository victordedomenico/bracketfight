"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Share2, Trophy } from "lucide-react";
import MatchCard, { type BracketTrack } from "./MatchCard";
import {
  buildBracketState,
  totalRounds,
  type BracketSize,
  type Vote,
} from "@/lib/bracket";

function roundLabel(round: number, total: number) {
  const remaining = total - round + 1;
  if (round === total) return "Finale";
  if (remaining === 2) return "Demi-finale";
  if (remaining === 3) return "Quarts de finale";
  if (remaining === 4) return "Huitièmes de finale";
  return `Tour ${round}`;
}

export default function BracketGame({
  bracketId,
  size,
  tracks,
}: {
  bracketId: string;
  size: BracketSize;
  tracks: BracketTrack[];
}) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const total = totalRounds(size);

  const trackCount = tracks.length;
  const state = useMemo(
    () => buildBracketState(size, votes, trackCount),
    [size, votes, trackCount],
  );
  const tracksBySeed = useMemo(() => {
    const m = new Map<number, BracketTrack>();
    tracks.forEach((t) => m.set(t.seed, t));
    return m;
  }, [tracks]);

  const currentRoundPairings = state.rounds[state.rounds.length - 1];
  const currentRound = state.rounds.length;

  // Bye pairings (seedB > trackCount) are auto-resolved — skip them when
  // looking for the next match to display and when counting progress.
  const realPairings = currentRoundPairings.filter((p) =>
    tracksBySeed.has(p.seedB),
  );
  const nextMatch = realPairings.find(
    (p) =>
      !votes.some(
        (v) => v.round === currentRound && v.matchIndex === p.matchIndex,
      ),
  );

  const handlePick = (matchIndex: number, winnerSeed: number) => {
    setVotes((prev) => [
      ...prev,
      { round: currentRound, matchIndex, winnerSeed },
    ]);
  };

  const share = async () => {
    const url = `${window.location.origin}/bracket-game/${bracketId}`;
    try {
      await navigator.clipboard.writeText(url);
      alert("Lien copié dans le presse-papiers !");
    } catch {
      window.prompt("Copie le lien :", url);
    }
  };

  if (state.winner) {
    const champ = tracksBySeed.get(state.winner);
    return (
      <div className="card p-10 text-center">
        <Trophy className="mx-auto text-yellow-400" size={48} />
        <p className="mt-2 text-sm uppercase tracking-widest text-[color:var(--muted)]">
          Champion
        </p>
        {champ ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={champ.cover_url ?? ""}
              alt=""
              className="mx-auto mt-6 h-56 w-56 rounded-2xl object-cover shadow-2xl"
            />
            <h2 className="mt-4 text-3xl font-black">{champ.title}</h2>
            <p className="text-[color:var(--muted)]">{champ.artist}</p>
          </>
        ) : null}
        <div className="mt-8 flex justify-center gap-2">
          <button onClick={share} className="btn-ghost">
            <Share2 size={16} /> Partager
          </button>
          <button
            onClick={() => setVotes([])}
            className="btn-primary"
          >
            Rejouer
          </button>
          <Link href="/my-brackets" className="btn-ghost">
            Ma bibliothèque
          </Link>
        </div>
      </div>
    );
  }

  if (!nextMatch) {
    return (
      <div className="card p-6 text-center text-[color:var(--muted)]">
        Chargement du tour suivant…
      </div>
    );
  }

  const a = tracksBySeed.get(nextMatch.seedA);
  const b = tracksBySeed.get(nextMatch.seedB);
  if (!a || !b) {
    return (
      <div className="card p-6 text-center text-red-400">
        Impossible de trouver les pistes du duel.
      </div>
    );
  }

  const votedThisRound = votes.filter((v) => v.round === currentRound).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[color:var(--muted)]">
          {roundLabel(currentRound, total)} — Duel {votedThisRound + 1} /{" "}
          {realPairings.length}
        </span>
        <div className="h-2 w-40 rounded-full bg-[color:var(--surface-2)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--accent-2)]"
            style={{
              width: `${(votedThisRound / realPairings.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <MatchCard
        a={a}
        b={b}
        onPick={(seed) => handlePick(nextMatch.matchIndex, seed)}
        roundLabel={roundLabel(currentRound, total)}
      />
    </div>
  );
}
