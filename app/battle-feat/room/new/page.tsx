import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createRoom } from "./actions";

export const metadata: Metadata = { title: "Créer une room — BattleFeat" };

export default async function NewRoomPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-[780px] py-8 text-center">
      <h1 className="text-5xl font-black tracking-[-0.03em]">Creer une room BattleFeat</h1>
      <p className="mt-2 text-xl" style={{ color: "#8f93a0" }}>
        Cree une room privee et partage le lien avec ton adversaire.
      </p>
      <div className="mt-8 rounded-[30px] border p-8" style={{ borderColor: "#2a3242", background: "#10141d" }}>
        <form action={createRoom}>
          <button type="submit" className="btn-primary w-full py-3 text-lg">
            Creer la room
          </button>
        </form>
      </div>
    </div>
  );
}
