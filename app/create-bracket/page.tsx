import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateBracketForm from "./CreateBracketForm";

export const metadata: Metadata = {
  title: "Créer un bracket — MusiKlash",
};

export default async function CreateBracketPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=Connexion%20requise%20pour%20cr%C3%A9er%20un%20bracket");
  }

  return (
    <div className="mx-auto w-full max-w-[1320px] py-6 lg:py-8">
      <h1 className="text-6xl font-black tracking-[-0.03em]">Créer un nouveau défi</h1>
      <p className="mt-2 text-2xl" style={{ color: "#8f93a0" }}>
        Transformez votre sélection musicale en expérience interactive.
      </p>

      <div className="mt-9">
        <CreateBracketForm />
      </div>
    </div>
  );
}
