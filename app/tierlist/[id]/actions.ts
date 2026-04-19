"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function saveTierlistSession(
  tierlistId: string,
  placements: Record<string, number[]>,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  try {
    const session = await prisma.tierlistSession.create({
      data: {
        tierlistId,
        playerId: user?.id ?? null,
        placements,
      },
    });
    return { id: session.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur sauvegarde.";
    return { error: msg };
  }
}
