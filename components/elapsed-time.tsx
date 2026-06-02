"use client";

import { useEffect, useState } from "react";

// 「発災から ◯分◯秒」を表示するコンポーネント。
//
// WHY: 訓練に時間的な緊張感を与えるため、画面上部に常時表示する。
// session.simulated_start_at が NULL なら「未開始」表示で何もカウントしない。
//
// WHY 1秒ごとに setInterval: 経過時間は秒単位で更新される。
// 1分以上経過した後は分単位だけで十分なので、更新頻度を下げる選択肢もあるが
// 切替の複雑さ < 1秒1回の負荷なので素直に1秒固定。
//
// WHY props で渡す: sessions テーブルから取得する責任は親側に集約する。
// このコンポーネントは表示専用にして、Realtime 購読は親が行う。
export default function ElapsedTime({
  startedAt,
  compact = false,
}: {
  startedAt: string | null;
  compact?: boolean;
}) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  if (!startedAt) {
    return (
      <div
        aria-label="訓練タイマーは未開始です"
        className={
          compact
            ? "inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500"
            : "inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500"
        }
      >
        <span aria-hidden>⏱</span>
        <span>タイマー未開始</span>
      </div>
    );
  }

  const elapsedMs = Math.max(0, now - new Date(startedAt).getTime());
  const totalSec = Math.floor(elapsedMs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const label =
    h > 0
      ? `${h}時間${m.toString().padStart(2, "0")}分`
      : m >= 1
        ? `${m}分${s.toString().padStart(2, "0")}秒`
        : `${s}秒`;

  // 経過時間で配色を変える(訓練の緊張感)
  // - 0〜15分: 青(初動)・緑(順調)
  // - 15〜60分: アンバー(応急期に入った)
  // - 60分超: 赤(長期化注意)
  const tone =
    totalSec < 15 * 60
      ? "bg-emerald-100 text-emerald-800"
      : totalSec < 60 * 60
        ? "bg-amber-100 text-amber-800"
        : "bg-rose-100 text-rose-800";

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={`発災から ${label} 経過`}
      className={
        compact
          ? `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone}`
          : `inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${tone}`
      }
    >
      <span aria-hidden>⏱</span>
      <span>発災から {label}</span>
    </div>
  );
}
