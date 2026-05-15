"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// I/0/O/L/1 など紛らわしい文字を除外
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(length = 6): string {
  return Array.from(
    { length },
    () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)],
  ).join("");
}

export default function AdminNewPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState(generateCode());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedName) {
      setError("避難所名を入力してください");
      return;
    }
    if (!/^[A-Z0-9]{4,12}$/.test(trimmedCode)) {
      setError("参加コードは英数字 4〜12 文字で入力してください");
      return;
    }

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase
      .from("sessions")
      .insert({ name: trimmedName, qr_code: trimmedCode });

    if (insertError) {
      setSubmitting(false);
      if (insertError.code === "23505") {
        setError(
          "そのコードは既に使われています。別のコードを生成してください。",
        );
        setCode(generateCode());
      } else {
        setError("作成に失敗しました。もう一度お試しください。");
      }
      return;
    }

    router.push(`/admin/qr?code=${trimmedCode}`);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-md">
        <header className="mb-8">
          <p className="text-xs font-semibold tracking-widest text-emerald-700">
            管理者
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            新しい避難所を開設
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            避難所名と参加コードを設定すると、QR コードが発行されます。
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-slate-700"
            >
              避難所名
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: ○○小学校体育館"
              maxLength={40}
              autoFocus
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div>
            <label
              htmlFor="code"
              className="block text-sm font-semibold text-slate-700"
            >
              参加コード
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={12}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-lg uppercase tracking-widest text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <button
                type="button"
                onClick={() => setCode(generateCode())}
                className="rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                再生成
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              紛らわしい文字 (0/O/1/I/L) は除外しています。
            </p>
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
            className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-base font-bold text-white transition-colors hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50"
          >
            {submitting ? "作成中…" : "開設して QR を発行"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-slate-500 underline">
            ← トップに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
