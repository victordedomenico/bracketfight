import Link from "next/link";
import { UserCircle2 } from "lucide-react";
import { getI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";
import ThemeToggle from "@/components/ThemeToggle";
import LocaleToggle from "@/components/LocaleToggle";
import SidebarNavLinks from "@/components/SidebarNavLinks";

type SiteSidebarProps = {
  theme: "dark" | "light";
  locale: "fr" | "en";
};

export default async function SiteSidebar({ theme, locale }: Readonly<SiteSidebarProps>) {
  const { t } = await getI18n();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const topLinks = [
    { href: "/", label: t.nav.home, icon: "home" as const },
    { href: "/explore", label: t.nav.explore, icon: "search" as const },
    { href: "/create", label: t.nav.create, icon: "create" as const },
  ];

  const bottomLinks = [
    { href: "/my-brackets", label: t.nav.myLibrary, icon: "library" as const },
  ];

  const helperLinks = [
    { href: "/guide", label: t.nav.guide, icon: "guide" as const },
    { href: "/preferences", label: t.nav.settings, icon: "settings" as const },
  ];

  return (
    <aside className="site-sidebar rounded-3xl border p-4 lg:p-5">
      <div className="mb-8 flex items-center gap-3 px-1">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl text-white"
          style={{ background: "linear-gradient(135deg, #ff2f6d 0%, #ff5a2a 100%)" }}
        >
          <span className="text-lg font-black">K</span>
        </div>
        <div>
          <p
            className="text-[1.65rem] font-black leading-none tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            MusiKlash
          </p>
          <p
            className="mt-1 text-[0.66rem] font-semibold uppercase tracking-[0.28em]"
            style={{ color: "var(--muted)" }}
          >
            {t.sidebar.tagline}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <SidebarNavLinks links={topLinks} />
        <SidebarNavLinks links={bottomLinks} />
      </div>

      <div className="mt-7 flex items-center gap-2 px-2">
        <ThemeToggle current={theme} />
        <LocaleToggle current={locale} />
      </div>

      <div className="mt-10 border-t pt-8" style={{ borderColor: "var(--border)" }}>
        <p
          className="mb-4 px-2 text-[0.72rem] font-bold uppercase tracking-[0.35em]"
          style={{ color: "var(--muted)" }}
        >
          {t.nav.assistance}
        </p>
        <SidebarNavLinks links={helperLinks} />
      </div>

      {user ? (
        <form action={signOut} className="mt-8">
          <button
            type="submit"
            className="w-full rounded-2xl border px-4 py-4 text-left text-[1.03rem] font-semibold"
            style={{
              borderColor: "var(--border-strong)",
              color: "var(--foreground)",
              background: "var(--surface-2)",
            }}
          >
            {t.nav.logout}
          </button>
        </form>
      ) : (
        <Link
          href="/login"
          className="mt-8 flex items-center gap-3 rounded-2xl border px-4 py-4 text-[1.03rem]"
          style={{
            borderColor: "var(--border-strong)",
            color: "var(--foreground)",
            background: "var(--surface-2)",
          }}
        >
          <UserCircle2 size={20} />
          <span className="font-semibold">{t.nav.login}</span>
        </Link>
      )}
    </aside>
  );
}
