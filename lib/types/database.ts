// このプロジェクトの DB スキーマと対応する型定義。
// migrations/001 + 004 + 006 + 007 + 009 と同期させること。
// 将来は `supabase gen types typescript` での自動生成に置き換える。

export type Phase = 0 | 1 | 2 | 3;
export type Mode = "training" | "production";
// migration 006 で 7値に拡張済
export type RoleId =
  | "general-affairs"
  | "facility"
  | "information"
  | "medical-hygiene"
  | "supplies"
  | "vulnerable-support"
  | "leader";
export type StepStatus = "done" | "skipped" | "stuck";
// migration 009 で 'event'(災害イベント注入)を追加
export type PostType = "trouble" | "finding" | "event";

export type Session = {
  id: string;
  name: string;
  qr_code: string;
  phase: Phase;
  mode: Mode;
  created_at: string;
  // migration 009: 訓練タイマーの発災開始時刻。null は未開始。
  simulated_start_at: string | null;
};

export type Participant = {
  id: string;
  session_id: string;
  nickname: string;
  role: RoleId | null;
  joined_at: string;
};

export type StepProgress = {
  id: string;
  session_id: string;
  step_id: string;
  participant_id: string | null;
  status: StepStatus;
  trouble_label: string | null;
  // 困った を押した累計回数。done で上書きしても残す(学習ループ用)。
  // migration 004 適用前の DB からは返らないので optional 扱い。
  stuck_count?: number;
  completed_at: string;
};

export type SharedPost = {
  id: string;
  session_id: string;
  participant_id: string | null;
  content: string;
  photo_url: string | null;
  type: PostType;
  created_at: string;
};
