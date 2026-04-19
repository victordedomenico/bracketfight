"use client";

import { useState } from "react";
import { setTheme } from "@/app/preferences/actions";

type CookiePref = { analytics: boolean };

export default function CookiesPage() {
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState<CookiePref>({ analytics: false });

  async function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="refit-doc-page">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-4xl font-black mb-2">Gestion des cookies</h1>
        <p style={{ color: "var(--muted)" }}>
          Choisissez quels cookies vous acceptez.
        </p>

        <div className="mt-10 space-y-4">
          {/* Essentiels */}
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">Cookies essentiels</p>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                  Indispensables au fonctionnement de la plateforme : session d'authentification,
                  préférences de langue et de thème. Ils ne peuvent pas être désactivés.
                </p>
              </div>
              <span
                className="shrink-0 mt-0.5 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: "rgba(239,68,68,0.15)", color: "var(--accent)" }}
              >
                Toujours actifs
              </span>
            </div>
          </div>

          {/* Analytiques */}
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">Cookies analytiques</p>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                  Nous aident à comprendre comment les visiteurs interagissent avec la plateforme
                  (pages visitées, durée de session). Ces données sont anonymisées.
                </p>
              </div>
              <button
                role="switch"
                aria-checked={prefs.analytics}
                onClick={() => setPrefs((p) => ({ ...p, analytics: !p.analytics }))}
                className="shrink-0 mt-0.5 relative h-6 w-11 rounded-full transition-colors duration-200"
                style={{
                  background: prefs.analytics ? "var(--accent)" : "var(--surface-3)",
                }}
              >
                <span
                  className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200"
                  style={{ transform: prefs.analytics ? "translateX(20px)" : "translateX(0)" }}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button onClick={handleSave} className="btn-primary">
            Enregistrer mes préférences
          </button>
          {saved && (
            <span className="text-sm" style={{ color: "var(--muted)" }}>
              ✓ Préférences enregistrées
            </span>
          )}
        </div>

        <p className="mt-8 text-sm" style={{ color: "var(--muted)" }}>
          Pour plus d'informations sur notre utilisation des données, consultez notre{" "}
          <a href="/privacy" style={{ color: "var(--accent)" }} className="hover:underline">
            politique de confidentialité
          </a>
          .
        </p>
      </div>
    </div>
  );
}
