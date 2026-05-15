"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useStepProgress } from "@/lib/hooks/useStepProgress";
import { useParticipants } from "@/lib/hooks/useParticipants";
import BottomNav from "@/components/bottom-nav";
import stepsData from "@/data/steps.json";

type Session = {
  id: string;
  name: string;
  qr_code: string;
  phase: number;
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

export default function BoardPage() {
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
        .select("id, name, qr_code, phase")
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

  return <BoardView session={ctx.session} code={ctx.code} />;
}

function BoardView({ session, code }: { session: Session; code: string }) {
  const { byStepId } = useStepProgress(session.id);
  const { participants } = useParticipants(session.id);

  const roles = stepsData.roles as Role[];
  const allSteps = stepsData.steps as Step[];

  const participantById = useMemo(() => {
    const m = new Map<string, string>();
    participants.forEach((p) => m.set(p.id, p.nickname));
    return m;
  }, [participants]);

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="mx-auto max-w-md">
        <header className="border-b border-slate-200 bg-white px-5 py-3">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-widest text-emerald-700">
                全体ボード
              </p>
              <h1 className="mt-1 text-lg font-bold text-slate-900">
                {session.name}
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                コード {code} / フェーズ {session.phase}
              </p>
            </div>
            <Link
              href={`/s/${code}/finish`}
              className="flex-shrink-0 text-xs text-emerald-700 underline"
            >
              振り返り
            </Link>
          </div>
        </header>

        <div className="space-y-4 px-5 py-5">
          {roles.map((role) => {
            const roleSteps = allSteps
              .filter((s) => s.role === role.id && s.phase <= session.phase)
              .sort((a, b) => a.order - b.order);
            const rolePeople = participants.filter((p) => p.role === role.id);
            const completedCount = roleSteps.filter((s) => {
              const p = byStepId.get(s.id);
              return p && (p.status === "done" || p.status === "skipped");
            }).length;
            const total = roleSteps.length;
            const stuckCount = roleSteps.filter((s) => {
              const p = byStepId.get(s.id);
              return p?.status === "stuck";
            }).length;

            return (
              <section
                key={role.id}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white"
              >
                <header className="border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: role.color }}
                    />
                    <p className="flex-1 text-base font-bold text-slate-900">
                      {role.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      仲間 {rolePeople.length}人
                    </p>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-baseline justify-between text-xs text-slate-600">
                      <span>
                        {total
                          ? `${completedCount} / ${total} 完了`
                          : "ステップなし"}
                      </span>
                      {stuckCount > 0 && (
                        <span className="text-amber-700">
                          ⚠ 困った {stuckCount}件
                        </span>
                      )}
                    </div>
                    {total > 0 && (
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{
                            width: `${(completedCount / total) * 100}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </header>

                {total === 0 ? (
                  <p className="px-4 py-3 text-xs text-slate-400">
                    ステップ準備中
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {roleSteps.map((step) => {
                      const p = byStepId.get(step.id);
                      const nickname = p?.participant_id
                        ? (participantById.get(p.participant_id) ?? null)
                        : null;
                      return (
                        <li
                          key={step.id}
                          className="flex items-start gap-3 px-4 py-3"
                        >
                          <StatusIcon status={p?.status ?? null} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">
                              {step.title}
                            </p>
                            {p?.status === "done" && nickname && (
                              <p className="mt-0.5 text-xs text-slate-500">
                                {nickname} さんが完了
                              </p>
                            )}
                            {p?.status === "skipped" && nickname && (
                              <p className="mt-0.5 text-xs text-slate-500">
                                {nickname} さんがスキップ
                              </p>
                            )}
                            {p?.status === "stuck" && (
                              <p className="mt-0.5 text-xs text-amber-700">
                                ⚠ {p.trouble_label}
                                {nickname ? ` (${nickname} さん)` : ""}
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </div>

      <BottomNav code={code} sessionId={session.id} />
    </main>
  );
}

function StatusIcon({ status }: { status: string | null }) {
  if (status === "done") {
    return (
      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
        ✓
      </span>
    );
  }
  if (status === "skipped") {
    return (
      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-300 text-xs text-slate-700">
        ⊘
      </span>
    );
  }
  if (status === "stuck") {
    return (
      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-white">
        !
      </span>
    );
  }
  return (
    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-slate-300 text-xs" />
  );
}
