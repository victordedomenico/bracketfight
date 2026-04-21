import Link from "next/link";
import { headers } from "next/headers";
import {
  CirclePlus,
  Library,
  Play,
  Trophy,
} from "lucide-react";
import { getI18n } from "@/lib/i18n";
import { detectCountryCode, getTopAlbumsByCountry } from "@/lib/top-albums";

export default async function Home() {
  const { t } = await getI18n();
  const requestHeaders = await headers();
  const countryCode = detectCountryCode(requestHeaders);
  const topAlbums = await getTopAlbumsByCountry(countryCode, 18);
  const countryName =
    typeof Intl.DisplayNames === "function"
      ? new Intl.DisplayNames(["fr", "en"], { type: "region" }).of(countryCode) ?? countryCode
      : countryCode;
  const topCoversTitle =
    countryName && countryName !== countryCode
      ? t.homeHero.coversTopCountry.replace("{country}", countryName)
      : t.homeHero.coversTopFallback;
  const marqueeAlbums = topAlbums.length > 0 ? [...topAlbums, ...topAlbums] : [];

  return (
    <div className="space-y-4">
      <section
        className="relative rounded-[36px] border px-7 py-12 text-center sm:px-10 md:px-12 md:py-16 lg:px-20 lg:py-20"
        style={{
          borderColor: "var(--border-strong)",
          background: "var(--surface)",
          color: "var(--foreground)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[36px]"
          style={{
            background:
              "radial-gradient(900px 480px at 55% 10%, rgba(239,68,68,0.22) 0%, rgba(249,115,22,0.10) 45%, transparent 78%)",
          }}
        />
        <div className="relative">
          <p
            className="mx-auto inline-flex rounded-full border px-5 py-2 text-[0.72rem] font-bold uppercase tracking-[0.2em]"
            style={{
              color: "#ff4b7d",
              borderColor: "rgba(255,75,125,0.35)",
              background: "rgba(255,75,125,0.12)",
            }}
          >
            {t.homeHero.newBadge}
          </p>
          <h1
            className="mt-7 px-[0.08em] pb-[0.06em] font-black leading-[1.06] tracking-[-0.025em]"
            style={{ fontSize: "clamp(3.1rem, 9vw, 7.2rem)", color: "var(--foreground)" }}
          >
            {t.homeHero.title1} {t.homeHero.title2}
            <br />
            <span
              className="inline-block pb-[0.05em]"
              style={{
                background:
                  "linear-gradient(90deg, #ff5a8b 5%, #ff8f74 35%, #7ce3ff 70%, #5effd6 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {t.homeHero.highlight}
            </span>{" "}
            {t.homeHero.title3}
          </h1>
          <p
            className="mx-auto mt-7 max-w-[860px] text-[1.48rem] leading-relaxed"
            style={{ color: "var(--muted-strong)" }}
          >
            {t.homeHero.subtitle}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/create"
              className="btn-primary"
              style={{
                padding: "1.05rem 2rem",
                fontSize: "1.1rem",
                borderRadius: "1rem",
              }}
            >
              <CirclePlus size={19} />
              {t.homeHero.ctaCreate}
            </Link>
            <Link
              href="/explore"
              className="btn-ghost"
              style={{
                padding: "1.05rem 2.75rem",
                fontSize: "1.1rem",
                borderRadius: "1rem",
              }}
            >
              {t.homeHero.ctaExplore}
            </Link>
          </div>
          {topAlbums.length > 0 ? (
            <div className="mt-8">
              <p
                className="mb-3 text-xs font-semibold uppercase tracking-[0.14em]"
                style={{ color: "var(--muted-strong)" }}
              >
                {topCoversTitle}
              </p>
              <div className="home-covers-mask">
                <div className="home-covers-track">
                  {marqueeAlbums.map((album, index) => (
                    <a
                      key={`${album.id}-${index}`}
                      href={album.url}
                      target="_blank"
                      rel="noreferrer"
                      className="home-cover-item"
                      aria-label={`${album.title} - ${album.artist}`}
                      title={`${album.title} - ${album.artist}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={album.coverUrl}
                        alt={`${album.title} - ${album.artist}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FeatureTile
          href="/explore"
          title={t.homeHero.featureBrackets}
          icon={<Trophy size={38} />}
          tone="amber"
        />
        <FeatureTile
          href="/my-brackets"
          title={t.nav.myLibrary}
          icon={<Library size={38} />}
          tone="blue"
        />
        <FeatureTile
          href="/blindtest/room"
          title={t.homeHero.featureBlindtests}
          icon={<Play size={38} />}
          tone="violet"
        />
        <FeatureTile
          href="/battle-feat"
          title={t.nav.battleFeat}
          icon={<Play size={38} />}
          tone="rose"
        />
      </section>
    </div>
  );
}

type FeatureTileProps = Readonly<{
  href: string;
  title: string;
  icon: React.ReactNode;
  tone: "amber" | "blue" | "violet" | "rose";
}>;

function FeatureTile({ href, title, icon, tone }: FeatureTileProps) {
  const accent = {
    amber: "#f59e0b",
    blue: "#3b82f6",
    violet: "#ef4444",
    rose: "#ff3b74",
  } as const;

  return (
    <Link
      href={href}
      className="rounded-[30px] border p-8 transition hover:-translate-y-0.5"
      style={{
        minHeight: "210px",
        borderColor: "var(--border-strong)",
        background: `linear-gradient(180deg, color-mix(in srgb, ${accent[tone]} 14%, var(--surface)) 0%, var(--surface) 100%)`,
        color: "var(--foreground)",
      }}
    >
      <div className="mb-8" style={{ color: accent[tone] }}>
        {icon}
      </div>
      <h3
        className="text-5xl font-black tracking-[-0.03em]"
        style={{ color: "var(--foreground)" }}
      >
        {title}
      </h3>
    </Link>
  );
}
