"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("参加コードを入力してください");
      return;
    }

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { data, error: dbError } = await supabase
      .from("sessions")
      .select("qr_code")
      .eq("qr_code", trimmed)
      .maybeSingle();

    if (dbError) {
      setSubmitting(false);
      setError("通信エラーが発生しました。もう一度お試しください。");
      return;
    }
    if (!data) {
      setSubmitting(false);
      setError("そのコードの避難所が見つかりません");
      return;
    }

    router.push(`/s/${trimmed}/nickname`);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-md">
        <header className="mb-10">
          <p className="text-xs font-semibold tracking-widest text-emerald-700">
            避難所サポート
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">参加する</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            QRコードまたは参加コードで、避難所運営チームに加わります。
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-semibold text-slate-700"
            >
              参加コード
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="例: TEST01"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              autoFocus
              maxLength={20}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-lg uppercase tracking-widest text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{ minHeight: 52 }}
            className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 active:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {submitting ? "確認中…" : "参加する"}
          </button>
        </form>

        <div className="mt-10 border-t border-slate-200 pt-6">
          <button
            type="button"
            disabled
            className="text-sm text-slate-400"
            title="次のフェーズで実装"
          >
            QRコードを読み取る(準備中)
          </button>
        </div>
      </div>
    </main>
  );
}
