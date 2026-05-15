// このプロジェクトの DB スキーマと対応する型定義。
// migrations/001_initial_schema.sql と必ず同期させること。
// 将来は `supabase gen types typescript` での自動生成に置き換える。

export type Phase = 0 | 1 | 2;
export type Mode = "training" | "production";
export type RoleId = "general-affairs" | "facility" | "information";
export type StepStatus = "done" | "skipped" | "stuck";
export type PostType = "trouble" | "finding";

export type Session = {
  id: string;
  name: string;
  qr_code: string;
  phase: Phase;
  mode: Mode;
  created_at: string;
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
