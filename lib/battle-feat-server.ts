import prisma from "@/lib/prisma";
import type { BattleFeatRoomSnapshot, FeatMove } from "@/lib/battle-feat";
import { parseFeatArtists, slugifyName, popularityTier } from "@/lib/battle-feat";
import { getArtistTopTracks, searchArtists, searchTracks } from "@/lib/deezer";

type ConnectedArtist = {
  id: string;
  name: string;
  pictureUrl: string | null;
  fanCount: number;
  popularityTier: number;
  trackTitle: string | null;
};

function normalizeMoves(moves: unknown): FeatMove[] {
  return Array.isArray(moves) ? (moves as FeatMove[]) : [];
}

function normalizeUsedArtistIds(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function difficultyMaxTier(difficulty: number): number {
  if (difficulty <= 1) return 1;
  if (difficulty === 2) return 2;
  return 3;
}

export async function validateFeatLink(prevArtistId: string, nextArtistId: string) {
  if (!prevArtistId || !nextArtistId || prevArtistId === nextArtistId) {
    return null;
  }

  return prisma.rapFeat.findFirst({
    where: {
      OR: [
        { artistAId: prevArtistId, artistBId: nextArtistId },
        { artistAId: nextArtistId, artistBId: prevArtistId },
      ],
    },
    select: { trackTitle: true },
  });
}

export async function getConnectedArtists(currentArtistId: string): Promise<ConnectedArtist[]> {
  const feats = await prisma.rapFeat.findMany({
    where: {
      OR: [{ artistAId: currentArtistId }, { artistBId: currentArtistId }],
    },
    select: {
      artistA: {
        select: {
          id: true,
          name: true,
          pictureUrl: true,
          fanCount: true,
          popularityTier: true,
        },
      },
      artistB: {
        select: {
          id: true,
          name: true,
          pictureUrl: true,
          fanCount: true,
          popularityTier: true,
        },
      },
      trackTitle: true,
    },
  });

  const byArtist = new Map<string, ConnectedArtist>();

  for (const feat of feats) {
    const candidate = feat.artistA.id === currentArtistId ? feat.artistB : feat.artistA;
    if (candidate.id === currentArtistId) continue;

    const existing = byArtist.get(candidate.id);
    if (!existing) {
      byArtist.set(candidate.id, {
        id: candidate.id,
        name: candidate.name,
        pictureUrl: candidate.pictureUrl,
        fanCount: candidate.fanCount,
        popularityTier: candidate.popularityTier,
        trackTitle: feat.trackTitle ?? null,
      });
      continue;
    }

    if (!existing.trackTitle && feat.trackTitle) {
      existing.trackTitle = feat.trackTitle;
    }
    if (candidate.fanCount > existing.fanCount) {
      existing.fanCount = candidate.fanCount;
      existing.popularityTier = candidate.popularityTier;
      existing.pictureUrl = candidate.pictureUrl;
    }
  }

  return [...byArtist.values()];
}

export async function pickAiMove(
  currentArtistId: string,
  difficulty: number,
  usedIds: string[],
): Promise<ConnectedArtist | null> {
  const candidates = await getConnectedArtists(currentArtistId);
  const available = candidates.filter(
    (artist) =>
      !usedIds.includes(artist.id) &&
      artist.popularityTier <= difficultyMaxTier(difficulty),
  );

  if (available.length === 0) return null;

  return available[Math.floor(Math.random() * available.length)] ?? null;
}

export async function pickJokerMove(currentArtistId: string, usedIds: string[]) {
  const candidates = await getConnectedArtists(currentArtistId);

  return (
    candidates
      .filter((artist) => !usedIds.includes(artist.id))
      .sort((a, b) => b.fanCount - a.fanCount)[0] ?? null
  );
}

export function canClaimTurnTimeout(updatedAt: Date, turnSeconds: number, toleranceSeconds = 2) {
  const elapsedMs = Date.now() - updatedAt.getTime();
  return elapsedMs >= Math.max(0, turnSeconds - toleranceSeconds) * 1000;
}

export async function getBattleFeatRoomSnapshot(
  roomId: string,
): Promise<BattleFeatRoomSnapshot | null> {
  const room = await prisma.battleFeatRoom.findUnique({
    where: { id: roomId },
    include: {
      host: { select: { username: true } },
      guest: { select: { username: true } },
    },
  });

  if (!room) return null;

  return {
    id: room.id,
    hostId: room.hostId,
    guestId: room.guestId,
    status: room.status,
    startingArtistId: room.startingArtistId,
    startingArtistName: room.startingArtistName,
    startingArtistPic: room.startingArtistPic,
    currentArtistId: room.currentArtistId,
    currentArtistName: room.currentArtistName,
    currentArtistPic: room.currentArtistPic,
    currentTurnId: room.currentTurnId,
    usedArtistIds: normalizeUsedArtistIds(room.usedArtistIds),
    moves: normalizeMoves(room.moves),
    hostScore: room.hostScore,
    guestScore: room.guestScore,
    hostJokers: room.hostJokers,
    guestJokers: room.guestJokers,
    winnerId: room.winnerId,
    hostUsername: room.host.username,
    guestUsername: room.guest?.username ?? null,
    updatedAt: room.updatedAt.toISOString(),
  };
}

// ─── Deezer-based game logic (no DB required) ─────────────────────────────────

type DeezerArtistMove = {
  id: string;
  name: string;
  pictureUrl: string | null;
  fanCount: number;
  popularityTier: number;
  trackTitle: string | null;
  previewUrl: string | null;
};

function normalizePreviewUrl(previewUrl: string | null | undefined): string | null {
  if (!previewUrl || previewUrl.length === 0) return null;
  return previewUrl.replace(/^http:\/\//i, "https://");
}

function pickByDifficulty(
  candidates: DeezerArtistMove[],
  difficulty: number,
): DeezerArtistMove | null {
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  const byFansAsc = [...candidates].sort((a, b) => a.fanCount - b.fanCount);
  const bucketSize = Math.max(1, Math.ceil(byFansAsc.length / 3));

  if (difficulty <= 1) {
    // Easy: bias toward mainstream artists (high fan count).
    const mainstream = byFansAsc.slice(-bucketSize);
    return mainstream[Math.floor(Math.random() * mainstream.length)] ?? mainstream[0] ?? null;
  }

  if (difficulty >= 3) {
    // Hard: bias toward less-known artists (low fan count).
    const underground = byFansAsc.slice(0, bucketSize);
    return underground[Math.floor(Math.random() * underground.length)] ?? underground[0] ?? null;
  }

  // Normal: keep broad variety.
  return candidates[Math.floor(Math.random() * candidates.length)] ?? null;
}

type FeatCandidate = {
  slug: string;
  name: string;
  artistId: string | null;
  trackTitle: string;
  previewUrl: string | null;
};

async function getFeatCandidates(artistId: string): Promise<FeatCandidate[]> {
  const tracks = await getArtistTopTracks(Number(artistId), 50, { requirePreview: false });
  const seen = new Map<string, string>();
  const out: FeatCandidate[] = [];
  for (const track of tracks) {
    for (const featName of parseFeatArtists(track.title)) {
      const slug = slugifyName(featName);
      if (!slug || seen.has(slug)) continue;
      seen.set(slug, track.title);
      out.push({
        slug,
        name: featName,
        artistId: null,
        trackTitle: track.title,
        previewUrl: normalizePreviewUrl(track.preview),
      });
    }
    // Deezer often lists collaborations in contributors instead of the title.
    for (const contributor of track.contributors ?? []) {
      const contributorId = String(contributor.id);
      if (!contributorId || contributorId === artistId) continue;
      const slug = slugifyName(contributor.name);
      if (!slug || seen.has(slug)) continue;
      seen.set(slug, track.title);
      out.push({
        slug,
        name: contributor.name,
        artistId: contributorId,
        trackTitle: track.title,
        previewUrl: normalizePreviewUrl(track.preview),
      });
    }
  }
  return out;
}

export async function validateFeatLinkDeezer(
  prevArtistId: string,
  nextArtistName: string,
): Promise<{ trackTitle: string | null } | null> {
  const nextSlug = slugifyName(nextArtistName);
  const candidates = await getFeatCandidates(prevArtistId);
  const hit = candidates.find((c) => c.slug === nextSlug);
  if (hit) return { trackTitle: hit.trackTitle };

  // Also try from the other direction if we have the next artist's ID (passed via nextArtistId)
  return null;
}

export async function validateFeatLinkDeezerBidirectional(
  prevArtistId: string,
  prevArtistName: string,
  nextArtistId: string,
  nextArtistName: string,
): Promise<{ trackTitle: string | null; previewUrl: string | null } | null> {
  const nextSlug = slugifyName(nextArtistName);
  const prevSlug = slugifyName(prevArtistName);

  // 1) Check prev artist's top tracks for next artist
  const prevCandidates = await getFeatCandidates(prevArtistId);
  const fwdHit = prevCandidates.find((c) => c.slug === nextSlug);
  if (fwdHit) return { trackTitle: fwdHit.trackTitle, previewUrl: fwdHit.previewUrl };

  // 2) Check next artist's top tracks for prev artist
  const nextCandidates = await getFeatCandidates(nextArtistId);
  const revHit = nextCandidates.find((c) => c.slug === prevSlug);
  if (revHit) return { trackTitle: revHit.trackTitle, previewUrl: revHit.previewUrl };

  // 3) Fallback: direct Deezer track search (catches hits outside top 50)
  const queries = [
    `${prevArtistName} ${nextArtistName}`,
    `${nextArtistName} ${prevArtistName}`,
  ];
  for (const q of queries) {
    try {
      const tracks = await searchTracks(q, 20, { requirePreview: false });
      for (const track of tracks) {
        const mainSlug = slugifyName(track.artist.name);
        const titleFeatSlugs = parseFeatArtists(track.title).map(slugifyName);
        const contributorSlugs = (track.contributors ?? []).map((c) => slugifyName(c.name));
        const linkedSlugs = [...titleFeatSlugs, ...contributorSlugs];
        const hasPrev = mainSlug === prevSlug || linkedSlugs.includes(prevSlug);
        const hasNext = mainSlug === nextSlug || linkedSlugs.includes(nextSlug);
        if (hasPrev && hasNext) {
          return {
            trackTitle: track.title,
            previewUrl: normalizePreviewUrl(track.preview),
          };
        }
      }
    } catch {
      // ignore search errors — fallback is best-effort
    }
  }

  return null;
}

export async function pickAiMoveDeezer(
  currentArtistId: string,
  difficulty: number,
  usedIds: string[],
): Promise<DeezerArtistMove | null> {
  const candidates = await getFeatCandidates(currentArtistId);
  if (candidates.length === 0) return null;

  // Search Deezer for up to 12 feat artists in parallel
  const toSearch = candidates.slice(0, 12);
  const results = await Promise.all(
    toSearch.map(async ({ name, slug, artistId, trackTitle, previewUrl }) => {
      if (artistId && !usedIds.includes(artistId)) {
        try {
          const artistHits = await searchArtists(name, 5);
          const artistMatch = artistHits.find((a) => String(a.id) === artistId);
          if (artistMatch) {
            const tier = popularityTier(artistMatch.nb_fan ?? 0);
            return {
              id: String(artistMatch.id),
              name: artistMatch.name,
              pictureUrl: artistMatch.picture_medium ?? artistMatch.picture_small ?? null,
              fanCount: artistMatch.nb_fan ?? 0,
              popularityTier: tier,
              trackTitle,
              previewUrl,
            };
          }
        } catch {
          // fallback to slug matching below
        }
      }
      try {
        const hits = await searchArtists(name, 3);
        const match = hits.find((a) => slugifyName(a.name) === slug) ?? hits[0];
        if (!match) return null;
        if (usedIds.includes(String(match.id))) return null;
        const tier = popularityTier(match.nb_fan ?? 0);
        return {
          id: String(match.id),
          name: match.name,
          pictureUrl: match.picture_medium ?? match.picture_small ?? null,
          fanCount: match.nb_fan ?? 0,
          popularityTier: tier,
          trackTitle,
          previewUrl,
        };
      } catch {
        return null;
      }
    }),
  );

  const valid = results.filter(Boolean) as DeezerArtistMove[];
  if (valid.length === 0) return null;
  return pickByDifficulty(valid, difficulty);
}

export async function pickJokerMoveDeezer(
  currentArtistId: string,
  usedIds: string[],
): Promise<DeezerArtistMove | null> {
  const candidates = await getFeatCandidates(currentArtistId);
  if (candidates.length === 0) return null;

  const toSearch = candidates.slice(0, 12);
  const results = await Promise.all(
    toSearch.map(async ({ name, slug, artistId, trackTitle, previewUrl }) => {
      if (artistId && !usedIds.includes(artistId)) {
        try {
          const artistHits = await searchArtists(name, 5);
          const artistMatch = artistHits.find((a) => String(a.id) === artistId);
          if (artistMatch) {
            return {
              id: String(artistMatch.id),
              name: artistMatch.name,
              pictureUrl: artistMatch.picture_medium ?? artistMatch.picture_small ?? null,
              fanCount: artistMatch.nb_fan ?? 0,
              popularityTier: popularityTier(artistMatch.nb_fan ?? 0),
              trackTitle,
              previewUrl,
            };
          }
        } catch {
          // fallback to slug matching below
        }
      }
      try {
        const hits = await searchArtists(name, 3);
        const match = hits.find((a) => slugifyName(a.name) === slug) ?? hits[0];
        if (!match) return null;
        if (usedIds.includes(String(match.id))) return null;
        return {
          id: String(match.id),
          name: match.name,
          pictureUrl: match.picture_medium ?? match.picture_small ?? null,
          fanCount: match.nb_fan ?? 0,
          popularityTier: popularityTier(match.nb_fan ?? 0),
          trackTitle,
          previewUrl,
        };
      } catch {
        return null;
      }
    }),
  );

  const valid = results.filter(Boolean) as DeezerArtistMove[];
  if (valid.length === 0) return null;
  // Return most popular
  return valid.sort((a, b) => b.fanCount - a.fanCount)[0];
}
