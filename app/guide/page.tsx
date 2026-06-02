import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "訓練主催者向けガイド | 避難所サポート",
  description:
    "避難所運営訓練を 30 分・60 分・120 分の3つのシナリオで実施できる進行台本と準備チェックリスト。",
  robots: { index: true, follow: true },
};

const UPDATED = "2026年5月25日";

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <Link href="/" className="text-xs text-emerald-700 underline">
            ← トップに戻る
          </Link>
          <p className="mt-3 text-xs font-semibold tracking-widest text-emerald-700">
            訓練主催者向けガイド
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            この避難所サポートで防災訓練をする
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            自治会・PTA・地域の自主防災組織で実施できる
            3 つの訓練シナリオです。
            アプリの全機能(タイマー・災害イベント・進捗ボード)を活用して、
            本物に近い緊張感のある訓練ができます。
          </p>
          <p className="mt-2 text-xs text-slate-400">最終更新: {UPDATED}</p>
        </header>

        {/* 共通の準備チェックリスト */}
        <section className="mb-10 rounded-lg border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="text-lg font-bold text-emerald-900">
            ✅ 共通の準備チェックリスト
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-emerald-900">
            <li className="flex gap-2">
              <span aria-hidden>□</span>
              <span>
                <strong>スマホ/タブレット</strong>:1 人 1 台が理想(2-3 人で 1 台でも体験可)
              </span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden>□</span>
              <span>
                <strong>Wi-Fi または 4G/5G 通信</strong>:現状はネット必須(オフライン非対応)
              </span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden>□</span>
              <span>
                <strong>本部役 1 名</strong>:主催者が務める。タイマー操作・イベント発火を担当
              </span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden>□</span>
              <span>
                <strong>参加者 5 人以上</strong>(7 班体制を回すには最低 5-7 人)
              </span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden>□</span>
              <span>
                <strong>振り返り用</strong>:ホワイトボード or 模造紙・付箋・筆記用具
              </span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden>□</span>
              <span>
                <strong>QR コード</strong>:本部役が事前に「新しい避難所を開設」→ 印刷 or 画面表示
              </span>
            </li>
          </ul>
        </section>

        {/* シナリオ1: 30分パイロット */}
        <section className="mb-10 rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              🚶 30 分パイロット
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
              初体験・体験会向け
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            参加者 5-10 人 ・ フェーズ 0→1 まで ・ 災害イベント 1-2 回。
            アプリを触ってもらい「こんなに細かく班分け・手順があるんだ」と
            気づきを持ち帰ってもらう体験会。
          </p>
          <ol className="mt-4 space-y-3 text-sm text-slate-700">
            <li className="rounded border-l-4 border-slate-300 bg-slate-50 px-3 py-2">
              <strong>0:00-0:05 開会 ・ アプリの使い方を 5 分で説明</strong>
              <br />
              主催者が QR を見せ、参加者は各自スマホで読み取り。
              ニックネーム入力 → 役割推薦 5 問 → 各班に分散。
            </li>
            <li className="rounded border-l-4 border-emerald-400 bg-emerald-50 px-3 py-2">
              <strong>0:05 訓練タイマー開始</strong>(本部役が
              <code className="mx-1 rounded bg-white px-1">/manage</code>
              から「▶ 訓練タイマーを開始」)
              <br />
              全員の画面に「⏱ 発災から ◯秒」が表示される。
            </li>
            <li className="rounded border-l-4 border-slate-300 bg-slate-50 px-3 py-2">
              <strong>0:05-0:15 phase 0(初動)</strong>
              <br />
              各班がそれぞれ 3-5 ステップを実施。建物点検・受付立ち上げ・本部第一報など。
            </li>
            <li className="rounded border-l-4 border-amber-400 bg-amber-50 px-3 py-2">
              <strong>0:15 災害イベント発火:🌍 余震</strong>(本部役)
              <br />
              施設班に建物再点検が降りてくる。共有タイムラインに赤バッジで通知。
            </li>
            <li className="rounded border-l-4 border-slate-300 bg-slate-50 px-3 py-2">
              <strong>0:15-0:25 phase 1(開設初期)</strong>(本部役が「次のフェーズ →」)
              <br />
              受付運用・要配慮者引き継ぎ・本部報告などへ。
            </li>
            <li className="rounded border-l-4 border-emerald-400 bg-emerald-50 px-3 py-2">
              <strong>0:25-0:30 振り返り</strong>
              <br />
              主催者が「⏱ タイマー停止」・各班の代表が「困った」と「発見」を
              ホワイトボードに 1 つずつ書き出して共有。
            </li>
          </ol>
        </section>

        {/* シナリオ2: 60分標準 */}
        <section className="mb-10 rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              🏃 60 分標準訓練
            </h2>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
              地域訓練・PTA 向け
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            参加者 10-25 人 ・ フェーズ 0→2 まで ・ 災害イベント 3-5 回。
            開設から応急運営まで「最初の 2 時間」を 1 時間に圧縮した訓練。
          </p>
          <ol className="mt-4 space-y-3 text-sm text-slate-700">
            <li className="rounded border-l-4 border-slate-300 bg-slate-50 px-3 py-2">
              <strong>0:00-0:10 開会 ・ 説明 ・ 役割分担確認</strong>
            </li>
            <li className="rounded border-l-4 border-emerald-400 bg-emerald-50 px-3 py-2">
              <strong>0:10 訓練タイマー開始 ・ phase 0(初動)</strong>
              <br />
              建物点検・受付・第一報・備蓄倉庫確認など同時並行。
            </li>
            <li className="rounded border-l-4 border-amber-400 bg-amber-50 px-3 py-2">
              <strong>0:20 イベント:🚑 けが人</strong>
              <br />
              救護衛生班に対応が振られる。要配慮者支援班とも連携。
            </li>
            <li className="rounded border-l-4 border-slate-300 bg-slate-50 px-3 py-2">
              <strong>0:25 phase 1(開設初期)へ移行</strong>
            </li>
            <li className="rounded border-l-4 border-amber-400 bg-amber-50 px-3 py-2">
              <strong>0:35 イベント:📦 物資到着</strong>
              <br />
              食料物資班が荷下ろし・在庫表更新。配布動線も整える。
            </li>
            <li className="rounded border-l-4 border-slate-300 bg-slate-50 px-3 py-2">
              <strong>0:40 phase 2(応急運営)へ移行</strong>
            </li>
            <li className="rounded border-l-4 border-amber-400 bg-amber-50 px-3 py-2">
              <strong>0:45 イベント:💧 断水 ・ 0:50 イベント:📺 メディア来訪</strong>
              <br />
              短時間で複合事態を投げ込んで現場の対応力を試す。
            </li>
            <li className="rounded border-l-4 border-emerald-400 bg-emerald-50 px-3 py-2">
              <strong>0:55-1:00 振り返り ・ タイマー停止</strong>
              <br />
              振り返り画面(/finish)で完了率と「困った」を全員で確認。
            </li>
          </ol>
        </section>

        {/* シナリオ3: 120分本格 */}
        <section className="mb-10 rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              🏘 120 分本格訓練
            </h2>
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800">
              自治体・自主防災組織向け
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            参加者 25-50 人 ・ フェーズ 0→3 まで全部 ・ 災害イベント 6-8 回。
            安定運営(1 日〜)までを 2 時間に圧縮。長期化対応・撤収準備まで体験。
          </p>
          <ol className="mt-4 space-y-3 text-sm text-slate-700">
            <li className="rounded border-l-4 border-slate-300 bg-slate-50 px-3 py-2">
              <strong>0:00-0:15 開会 ・ 各班リーダー紹介 ・ 役割確認</strong>
            </li>
            <li className="rounded border-l-4 border-emerald-400 bg-emerald-50 px-3 py-2">
              <strong>0:15 タイマー開始 ・ phase 0(初動)</strong>
            </li>
            <li className="rounded border-l-4 border-amber-400 bg-amber-50 px-3 py-2">
              <strong>0:25 イベント:🌍 余震 ・ 0:30 ⚡ 停電</strong>
              <br />
              施設班に再点検・明かり確保が連続で降る。
            </li>
            <li className="rounded border-l-4 border-slate-300 bg-slate-50 px-3 py-2">
              <strong>0:35 phase 1(開設初期)</strong>
            </li>
            <li className="rounded border-l-4 border-amber-400 bg-amber-50 px-3 py-2">
              <strong>0:45 イベント:🚨 感染症疑い ・ 0:50 👨‍👩‍👧 新規避難 30 人</strong>
            </li>
            <li className="rounded border-l-4 border-slate-300 bg-slate-50 px-3 py-2">
              <strong>0:55 phase 2(応急運営)</strong>
            </li>
            <li className="rounded border-l-4 border-amber-400 bg-amber-50 px-3 py-2">
              <strong>1:10 イベント:📺 メディア来訪 ・ 1:20 💧 断水</strong>
            </li>
            <li className="rounded border-l-4 border-slate-300 bg-slate-50 px-3 py-2">
              <strong>1:30 phase 3(安定運営)</strong>
              <br />
              24h シフト・ボランティア受入・福祉避難所マッチング等の長期視点。
            </li>
            <li className="rounded border-l-4 border-amber-400 bg-amber-50 px-3 py-2">
              <strong>1:40 イベント:🌙 夜間移行 ・ 1:50 📞 本部連絡</strong>
            </li>
            <li className="rounded border-l-4 border-emerald-400 bg-emerald-50 px-3 py-2">
              <strong>1:55-2:00 タイマー停止 ・ 振り返り</strong>
              <br />
              振り返り画面で全班の進捗・困った箇所を一覧化。
              次回訓練までの改善点をホワイトボードに 3 つまで絞り出す。
            </li>
          </ol>
        </section>

        {/* よくある質問 */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-slate-900">❓ よくある質問</h2>
          <dl className="mt-4 space-y-4 text-sm text-slate-700">
            <div>
              <dt className="font-bold text-slate-900">
                Q. 全員のスマホがいるんですか?
              </dt>
              <dd className="mt-1 leading-relaxed">
                A. 1 人 1 台が理想ですが、2-3 人で 1 台を回しても体験できます。
                その場合、操作する人とそうでない人で交替してください。
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-900">
                Q. ネット環境が無い場所では使えますか?
              </dt>
              <dd className="mt-1 leading-relaxed">
                A. 現状はネット必須です(Supabase で進捗をリアルタイム同期しているため)。
                オフライン対応は将来の改良予定です。
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-900">
                Q. 参加者のデータはどこに保存されますか?
              </dt>
              <dd className="mt-1 leading-relaxed">
                A. ニックネームと進捗のみが Supabase に保存されます(実名・住所は要求していません)。
                参加コードを知る人なら閲覧可能なので、訓練終了後に
                <Link href="/policy" className="text-emerald-700 underline">
                  プライバシーポリシー
                </Link>
                をご確認の上、削除依頼を出してください。
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-900">
                Q. 役割が偏ったり、班に人がいなかったらどうしますか?
              </dt>
              <dd className="mt-1 leading-relaxed">
                A. 1 人で 2 班を兼任しても OK です。役割は後から
                「⋯メニュー → 役割変更」で何度でも変えられます。
                訓練主催者が事前に班を割り振る方法もあります。
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-900">
                Q. 災害イベントはどのタイミングで発火するといいですか?
              </dt>
              <dd className="mt-1 leading-relaxed">
                A. 各班が前のステップを終え始めた頃合いがベストです。
                早すぎると混乱を増幅し、遅すぎると間延びします。
                30 分パイロットなら 1-2 回、60 分標準なら 3-5 回、120 分本格なら 6-8 回が目安です。
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-900">
                Q. 実際の災害で使えますか?
              </dt>
              <dd className="mt-1 leading-relaxed">
                A. 訓練用ベータ版なので、実災害時の本番運用には対応していません。
                実災害時は地域の防災計画・自治体マニュアル・現場の専門家判断を最優先してください。
              </dd>
            </div>
          </dl>
        </section>

        {/* 主催者向けの一言 */}
        <section className="mb-10 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-base font-bold text-amber-900">
            🎙 訓練主催者へ:大事な一言
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-amber-900">
            <li>
              ・「正解を覚えてもらう」訓練ではなく
              「<strong>動けないことに気づいてもらう</strong>」訓練です。
              できなかったことは責めず、次に向けた改善点として書き出してもらってください。
            </li>
            <li>
              ・<strong>「困った」「スキップ」も大事な記録</strong>です。
              振り返り画面で集計され、自治体の防災計画見直しの素材になります。
            </li>
            <li>
              ・<strong>子どもや高齢者も参加</strong>できる難易度です。
              本物の災害では誰もが参加することになるので、平時から幅広い世代で訓練することに意味があります。
            </li>
          </ul>
        </section>

        {/* 行動導線 */}
        <section className="mt-10 grid gap-3 sm:grid-cols-2">
          <Link
            href="/admin/new"
            className="flex flex-col rounded-lg border-2 border-emerald-500 bg-emerald-50 p-4 text-emerald-900 hover:bg-emerald-100"
          >
            <span className="text-sm font-bold">➕ 新しい避難所を開設</span>
            <span className="mt-1 text-xs">
              訓練を主催する人はこちらから
            </span>
          </Link>
          <Link
            href="/?code=DEMO01"
            className="flex flex-col rounded-lg border-2 border-slate-300 bg-white p-4 text-slate-900 hover:bg-slate-50"
          >
            <span className="text-sm font-bold">🎯 DEMO01 で試す</span>
            <span className="mt-1 text-xs">
              先に画面の動きを確認したい人はこちら
            </span>
          </Link>
        </section>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-xs text-slate-500">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/" className="text-emerald-700 underline">
              ← トップに戻る
            </Link>
            <Link href="/policy" className="text-emerald-700 underline">
              利用規約・プライバシー・免責
            </Link>
            <a
              href="https://github.com/tutibotaru/hinanjo-app/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 underline"
            >
              要望・不具合報告(Issues)
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
