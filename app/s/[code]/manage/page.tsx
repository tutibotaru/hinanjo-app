"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/lib/supabase/client";

type Session = {
  id: string;
  name: string;
  qr_code: string;
  phase: number;
  mode: string;
};

const PHASE_LABELS: Record<number, string> = {
  0: "初動(発災〜15分)",
  1: "開設初期(15分〜1時間)",
  2: "応急運営(1〜2時間)",
};

export default function ManagePage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [origin, setOrigin] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetArmed, setResetArmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const code = params.code.toUpperCase();

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    supabase
      .from("sessions")
      .select("id, name, qr_code, phase, mode")
      .eq("qr_code", code)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (!data) {
          router.replace("/");
          return;
        }
        setSession(data as Session);
      });
    return () => {
      cancelled = true;
    };
  }, [code, router]);

  async function refresh() {
    const supabase = createClient();
    const { data } = await supabase
      .from("sessions")
      .select("id, name, qr_code, phase, mode")
      .eq("qr_code", code)
      .maybeSingle();
    if (data) setSession(data as Session);
  }

  async function changePhase(delta: number) {
    if (!session) return;
    const next = Math.max(0, Math.min(2, session.phase + delta));
    if (next === session.phase) return;
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("sessions")
      .update({ phase: next })
      .eq("id", session.id);
    setBusy(false);
    if (error) {
      setMsg("フェーズの更新に失敗しました。");
      return;
    }
    await refresh();
    setMsg(`フェーズを ${next} に変更しました。`);
  }

  async function toggleMode() {
    if (!session) return;
    const next = session.mode === "training" ? "production" : "training";
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("sessions")
      .update({ mode: next })
      .eq("id", session.id);
    setBusy(false);
    if (error) {
      setMsg("モードの切り替えに失敗しました。");
      return;
    }
    await refresh();
    setMsg(next === "training" ? "訓練モードにしました。" : "本番モードにしました。");
  }

  async function resetProgress() {
    if (!session) return;
    if (!resetArmed) {
      setResetArmed(true);
      return;
    }
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const r1 = await supabase
      .from("step_progress")
      .delete()
      .eq("session_id", session.id);
    const r2 = await supabase
      .from("shared_posts")
      .delete()
      .eq("session_id", session.id);
    const r3 = await supabase
      .from("sessions")
      .update({ phase: 0 })
      .eq("id", session.id);
    setBusy(false);
    setResetArmed(false);
    if (r1.error || r2.error || r3.error) {
      setMsg("リセットに一部失敗しました。もう一度お試しください。");
      return;
    }
    await refresh();
    setMsg("進捗・タイムラインを消去し、フェーズを0に戻しました。");
  }

  async function copyLink() {
    const link = `${origin}/?code=${code}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMsg("コピーに失敗しました。URL を手動で選択してください。");
    }
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-8 sm:px-8">
        <p className="mx-auto max-w-md text-sm text-slate-500">読み込み中…</p>
      </main>
    );
  }

  const joinUrl = origin ? `${origin}/?code=${code}` : "";

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-md">
        <header className="border-b border-slate-200 bg-white px-5 py-3">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-widest text-emerald-700">
                運営パネル
              </p>
              <h1 className="mt-1 text-lg font-bold text-slate-900">
                {session.name}
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                コード {code} / フェーズ {session.phase} /{" "}
                {session.mode === "training" ? "訓練" : "本番"}
              </p>
            </div>
            <Link
              href={`/s/${code}/board`}
              className="flex-shrink-0 text-xs text-emerald-700 underline"
            >
              ボードへ
            </Link>
          </div>
        </header>

        <div className="space-y-5 px-5 py-5">
          {msg && (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {msg}
            </p>
          )}

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-bold text-slate-900">フェーズ進行</h2>
            <p className="mt-1 text-xs text-slate-500">
              いま: フェーズ {session.phase} — {PHASE_LABELS[session.phase]}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => changePhase(-1)}
                disabled={busy || session.phase <= 0}
                style={{ minHeight: 48 }}
                className="flex-1 rounded-lg border-2 border-slate-300 bg-white text-sm font-semibold text-slate-700 disabled:opacity-40"
              >
                ← 前のフェーズ
              </button>
              <button
                type="button"
                onClick={() => changePhase(1)}
                disabled={busy || session.phase >= 2}
                style={{ minHeight: 48 }}
                className="flex-1 rounded-lg bg-emerald-600 text-sm font-bold text-white disabled:opacity-40"
              >
                次のフェーズ →
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-bold text-slate-900">モード</h2>
            <p className="mt-1 text-xs text-slate-500">
              訓練モードでは画面上部に黄色の帯が出ます。
            </p>
            <button
              type="button"
              onClick={toggleMode}
              disabled={busy}
              style={{ minHeight: 48 }}
              className="mt-3 w-full rounded-lg border-2 border-slate-300 bg-white text-sm font-semibold text-slate-700 disabled:opacity-40"
            >
              {session.mode === "training"
                ? "本番モードに切り替える"
                : "訓練モードに切り替える"}
            </button>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-bold text-slate-900">
              参加用 QR / リンク
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              印刷せずに、この画面を見せる/リンクを送るだけでも参加できます。
            </p>
            <div className="mt-3 flex flex-col items-center">
              {joinUrl && (
                <QRCodeSVG
                  value={joinUrl}
                  size={180}
                  level="M"
                  marginSize={2}
                  style={{ display: "block" }}
                />
              )}
              <p className="mt-3 break-all text-center text-xs text-slate-500">
                {joinUrl}
              </p>
              <button
                type="button"
                onClick={copyLink}
                className="mt-3 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {copied ? "コピーしました" : "リンクをコピー"}
              </button>
              <Link
                href={`/admin/qr?code=${code}`}
                className="mt-2 text-xs text-emerald-700 underline"
              >
                印刷用ページを開く
              </Link>
            </div>
          </section>

          <section className="rounded-lg border border-rose-200 bg-rose-50 p-4">
            <h2 className="text-sm font-bold text-rose-900">
              進捗をリセット(訓練のやり直し)
            </h2>
            <p className="mt-1 text-xs text-rose-700">
              全ステップの進捗と共有タイムラインを消去し、フェーズを0に戻します。
              参加者(ニックネーム・役割)は残ります。元に戻せません。
            </p>
            <button
              type="button"
              onClick={resetProgress}
              disabled={busy}
              style={{ minHeight: 48 }}
              className={`mt-3 w-full rounded-lg text-sm font-bold text-white disabled:opacity-40 ${
                resetArmed
                  ? "bg-rose-700 hover:bg-rose-800"
                  : "bg-rose-500 hover:bg-rose-600"
              }`}
            >
              {resetArmed
                ? "本当にリセットする(もう一度タップ)"
                : "進捗をリセット"}
            </button>
            {resetArmed && (
              <button
                type="button"
                onClick={() => setResetArmed(false)}
                className="mt-2 w-full text-xs text-rose-600 underline"
              >
                やめる
              </button>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
