"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import stepsData from "@/data/steps.json";

type StoredParticipant = { id: string; nickname: string };
type AnswerValue = 0 | 1 | 2;
type Answers = {
  q1?: AnswerValue;
  q2?: AnswerValue;
  q3?: AnswerValue;
  q4?: AnswerValue;
  q5?: AnswerValue;
};
type QuestionKey = "q1" | "q2" | "q3" | "q4" | "q5";
type Question = {
  key: QuestionKey;
  text: string;
  options: ReadonlyArray<{ label: string; value: AnswerValue }>;
};

// 7班に対応するため Q4(子育て・高齢者支援) と Q5(整理・数を扱う) を追加。
const questions: ReadonlyArray<Question> = [
  {
    key: "q1",
    text: "体を動かす作業はできますか?",
    options: [
      { label: "できる", value: 2 },
      { label: "少しなら", value: 1 },
      { label: "難しい", value: 0 },
    ],
  },
  {
    key: "q2",
    text: "医療や福祉の経験はありますか?",
    options: [
      { label: "ある", value: 2 },
      { label: "少しある", value: 1 },
      { label: "ない", value: 0 },
    ],
  },
  {
    key: "q3",
    text: "人前で話すのは得意ですか?",
    options: [
      { label: "得意", value: 2 },
      { label: "普通", value: 1 },
      { label: "苦手", value: 0 },
    ],
  },
  {
    key: "q4",
    text: "子育てや高齢者の支援の経験はありますか?",
    options: [
      { label: "ある", value: 2 },
      { label: "少しある", value: 1 },
      { label: "ない", value: 0 },
    ],
  },
  {
    key: "q5",
    text: "物の整理や数を扱う作業は得意ですか?",
    options: [
      { label: "得意", value: 2 },
      { label: "普通", value: 1 },
      { label: "苦手", value: 0 },
    ],
  },
];

// 訓練結果でチューニング想定の単純重み付け。Q が空(スキップ)時は 0 として扱う。
// 7班(総務/施設/情報/救護衛生/食料物資/要配慮者支援/本部)それぞれに
// 「向いている人の特徴」を反映。
function computeScores(answers: Answers): Record<string, number> {
  const q1 = answers.q1 ?? 0;
  const q2 = answers.q2 ?? 0;
  const q3 = answers.q3 ?? 0;
  const q4 = answers.q4 ?? 0;
  const q5 = answers.q5 ?? 0;
  return {
    "general-affairs": q1 + q3 * 2,
    facility: q1 * 2 + q5,
    information: q3 * 2 + q2,
    "medical-hygiene": q2 * 3 + q1,
    supplies: q1 * 2 + q5 * 2,
    "vulnerable-support": q4 * 2 + q2 * 2,
    leader: q3 * 2 + q1 + q2,
  };
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
  // step: 0..questions.length-1 が質問、questions.length が選択画面。
  // 7班・5問への拡張で literal-union が煩雑になるため number で管理。
  const [step, setStep] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyHasRole, setAlreadyHasRole] = useState(false);

  useEffect(() => {
    const code = params.code.toUpperCase();
    const raw = localStorage.getItem(`hinanjo:participant:${code}`);
    if (!raw) {
      router.replace(`/s/${code}/nickname`);
      return;
    }
    let parsed: StoredParticipant;
    try {
      parsed = JSON.parse(raw) as StoredParticipant;
      if (!parsed.id) throw new Error();
    } catch {
      router.replace(`/s/${code}/nickname`);
      return;
    }
    setStored(parsed);

    const supabase = createClient();
    supabase
      .from("participants")
      .select("role")
      .eq("id", parsed.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.role) setAlreadyHasRole(true);
      });
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
  const chooseStep = questions.length;

  function handleAnswer(value: AnswerValue) {
    if (step >= questions.length) return;
    const key = questions[step].key;
    setAnswers((a) => ({ ...a, [key]: value }));
    setStep((s) => Math.min(s + 1, chooseStep));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
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
    <div className="mb-8 flex items-center justify-center gap-1.5">
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
    const q = questions[step];
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-md">
          <Progress />
          <p className="mb-2 text-center text-xs font-semibold tracking-widest text-emerald-700">
            質問 {step + 1} / {questions.length}
          </p>
          <h1 className="mb-8 text-center text-2xl font-bold leading-snug text-slate-900">
            {q.text}
          </h1>
          {step === 0 && alreadyHasRole && (
            <div className="mb-6 text-center">
              <button
                type="button"
                onClick={() => setStep(chooseStep)}
                className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                質問をスキップして役割だけ選ぶ →
              </button>
            </div>
          )}
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
  const skipped =
    answers.q1 === undefined &&
    answers.q2 === undefined &&
    answers.q3 === undefined &&
    answers.q4 === undefined &&
    answers.q5 === undefined;
  const scores = computeScores(answers);
  const roles = stepsData.roles as Role[];
  const sortedRoles = [...roles].sort(
    (a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0),
  );
  const topId = skipped ? null : sortedRoles[0].id;

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-md">
        <Progress />
        <header className="mb-6 text-center">
          <p className="text-xs font-semibold tracking-widest text-emerald-700">
            役割をえらぶ
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {skipped
              ? `${stored.nickname} さんの役割`
              : `${stored.nickname} さんへのおすすめ`}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            気が変わったら後から変更できます。
            <br />
            この避難所運営は本来7班で動きます。あなたが担当する1班を選んでください。
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
            onClick={() => setStep(questions.length - 1)}
            className="text-sm text-slate-500 underline"
          >
            ← 質問をやり直す
          </button>
        </div>
      </div>
    </main>
  );
}
