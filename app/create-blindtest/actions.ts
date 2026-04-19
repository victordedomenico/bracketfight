"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export type BlindtestTrackInput = {
  deezer_track_id: number;
  title: string;
  artist: string;
  preview_url: string;
  cover_url: string | null;
};

export async function createBlindtest(input: {
  title: string;
  visibility: "private" | "public";
  tracks: BlindtestTrackInput[];
}) {
  if (!input.title.trim()) return { error: "Le titre est requis." };
  if (input.tracks.length < 3) return { error: "Il faut au moins 3 morceaux." };
  if (input.tracks.length > 50) return { error: "50 morceaux maximum." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tu dois être connecté." };

  let blindtestId: string;
  try {
    const bt = await prisma.blindtest.create({
      data: {
        ownerId: user.id,
        title: input.title.trim(),
        visibility: input.visibility,
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
    blindtestId = bt.id;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur création blindtest.";
    return { error: msg };
  }

  redirect(`/blindtest/${blindtestId}`);
}
