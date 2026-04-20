"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Visibility } from "@/app/my-brackets/actions";
import {
  updateBattleFeatRoomVisibility,
  updateBattleFeatSoloVisibility,
  updateBlindtestVisibility,
  updateBracketVisibility,
  updateTierlistVisibility,
} from "@/app/my-brackets/actions";

type Entity =
  | "bracket"
  | "tierlist"
  | "blindtest"
  | "battlefeat_solo"
  | "battlefeat_room";

export default function LibraryVisibilityToggle({
  entity,
  id,
  visibility,
}: {
  entity: Entity;
  id: string;
  visibility: Visibility;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function apply(next: Visibility) {
    if (next === visibility || pending) return;
    setError(null);
    startTransition(async () => {
      let res:
        | { ok: true }
        | { error: string }
        | undefined;
      switch (entity) {
        case "bracket":
          res = await updateBracketVisibility(id, next);
          break;
        case "tierlist":
          res = await updateTierlistVisibility(id, next);
          break;
        case "blindtest":
          res = await updateBlindtestVisibility(id, next);
          break;
        case "battlefeat_solo":
          res = await updateBattleFeatSoloVisibility(id, next);
          break;
        case "battlefeat_room":
          res = await updateBattleFeatRoomVisibility(id, next);
          break;
      }
      if (res && "error" in res) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div
      className="rounded-xl border px-3 py-2.5"
      style={{ borderColor: "#283041", background: "#131822" }}
      role="group"
      aria-label="Visibilité"
    >
      <p
        className="text-[10px] font-bold uppercase tracking-wide"
        style={{ color: "var(--muted-strong)" }}
      >
        Visibilité
      </p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          className="btn-chip"
          data-active={visibility === "private"}
          onClick={() => apply("private")}
        >
          Privé
        </button>
        <button
          type="button"
          disabled={pending}
          className="btn-chip"
          data-active={visibility === "public"}
          onClick={() => apply("public")}
        >
          Public
        </button>
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
