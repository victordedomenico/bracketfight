import Link from "next/link";
import { Eye, EyeOff, Music } from "lucide-react";

export type BlindtestSummary = {
  id: string;
  title: string;
  visibility: string;
  trackCount?: number;
};

export default function BlindtestCard({ b }: { b: BlindtestSummary }) {
  return (
    <Link
      href={`/blindtest/${b.id}`}
      className="group media-card"
    >
      <div className="media-thumb flex items-center justify-center">
        <Music size={36} className="text-[color:var(--muted)] group-hover:text-[color:var(--accent)] transition" />
        <span className="media-pill absolute right-2 top-2">
          Blindtest
        </span>
        <span className="media-pill absolute left-2 top-2">
          {b.visibility === "public" ? (
            <>
              <Eye size={12} /> Public
            </>
          ) : (
            <>
              <EyeOff size={12} /> Privé
            </>
          )}
        </span>
      </div>
      <div className="p-4">
        <p className="font-semibold line-clamp-1">{b.title}</p>
        {b.trackCount != null ? (
          <p className="mt-0.5 text-xs text-[color:var(--muted)]">
            {b.trackCount} morceau{b.trackCount > 1 ? "x" : ""}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
