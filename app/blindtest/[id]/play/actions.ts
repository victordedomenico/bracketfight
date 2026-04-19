"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import type { BlindtestAnswer } from "@/components/BlindtestGame";

export async function saveBlindtestSession(
  blindtestId: string,
  answers: BlindtestAnswer[],
  score: number,
  maxScore: number,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  try {
    const session = await prisma.blindtestSession.create({
      data: {
        blindtestId,
        playerId: user?.id ?? null,
        score,
        maxScore,
        answers: answers as unknown as import("@prisma/client").Prisma.JsonArray,
      },
    });
    return { id: session.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur sauvegarde.";
    return { error: msg };
  }
}
