"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export type TierlistTrackInput = {
  deezer_track_id: number;
  title: string;
  artist: string;
  preview_url: string;
  cover_url: string | null;
};

export async function createTierlist(input: {
  title: string;
  theme: string;
  visibility: "private" | "public";
  tracks: TierlistTrackInput[];
}) {
  if (!input.title.trim()) return { error: "Le titre est requis." };
  if (input.tracks.length < 2)
    return { error: "Il faut au moins 2 morceaux." };
  if (input.tracks.length > 50)
    return { error: "50 morceaux maximum." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu dois être connecté." };

  let tierlistId: string;
  try {
    const tl = await prisma.tierlist.create({
      data: {
        ownerId: user.id,
        title: input.title.trim(),
        theme: input.theme.trim() || null,
        visibility: input.visibility,
        coverUrl: input.tracks[0]?.cover_url ?? null,
        tracks: {
          create: input.tracks.map((t, i) => ({
            position: i,
            deezerTrackId: BigInt(t.deezer_track_id),
            title: t.title,
            artist: t.artist,
            previewUrl: t.preview_url,
            coverUrl: t.cover_url,
          })),
        },
      },
    });
    tierlistId = tl.id;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur création tierlist.";
    return { error: msg };
  }

  redirect(`/tierlist/${tierlistId}`);
}
