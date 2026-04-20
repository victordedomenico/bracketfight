"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { resolvePlayerIdentity } from "@/lib/guest";
import { ensureBattleFeatVisibilityColumns } from "@/lib/ensure-battle-feat-visibility-columns";

export type Visibility = "private" | "public";

async function requireIdentity() {
  try {
    return await resolvePlayerIdentity();
  } catch {
    return null;
  }
}

export async function updateBracketVisibility(id: string, visibility: Visibility) {
  const identity = await requireIdentity();
  if (!identity) return { error: "Connexion requise." };

  const res = await prisma.bracket.updateMany({
    where: { id, ownerId: identity.playerId },
    data: { visibility },
  });
  if (res.count === 0) return { error: "Bracket introuvable ou accès refusé." };
  revalidatePath("/my-brackets");
  return { ok: true as const };
}

export async function updateTierlistVisibility(id: string, visibility: Visibility) {
  const identity = await requireIdentity();
  if (!identity) return { error: "Connexion requise." };

  const res = await prisma.tierlist.updateMany({
    where: { id, ownerId: identity.playerId },
    data: { visibility },
  });
  if (res.count === 0) return { error: "Tierlist introuvable ou accès refusé." };
  revalidatePath("/my-brackets");
  return { ok: true as const };
}

export async function updateBlindtestVisibility(id: string, visibility: Visibility) {
  const identity = await requireIdentity();
  if (!identity) return { error: "Connexion requise." };

  const res = await prisma.blindtest.updateMany({
    where: { id, ownerId: identity.playerId },
    data: { visibility },
  });
  if (res.count === 0) return { error: "Blindtest introuvable ou accès refusé." };
  revalidatePath("/my-brackets");
  return { ok: true as const };
}

export async function updateBattleFeatSoloVisibility(id: string, visibility: Visibility) {
  const identity = await requireIdentity();
  if (!identity) return { error: "Connexion requise." };

  await ensureBattleFeatVisibilityColumns(prisma);

  const res = await prisma.battleFeatSoloSession.updateMany({
    where: { id, playerId: identity.playerId },
    data: { visibility },
  });
  if (res.count === 0) return { error: "Session introuvable ou accès refusé." };
  revalidatePath("/my-brackets");
  return { ok: true as const };
}

export async function updateBattleFeatRoomVisibility(id: string, visibility: Visibility) {
  const identity = await requireIdentity();
  if (!identity) return { error: "Connexion requise." };

  await ensureBattleFeatVisibilityColumns(prisma);

  const res = await prisma.battleFeatRoom.updateMany({
    where: { id, hostId: identity.playerId },
    data: { visibility },
  });
  if (res.count === 0) return { error: "Room introuvable ou accès refusé." };
  revalidatePath("/my-brackets");
  return { ok: true as const };
}
