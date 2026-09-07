-- ============================================================================
-- 008 anon ポリシー撤去(007 段階B の仕上げ)
-- ============================================================================
-- 目的:
--   007 で authenticated 用ポリシーを追加し、AuthGate + ensureAnonAuth で
--   全画面が authenticated ロールで動く実装が本番稼働している(DEMO01 に
--   実参加実績あり)。ここで anon 用ポリシーを撤去し、Supabase advisor の
--   「RLS Policy Always True」警告を解消する。
--
-- 前提(すべて満たしていること):
--   ✓ 007 適用済(authenticated ポリシー14件が動いている)
--   ✓ アプリに AuthGate + ensureAnonAuth 実装済(commit e642d11)
--   ✓ 参加→ニックネーム→役割→ステップ→取消→投稿→運営 の全機能を
--     authenticated ロールで動作確認済(本番の DEMO01 に累計3人参加実績)
--   ✓ 匿名サインインが Supabase Authentication で有効化済
--
-- 影響:
--   - 未認証(anon)からの API 直叩きは全テーブルで拒否される
--   - AuthGate が確実に匿名 JWT を確立してから子を描画するので、通常の
--     ブラウザ利用は影響なし
--   - サインイン失敗した端末はデータ読み書きができなくなる(保険描画された
--     UI 上で「保存に失敗」エラーが出る)。移行期間の allowance を切る形。
--
-- 冪等性: DROP IF EXISTS なので再実行しても安全。
-- ============================================================================


DROP POLICY IF EXISTS "anon read sessions"        ON public.sessions;
DROP POLICY IF EXISTS "anon insert sessions"      ON public.sessions;
DROP POLICY IF EXISTS "anon update sessions"      ON public.sessions;

DROP POLICY IF EXISTS "anon read participants"    ON public.participants;
DROP POLICY IF EXISTS "anon insert participants"  ON public.participants;
DROP POLICY IF EXISTS "anon update participants"  ON public.participants;

DROP POLICY IF EXISTS "anon all on step_progress" ON public.step_progress;
DROP POLICY IF EXISTS "anon all on shared_posts"  ON public.shared_posts;
