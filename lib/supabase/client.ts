import { createBrowserClient } from "@supabase/ssr";

// クライアントコンポーネントから利用する Supabase クライアント。
// 匿名認証 + ニックネームの設計なので anon key でアクセスする。
//
// WHY シングルトン: フックやページ遷移ごとに createClient() が呼ばれると
// GoTrueClient が多重生成され、警告 + Realtime チャネルが無駄に増えて
// 無料枠の同時接続上限を圧迫する。ブラウザ内では1インスタンスを使い回す。
//
// WHY make() 経由: 型は実呼び出しから推論させる。`ReturnType<typeof
// createBrowserClient>` を直接使うとジェネリック既定で型が緩くなり、
// クエリ結果が any になるため。
function make() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

let browserClient: ReturnType<typeof make> | undefined;

export function createClient() {
  return (browserClient ??= make());
}
