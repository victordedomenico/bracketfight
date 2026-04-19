"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function createBlindtestRoom(blindtestId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Make sure the blindtest exists
  const bt = await prisma.blindtest.findUnique({ where: { id: blindtestId } });
  if (!bt) redirect(`/blindtest/${blindtestId}`);

  const room = await prisma.blindtestRoom.create({
    data: {
      blindtestId,
      hostId: user.id,
      status: "waiting",
      hostAnswers: [],
      guestAnswers: [],
    },
  });

  redirect(`/blindtest/room/${room.id}`);
}
