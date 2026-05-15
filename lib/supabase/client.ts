import { createBrowserClient } from "@supabase/ssr";

// クライアントコンポーネントから利用する Supabase クライアント。
// 匿名認証 + ニックネームの設計なので、anon key でアクセスする。
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
