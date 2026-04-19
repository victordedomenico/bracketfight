import Link from "next/link";
import { Music2, Play, Trophy, ChartNoAxesColumn } from "lucide-react";

export default function GuidePage() {
  const blocks = [
    {
      title: "Brackets Musicaux",
      icon: <Trophy size={26} />,
      tone: "#f5c413",
      steps: [
        "Sélectionnez une liste de morceaux (ex: 8, 16, 32).",
        "Le site génère des duels d'un contre un.",
        "Votez pour votre titre préféré à chaque étape.",
        "Le gagnant avance jusqu'à la grande finale.",
      ],
    },
    {
      title: "TierLists",
      icon: <ChartNoAxesColumn size={26} />,
      tone: "#3b82f6",
      steps: [
        "Importez des titres ou albums via Deezer.",
        "Classez-les dans les rangs S, A, B, C ou D.",
        "Organisez visuellement votre hiérarchie musicale.",
        "Partagez votre classement avec la communauté.",
      ],
    },
    {
      title: "BlindTests",
      icon: <Music2 size={26} />,
      tone: "#ef4444",
      steps: [
        "Lancez un quiz musical avec vos propres playlists.",
        "Écoutez des extraits de 30 secondes.",
        "Devinez rapidement titre et artiste.",
        "Affrontez vos amis en mode score ou chrono.",
      ],
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1280px] py-8 lg:py-10">
      <h1 className="text-5xl font-black tracking-[-0.03em]">Guide de MusiKlash</h1>
      <p className="mt-2 text-xl" style={{ color: "#8f93a0" }}>
        Tout ce qu&apos;il faut savoir pour devenir le maître de l&apos;arène.
      </p>

      <div className="mt-10 space-y-6">
        {blocks.map((block) => (
          <section
            key={block.title}
            className="rounded-[34px] border px-6 py-7 md:px-9 md:py-8"
            style={{ borderColor: "#222a38", background: "rgba(13,16,24,0.72)" }}
          >
            <div className="mb-7 flex items-center gap-4">
              <span
                className="flex h-16 w-16 items-center justify-center rounded-3xl border"
                style={{ borderColor: "#2a3242", color: block.tone, background: "rgba(255,255,255,0.01)" }}
              >
                {block.icon}
              </span>
              <h2 className="text-5xl font-black tracking-[-0.03em]">{block.title}</h2>
            </div>

            <ol className="grid gap-4 md:grid-cols-2">
              {block.steps.map((step, index) => (
                <li key={step} className="flex items-center gap-4">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full border text-sm font-bold"
                    style={{ borderColor: "#353c48", color: "#9ca3af", background: "#1a1f2a" }}
                  >
                    {index + 1}
                  </span>
                  <span className="text-[1.5rem] leading-snug" style={{ color: "#b2b6c3" }}>
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ))}

        <div className="pt-3">
          <Link href="/create-bracket" className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-lg font-bold" style={{ background: "#ff2f6d", color: "#fff" }}>
            <Play size={18} />
            Commencer à créer
          </Link>
        </div>
      </div>
    </div>
  );
}
