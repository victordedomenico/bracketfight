import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateTierlistForm from "./CreateTierlistForm";
import SectionHeader from "@/components/ui/SectionHeader";

export const metadata = { title: "Créer une tierlist — MusiKlash" };

export default async function CreateTierlistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=Connexion%20requise%20pour%20cr%C3%A9er%20une%20tierlist");
  }

  return (
    <div className="page-shell py-12">
      <SectionHeader
        title="Créer une tierlist"
        subtitle="Sélectionne les morceaux à classer, de S+ à F."
      />
      <div className="mt-8">
        <CreateTierlistForm />
      </div>
    </div>
  );
}
