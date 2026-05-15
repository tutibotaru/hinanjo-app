"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import stepsData from "@/data/steps.json";

type StoredParticipant = { id: string; nickname: string };
type AnswerValue = 0 | 1 | 2;
type Answers = { q1?: AnswerValue; q2?: AnswerValue; q3?: AnswerValue };

const questions = [
  {
    key: "q1" as const,
    text: "体を動かす作業はできますか?",
    options: [
      { label: "できる", value: 2 as AnswerValue },
      { label: "少しなら", value: 1 as AnswerValue },
      { label: "難しい", value: 0 as AnswerValue },
    ],
  },
  {
    key: "q2" as const,
    text: "医療や福祉の経験はありますか?",
    options: [
      { label: "ある", value: 2 as AnswerValue },
      { label: "少しある", value: 1 as AnswerValue },
      { label: "ない", value: 0 as AnswerValue },
    ],
  },
  {
    key: "q3" as const,
    text: "人前で話すのは得意ですか?",
    options: [
      { label: "得意", value: 2 as AnswerValue },
      { label: "普通", value: 1 as AnswerValue },
      { label: "苦手", value: 0 as AnswerValue },
    ],
  },
] as const;

// 訓練結果を見てチューニングする想定の単純重み付け。
function computeScores(answers: Required<Answers>) {
  return {
    "general-affairs": answers.q1 + answers.q3 * 2,
    facility: answers.q1 * 2 + answers.q2,
    information: answers.q2 + answers.q3 * 2,
  } as Record<string, number>;
}

type Role = {
  id: string;
  name: string;
  description: string;
  color: string;
  mission?: string;
};

export default function RolePage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const [stored, setStored] = useState<StoredParticipant | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = params.code.toUpperCase();
    const raw = localStorage.getItem(`hinanjo:participant:${code}`);
    if (!raw) {
      router.replace(`/s/${code}/nickname`);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as StoredParticipant;
      if (!parsed.id) throw new Error();
      setStored(parsed);
    } catch {
      router.replace(`/s/${code}/nickname`);
    }
  }, [params.code, router]);

  if (!stored) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-8 sm:px-8">
        <p className="mx-auto max-w-md text-sm text-slate-500">読み込み中…</p>
      </main>
    );
  }

  const code = params.code.toUpperCase();
  const totalSteps = questions.length + 1;

  function handleAnswer(value: AnswerValue) {
    if (step >= questions.length) return;
    const key = questions[step as 0 | 1 | 2].key;
    setAnswers((a) => ({ ...a, [key]: value }));
    setStep((s) => Math.min(s + 1, 3) as 0 | 1 | 2 | 3);
  }

  function handleBack() {
    if (step === 0) return;
    setStep((s) => Math.max(s - 1, 0) as 0 | 1 | 2 | 3);
  }

  async function selectRole(roleId: string) {
    if (!stored) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("participants")
      .update({ role: roleId })
      .eq("id", stored.id);
    if (updateError) {
      setSaving(false);
      setError("通信エラーが発生しました。もう一度お試しください。");
      return;
    }
    router.push(`/s/${code}/mission`);
  }

  const Progress = () => (
    <div className="mb-8 flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className={`h-2 w-2 rounded-full ${
            i <= step ? "bg-emerald-500" : "bg-slate-300"
          }`}
        />
      ))}
    </div>
  );

  // 質問ステップ
  if (step < questions.length) {
    const q = questions[step as 0 | 1 | 2];
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-md">
          <Progress />
          <p className="mb-2 text-center text-xs font-semibold tracking-widest text-emerald-700">
            質問 {step + 1} / {questions.length}
          </p>
          <h1 className="mb-8 text-center text-2xl font-bold text-slate-900">
            {q.text}
          </h1>
          <div className="space-y-3">
            {q.options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleAnswer(opt.value)}
                style={{ minHeight: 56 }}
                className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900 transition-colors hover:border-emerald-500 hover:bg-emerald-50 active:bg-emerald-100"
              >
                {opt.label}
              </button>
            ))}
          </div>
          {step > 0 && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={handleBack}
                className="text-sm text-slate-500 underline"
              >
                ← 前の質問に戻る
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  // 推薦 + 選択ステップ
  const scores = computeScores(answers as Required<Answers>);
  const roles = stepsData.roles as Role[];
  const sortedRoles = [...roles].sort(
    (a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0),
  );
  const topId = sortedRoles[0].id;

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-md">
        <Progress />
        <header className="mb-6 text-center">
          <p className="text-xs font-semibold tracking-widest text-emerald-700">
            役割をえらぶ
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {stored.nickname} さんへのおすすめ
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            気が変わったら後から変更できます。
          </p>
        </header>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {error}
          </p>
        )}

        <ul className="space-y-3">
          {sortedRoles.map((role) => {
            const isRecommended = role.id === topId;
            return (
              <li key={role.id}>
                <button
                  type="button"
                  onClick={() => selectRole(role.id)}
                  disabled={saving}
                  style={{ minHeight: 80 }}
                  className={`flex w-full items-center gap-4 rounded-lg border-2 bg-white p-4 text-left transition-colors hover:bg-emerald-50 active:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isRecommended ? "border-emerald-500" : "border-slate-200"
                  }`}
                >
                  <span
                    aria-hidden
                    className="h-4 w-4 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: role.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-slate-900">
                        {role.name}
                      </p>
                      {isRecommended && (
                        <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                          おすすめ
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      {role.description}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setStep(questions.length - 1 as 2)}
            className="text-sm text-slate-500 underline"
          >
            ← 質問をやり直す
          </button>
        </div>
      </div>
    </main>
  );
}
