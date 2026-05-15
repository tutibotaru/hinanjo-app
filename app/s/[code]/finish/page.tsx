"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useStepProgress } from "@/lib/hooks/useStepProgress";
import { useParticipants } from "@/lib/hooks/useParticipants";
import stepsData from "@/data/steps.json";

type Session = {
  id: string;
  name: string;
  qr_code: string;
  phase: number;
  created_at: string;
};
type Role = {
  id: string;
  name: string;
  short_name: string;
  description: string;
  color: string;
  mission?: string;
};
type Trouble = { label: string; action: string };
type Step = {
  id: string;
  role: string;
  phase: number;
  order: number;
  title: string;
  duration_minutes: number;
  instructions: string[];
  completion_condition: string;
  troubles: Trouble[];
  depends_on: string[];
};
type StoredParticipant = { id: string; nickname: string };

function formatElapsed(ms: number): string {
  if (ms <= 0) return "0分";
  const totalMin = Math.floor(ms / 60_000);
  if (totalMin < 60) return `${totalMin}分`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h}時間` : `${h}時間${m}分`;
}

export default function FinishPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const [ctx, setCtx] = useState<{ session: Session; code: string } | null>(
    null,
  );

  useEffect(() => {
    async function load() {
      const code = params.code.toUpperCase();
      const raw = localStorage.getItem(`hinanjo:participant:${code}`);
      if (!raw) {
        router.replace(`/s/${code}/nickname`);
        return;
      }
      try {
        const parsed = JSON.parse(raw) as StoredParticipant;
        if (!parsed.id) throw new Error();
      } catch {
        router.replace(`/s/${code}/nickname`);
        return;
      }

      const supabase = createClient();
      const { data: session } = await supabase
        .from("sessions")
        .select("id, name, qr_code, phase, created_at")
        .eq("qr_code", code)
        .maybeSingle();
      if (!session) {
        router.replace("/");
        return;
      }
      setCtx({ session: session as Session, code });
    }
    load();
  }, [params.code, router]);

  if (!ctx) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-8 sm:px-8">
        <p className="mx-auto max-w-md text-sm text-slate-500">読み込み中…</p>
      </main>
    );
  }
  return <FinishView session={ctx.session} code={ctx.code} />;
}

function FinishView({ session, code }: { session: Session; code: string }) {
  const { progress } = useStepProgress(session.id);
  const { participants } = useParticipants(session.id);

  const roles = stepsData.roles as Role[];
  const allSteps = stepsData.steps as Step[];

  const participantById = useMemo(() => {
    const m = new Map<string, string>();
    participants.forEach((p) => m.set(p.id, p.nickname));
    return m;
  }, [participants]);

  const stepById = useMemo(() => {
    const m = new Map<string, Step>();
    allSteps.forEach((s) => m.set(s.id, s));
    return m;
  }, [allSteps]);

  const doneCount = progress.filter((p) => p.status === "done").length;
  const skippedCount = progress.filter((p) => p.status === "skipped").length;
  const stuckCount = progress.filter((p) => p.status === "stuck").length;
  const stepsInPhase = allSteps.filter((s) => s.phase <= session.phase);
  const totalSteps = stepsInPhase.length;

  // 経過時間: 最初の参加者の joined_at から現在まで(参加者ゼロなら 0)
  const firstJoinedAt = participants[0]?.joined_at;
  const elapsedMs = firstJoinedAt
    ? Date.now() - new Date(firstJoinedAt).getTime()
    : 0;

  const stuckItems = useMemo(
    () =>
      progress
        .filter((p) => p.status === "stuck")
        .map((p) => ({
          step: stepById.get(p.step_id),
          troubleLabel: p.trouble_label,
          nickname: p.participant_id
            ? (participantById.get(p.participant_id) ?? null)
            : null,
          at: p.completed_at,
        })),
    [progress, stepById, participantById],
  );

  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      <div className="mx-auto max-w-md">
        <header className="border-b border-slate-200 bg-white px-5 py-4 text-center">
          <p className="text-xs font-semibold tracking-widest text-emerald-700">
            訓練の振り返り
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            お疲れさまでした
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {session.name} (コード {code}) / 経過 {formatElapsed(elapsedMs)}
          </p>
        </header>

        <section className="grid grid-cols-2 gap-3 px-5 py-5">
          <StatCard label="完了" value={doneCount} unit="件" color="emerald" />
          <StatCard label="スキップ" value={skippedCount} unit="件" color="slate" />
          <StatCard
            label="困った"
            value={stuckCount}
            unit="件"
            color="amber"
            hint={stuckCount > 0 ? "改善ポイント" : undefined}
          />
          <StatCard
            label="参加者"
            value={participants.length}
            unit="人"
            color="blue"
          />
        </section>

        <section className="px-5">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">
            役割別の達成
          </h2>
          <div className="space-y-2">
            {roles.map((role) => {
              const roleSteps = stepsInPhase.filter((s) => s.role === role.id);
              const roleDone = roleSteps.filter((s) => {
                const p = progress.find((pp) => pp.step_id === s.id);
                return p?.status === "done" || p?.status === "skipped";
              }).length;
              const roleStuck = roleSteps.filter((s) => {
                const p = progress.find((pp) => pp.step_id === s.id);
                return p?.status === "stuck";
              }).length;
              const rolePeople = participants.filter(
                (p) => p.role === role.id,
              ).length;
              return (
                <div
                  key={role.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
                >
                  <span
                    aria-hidden
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: role.color }}
                  />
                  <p className="flex-1 text-sm font-bold text-slate-900">
                    {role.name}
                  </p>
                  <p className="text-xs text-slate-600">
                    {roleSteps.length
                      ? `${roleDone}/${roleSteps.length}`
                      : "—"}
                  </p>
                  <p className="text-xs text-slate-500">{rolePeople}人</p>
                  {roleStuck > 0 && (
                    <p className="text-xs text-amber-700">⚠{roleStuck}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {stuckItems.length > 0 && (
          <section className="mt-6 px-5">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">
              困った箇所(改善のヒント)
            </h2>
            <ul className="space-y-2">
              {stuckItems.map((item, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-amber-200 bg-amber-50 p-3"
                >
                  <p className="text-sm font-semibold text-amber-900">
                    {item.step?.title ?? item.troubleLabel ?? "—"}
                  </p>
                  {item.troubleLabel && (
                    <p className="mt-1 text-xs text-amber-700">
                      理由: {item.troubleLabel}
                    </p>
                  )}
                  {item.nickname && (
                    <p className="mt-0.5 text-xs text-amber-600">
                      報告: {item.nickname} さん
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-6 px-5">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">
            進捗サマリー
          </h2>
          <p className="text-xs text-slate-600">
            フェーズ {session.phase} までの全 {totalSteps} ステップのうち、
            {doneCount} 件完了 / {skippedCount} 件スキップ / {stuckCount} 件困った。
            着手率{" "}
            {totalSteps
              ? Math.round(
                  ((doneCount + skippedCount + stuckCount) / totalSteps) * 100,
                )
              : 0}
            %。
          </p>
        </section>

        <div className="mt-8 flex flex-col gap-2 px-5">
          <Link
            href={`/s/${code}/board`}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            全体ボードに戻る
          </Link>
          <Link
            href="/"
            className="rounded-lg bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-200"
          >
            トップに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  unit,
  color,
  hint,
}: {
  label: string;
  value: number;
  unit: string;
  color: "emerald" | "slate" | "amber" | "blue";
  hint?: string;
}) {
  const styles: Record<typeof color, string> = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    slate: "border-slate-200 bg-white text-slate-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    blue: "border-sky-200 bg-sky-50 text-sky-900",
  };
  return (
    <div className={`rounded-lg border p-3 ${styles[color]}`}>
      <p className="text-xs font-semibold opacity-70">{label}</p>
      <p className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-xs">{unit}</span>
      </p>
      {hint && <p className="mt-0.5 text-[10px] opacity-60">{hint}</p>}
    </div>
  );
}
