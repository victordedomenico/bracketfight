import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { TIERS } from "@/components/TierlistBoard";

export const metadata = { title: "Résultats tierlist — MusiKlash" };

export default async function TierlistResultsPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const { id, sessionId } = await params;

  const session = await prisma.tierlistSession.findUnique({
    where: { id: sessionId },
    select: {
      placements: true,
      createdAt: true,
      tierlist: {
        select: {
          id: true,
          title: true,
          theme: true,
          tracks: {
            orderBy: { position: "asc" },
            select: { position: true, title: true, artist: true, coverUrl: true },
          },
        },
      },
    },
  });

  if (!session || session.tierlist.id !== id) notFound();

  const placements = session.placements as Record<string, number[]>;
  const trackByPosition = new Map(session.tierlist.tracks.map((t) => [t.position, t]));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-black">{session.tierlist.title}</h1>
      {session.tierlist.theme ? (
        <p className="text-[color:var(--muted)]">{session.tierlist.theme}</p>
      ) : null}
      <p className="mt-1 text-xs text-[color:var(--muted)]">
        Sauvegardée le {new Date(session.createdAt).toLocaleDateString("fr-FR")}
      </p>

      <div className="mt-8 space-y-2">
        {TIERS.map((tier) => {
          const positions = placements[tier.id] ?? [];
          if (positions.length === 0) return null;
          return (
            <div
              key={tier.id}
              className="flex items-stretch min-h-[72px] border border-[color:var(--border)] rounded-xl overflow-hidden"
            >
              <div
                className="flex items-center justify-center w-14 shrink-0 font-black text-xl text-white"
                style={{ backgroundColor: tier.color }}
              >
                {tier.label}
              </div>
              <div className="flex flex-wrap gap-2 p-2 flex-1 bg-[color:var(--surface)]">
                {positions.map((pos) => {
                  const t = trackByPosition.get(pos);
                  if (!t) return null;
                  return (
                    <div key={pos} className="relative h-16 w-16 rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={t.coverUrl ?? ""}
                        alt={t.title}
                        className="h-full w-full object-cover bg-[color:var(--surface-2)]"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5 text-[9px] leading-tight truncate text-white">
                        {t.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex gap-3">
        <Link href={`/tierlist/${id}`} className="btn-primary">
          Créer ma propre version
        </Link>
        <Link href="/explore" className="btn-ghost">
          Explorer
        </Link>
      </div>
    </div>
  );
}
