"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function createRoom() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const room = await prisma.battleFeatRoom.create({
    data: {
      hostId: user.id,
      status: "waiting",
      usedArtistIds: [],
      moves: [],
    },
  });

  redirect(`/battle-feat/room/${room.id}`);
}
