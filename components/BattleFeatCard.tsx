import Link from "next/link";
import { Swords, Trophy, Clock } from "lucide-react";

export type BattleFeatSessionSummary = {
  id: string;
  difficulty: number;
  score: number;
  status: string;
  createdAt: string;
};

export type BattleFeatRoomSummary = {
  id: string;
  status: string;
  hostScore: number;
  guestScore: number;
  createdAt: string;
};

const difficultyLabel: Record<number, string> = { 1: "Facile", 2: "Normal", 3: "Difficile" };
const difficultyColor: Record<number, string> = {
  1: "text-green-400",
  2: "text-yellow-400",
  3: "text-red-400",
};

export function BattleFeatSoloCard({ s }: { s: BattleFeatSessionSummary }) {
  const href = s.status === "finished" ? `/battle-feat/results/${s.id}` : `/battle-feat/solo`;
  return (
    <Link href={href} className="group media-card">
      <div className="media-thumb flex items-center justify-center bg-gradient-to-br from-red-500/20 to-orange-500/20">
        <Swords
          size={36}
          className="text-[color:var(--muted)] group-hover:text-[color:var(--accent)] transition"
        />
        <span className="media-pill absolute right-2 top-2">
          Solo
        </span>
        <span
          className={`media-pill absolute left-2 top-2 ${difficultyColor[s.difficulty] ?? ""}`}
        >
          {difficultyLabel[s.difficulty] ?? "?"}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold flex items-center gap-1.5">
            <Trophy size={14} className="text-yellow-400" />
            {s.score} point{s.score !== 1 ? "s" : ""}
          </p>
          <span className="text-xs text-[color:var(--muted)] flex items-center gap-1">
            <Clock size={12} />
            {new Date(s.createdAt).toLocaleDateString("fr-FR")}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function BattleFeatRoomCard({ r }: { r: BattleFeatRoomSummary }) {
  const statusLabel: Record<string, string> = {
    waiting: "En attente",
    playing: "En cours",
    finished: "Terminée",
  };
  return (
    <Link
      href={`/battle-feat/room/${r.id}`}
      className="group media-card"
    >
      <div className="media-thumb flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-red-500/20">
        <Swords
          size={36}
          className="text-[color:var(--muted)] group-hover:text-[color:var(--accent)] transition"
        />
        <span className="media-pill absolute right-2 top-2">
          Multi
        </span>
        <span className="media-pill absolute left-2 top-2">
          {statusLabel[r.status] ?? r.status}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold">
            {r.hostScore} – {r.guestScore}
          </p>
          <span className="text-xs text-[color:var(--muted)] flex items-center gap-1">
            <Clock size={12} />
            {new Date(r.createdAt).toLocaleDateString("fr-FR")}
          </span>
        </div>
      </div>
    </Link>
  );
}
