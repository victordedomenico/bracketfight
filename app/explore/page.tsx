import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ensureBattleFeatVisibilityColumns } from "@/lib/ensure-battle-feat-visibility-columns";
import BracketCard, { type BracketSummary } from "@/components/BracketCard";
import TierlistCard, { type TierlistSummary } from "@/components/TierlistCard";
import BlindtestCard, { type BlindtestSummary } from "@/components/BlindtestCard";
import {
  BattleFeatRoomCard,
  BattleFeatSoloCard,
  type BattleFeatRoomSummary,
  type BattleFeatSessionSummary,
} from "@/components/BattleFeatCard";
import { Search } from "lucide-react";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "Explorer — MusiKlash" };

type Tab = "all" | "brackets" | "tierlists" | "blindtests" | "battlefeat";

function parseTab(raw: string | undefined): Tab {
  const v = ["all", "brackets", "tierlists", "blindtests", "battlefeat"] as const;
  return raw && (v as readonly string[]).includes(raw) ? (raw as Tab) : "all";
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>;
}) {
  const { q, tab: rawTab } = await searchParams;
  const tab = parseTab(rawTab);
  const term = q?.trim();
  const { t } = await getI18n();
  const e = t.explore;

  const textFilter = term
    ? {
        OR: [
          { title: { contains: term, mode: "insensitive" as const } },
          { theme: { contains: term, mode: "insensitive" as const } },
        ],
      }
    : {};
  const blindtestTextFilter = term
    ? { title: { contains: term, mode: "insensitive" as const } }
    : {};

  const takeGrid = tab === "all" ? 12 : 48;
  const takeBfSolo = tab === "all" ? 8 : 36;
  const takeBfRoom = tab === "all" ? 8 : 36;

  const loadBrackets = tab === "all" || tab === "brackets";
  const loadTierlists = tab === "all" || tab === "tierlists";
  const loadBlindtests = tab === "all" || tab === "blindtests";
  const loadBattlefeat = tab === "all" || tab === "battlefeat";

  if (loadBattlefeat) {
    await ensureBattleFeatVisibilityColumns(prisma);
  }

  const [brackets, tierlists, blindtests, soloSessions, battleFeatRooms] = await Promise.all([
    loadBrackets
      ? prisma.bracket.findMany({
          where: { visibility: "public", ...textFilter },
          select: { id: true, title: true, theme: true, size: true, visibility: true, coverUrl: true },
          orderBy: { createdAt: "desc" },
          take: takeGrid,
        })
      : Promise.resolve([]),
    loadTierlists
      ? prisma.tierlist.findMany({
          where: { visibility: "public", ...textFilter },
          select: { id: true, title: true, theme: true, visibility: true, coverUrl: true },
          orderBy: { createdAt: "desc" },
          take: takeGrid,
        })
      : Promise.resolve([]),
    loadBlindtests
      ? prisma.blindtest.findMany({
          where: { visibility: "public", ...blindtestTextFilter },
          select: {
            id: true,
            title: true,
            visibility: true,
            _count: { select: { tracks: true } },
          },
          orderBy: { createdAt: "desc" },
          take: takeGrid,
        })
      : Promise.resolve([]),
    loadBattlefeat
      ? prisma.battleFeatSoloSession.findMany({
          where: { visibility: "public", status: "finished" },
          select: {
            id: true,
            difficulty: true,
            score: true,
            status: true,
            visibility: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: takeBfSolo,
        })
      : Promise.resolve([]),
    loadBattlefeat
      ? prisma.battleFeatRoom.findMany({
          where: { visibility: "public" },
          select: {
            id: true,
            status: true,
            hostScore: true,
            guestScore: true,
            visibility: true,
            createdAt: true,
          },
          orderBy: { updatedAt: "desc" },
          take: takeBfRoom,
        })
      : Promise.resolve([]),
  ]);

  const bracketList = brackets.map((b) => ({ ...b, cover_url: b.coverUrl })) as BracketSummary[];
  const tierlistList = tierlists as TierlistSummary[];
  const blindtestList = blindtests.map((b) => ({
    id: b.id,
    title: b.title,
    visibility: b.visibility,
    trackCount: b._count.tracks,
  })) as BlindtestSummary[];

  const battleFeatSoloList = soloSessions.map((s) => ({
    id: s.id,
    difficulty: s.difficulty,
    score: s.score,
    status: s.status,
    visibility: s.visibility,
    createdAt: s.createdAt.toISOString(),
  })) as BattleFeatSessionSummary[];

  const battleFeatRoomList = battleFeatRooms.map((room) => ({
    id: room.id,
    status: room.status,
    hostScore: room.hostScore,
    guestScore: room.guestScore,
    visibility: room.visibility,
    createdAt: room.createdAt.toISOString(),
  })) as BattleFeatRoomSummary[];

  const hasAnyBattlefeat = battleFeatSoloList.length > 0 || battleFeatRoomList.length > 0;

  const isEmpty =
    tab === "all"
      ? bracketList.length === 0 &&
        tierlistList.length === 0 &&
        blindtestList.length === 0 &&
        !hasAnyBattlefeat
      : tab === "battlefeat"
        ? !hasAnyBattlefeat
        : tab === "brackets"
          ? bracketList.length === 0
          : tab === "tierlists"
            ? tierlistList.length === 0
            : blindtestList.length === 0;

  const tabItems = [
    { key: "all" as const, label: e.tabAll },
    { key: "brackets" as const, label: e.tabBrackets },
    { key: "tierlists" as const, label: e.tabTierlists },
    { key: "blindtests" as const, label: e.tabBlindtests },
    { key: "battlefeat" as const, label: e.tabBattlefeat },
  ];

  const gridClass =
    "mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  const gridBfClass =
    "mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3";

  return (
    <div className="mx-auto w-full max-w-[1500px] px-1 py-5 sm:px-2 sm:py-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl lg:text-7xl">{e.title}</h1>
          <p className="mt-2 text-base sm:text-xl lg:text-3xl" style={{ color: "#8f93a0" }}>
            {e.subtitle}
          </p>
        </div>
        <div
          className="inline-flex w-full gap-2 overflow-x-auto rounded-2xl border p-1 lg:w-auto lg:max-w-[min(100%,680px)]"
          style={{ borderColor: "#283041", background: "#181b24" }}
        >
          {tabItems.map((item) => {
            const active = tab === item.key;
            return (
              <Link
                key={item.key}
                href={`/explore?tab=${item.key}${term ? `&q=${encodeURIComponent(term)}` : ""}`}
                className="whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold tracking-wide no-underline sm:px-4 sm:text-sm lg:px-5"
                style={{
                  background: active ? "#f3f4f6" : "transparent",
                  color: active ? "#09090b" : "#868b98",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <form action="/explore" method="get" className="mt-8 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" />
        <input
          defaultValue={term ?? ""}
          name="q"
          placeholder={e.searchPlaceholder}
          className="input h-14 rounded-2xl pl-11 text-lg sm:h-16 sm:rounded-[22px] sm:pl-12 sm:text-2xl lg:h-20 lg:rounded-[26px] lg:pl-14 lg:text-4xl"
          style={{ background: "#171a23", borderColor: "#2a3242" }}
        />
        <input type="hidden" name="tab" value={tab} />
      </form>

      {isEmpty ? (
        <div
          className="mt-10 rounded-[26px] border p-7 text-center sm:rounded-[30px] sm:p-10 lg:rounded-[34px] lg:p-14"
          style={{ borderColor: "#232b3a", background: "#10141d" }}
        >
          <p className="text-lg font-semibold">
            {e.emptyTitle}{" "}
            {term ? e.emptyFor.replace("{term}", term) : e.emptyDefault}.
          </p>
          <p className="mt-1 text-sm text-[color:var(--muted)]">{e.emptyHint}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {tab === "all" ? (
              <>
                <Link href="/create-bracket" className="btn-primary inline-flex">
                  {e.createBracket}
                </Link>
                <Link href="/create-tierlist" className="btn-primary inline-flex">
                  {e.createTierlist}
                </Link>
                <Link href="/create-blindtest" className="btn-primary inline-flex">
                  {e.createBlindtest}
                </Link>
                <Link href="/battle-feat" className="btn-primary inline-flex">
                  {e.battleFeatTitle}
                </Link>
              </>
            ) : tab === "blindtests" ? (
              <Link href="/create-blindtest" className="btn-primary inline-flex">
                {e.createBlindtest}
              </Link>
            ) : tab === "tierlists" ? (
              <Link href="/create-tierlist" className="btn-primary inline-flex">
                {e.createTierlist}
              </Link>
            ) : tab === "battlefeat" ? (
              <>
                <Link href="/battle-feat/solo" className="btn-primary inline-flex">
                  {e.playSolo}
                </Link>
                <Link href="/battle-feat/room/new" className="btn-primary inline-flex">
                  {e.createRoom}
                </Link>
              </>
            ) : (
              <Link href="/create-bracket" className="btn-primary inline-flex">
                {e.createBracket}
              </Link>
            )}
          </div>
        </div>
      ) : tab === "all" ? (
        <div className="mt-10 space-y-14">
          {bracketList.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">{e.sectionBrackets}</h2>
              <div className={gridClass}>
                {bracketList.map((b) => (
                  <BracketCard key={b.id} b={b} />
                ))}
              </div>
              <div className="flex justify-end">
                <Link
                  href={`/explore?tab=brackets${term ? `&q=${encodeURIComponent(term)}` : ""}`}
                  className="text-sm font-semibold text-[color:var(--accent)] no-underline hover:underline"
                >
                  {e.seeAll} →
                </Link>
              </div>
            </section>
          ) : null}

          {tierlistList.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">{e.sectionTierlists}</h2>
              <div className={gridClass}>
                {tierlistList.map((tl) => (
                  <TierlistCard key={tl.id} t={tl} />
                ))}
              </div>
              <div className="flex justify-end">
                <Link
                  href={`/explore?tab=tierlists${term ? `&q=${encodeURIComponent(term)}` : ""}`}
                  className="text-sm font-semibold text-[color:var(--accent)] no-underline hover:underline"
                >
                  {e.seeAll} →
                </Link>
              </div>
            </section>
          ) : null}

          {blindtestList.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">{e.sectionBlindtests}</h2>
              <div className={gridClass}>
                {blindtestList.map((b) => (
                  <BlindtestCard key={b.id} b={b} />
                ))}
              </div>
              <div className="flex justify-end">
                <Link
                  href={`/explore?tab=blindtests${term ? `&q=${encodeURIComponent(term)}` : ""}`}
                  className="text-sm font-semibold text-[color:var(--accent)] no-underline hover:underline"
                >
                  {e.seeAll} →
                </Link>
              </div>
            </section>
          ) : null}

          {hasAnyBattlefeat ? (
            <section className="space-y-10">
              {battleFeatSoloList.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold tracking-tight">{e.sectionBattleFeatSolo}</h2>
                  <div className={gridBfClass}>
                    {battleFeatSoloList.map((s) => (
                      <BattleFeatSoloCard key={s.id} s={s} />
                    ))}
                  </div>
                </div>
              ) : null}
              {battleFeatRoomList.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold tracking-tight">{e.sectionBattleFeatRooms}</h2>
                  <div className={gridBfClass}>
                    {battleFeatRoomList.map((room) => (
                      <BattleFeatRoomCard key={room.id} r={room} />
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="flex justify-end">
                <Link
                  href="/explore?tab=battlefeat"
                  className="text-sm font-semibold text-[color:var(--accent)] no-underline hover:underline"
                >
                  {e.seeAll} →
                </Link>
              </div>
            </section>
          ) : null}
        </div>
      ) : tab === "brackets" ? (
        <div className={gridClass}>
          {bracketList.map((b) => (
            <BracketCard key={b.id} b={b} />
          ))}
        </div>
      ) : tab === "tierlists" ? (
        <div className={gridClass}>
          {tierlistList.map((tl) => (
            <TierlistCard key={tl.id} t={tl} />
          ))}
        </div>
      ) : tab === "blindtests" ? (
        <div className={gridClass}>
          {blindtestList.map((b) => (
            <BlindtestCard key={b.id} b={b} />
          ))}
        </div>
      ) : (
        <div className="mt-10 space-y-14">
          {battleFeatSoloList.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[color:var(--muted)]">{e.sectionBattleFeatSolo}</h2>
              <div className={gridClass}>
                {battleFeatSoloList.map((s) => (
                  <BattleFeatSoloCard key={s.id} s={s} />
                ))}
              </div>
            </section>
          ) : null}
          {battleFeatRoomList.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[color:var(--muted)]">{e.sectionBattleFeatRooms}</h2>
              <div className={gridClass}>
                {battleFeatRoomList.map((room) => (
                  <BattleFeatRoomCard key={room.id} r={room} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
