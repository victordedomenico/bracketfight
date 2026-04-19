"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import type { FeatMove } from "@/lib/battle-feat";

export async function saveSoloSession(
  difficulty: number,
  startingArtistId: string,
  moves: FeatMove[],
  score: number,
  jokersUsed: number,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const session = await prisma.battleFeatSoloSession.create({
      data: {
        playerId: user?.id ?? null,
        difficulty,
        startingArtistId: String(startingArtistId),
        moves: moves as unknown as import("@prisma/client").Prisma.JsonArray,
        score,
        jokersUsed,
        status: "finished",
      },
    });
    return { id: session.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur sauvegarde.";
    console.error("[saveSoloSession]", msg);
    return { error: msg };
  }
}
