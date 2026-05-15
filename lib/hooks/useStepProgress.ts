"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StepProgress } from "@/lib/types/database";

// 全ステップの進捗を購読する。マイミッション画面と全体ボードの両方で使う。
// byStepId はステップIDから現在のステータスを引くための Map。
export function useStepProgress(sessionId: string | null) {
  const [progress, setProgress] = useState<StepProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setProgress([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    let cancelled = false;

    setLoading(true);
    setError(null);

    supabase
      .from("step_progress")
      .select("*")
      .eq("session_id", sessionId)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(error.message);
        else setProgress((data ?? []) as StepProgress[]);
        setLoading(false);
      });

    const channel = supabase
      .channel(`step-progress-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "step_progress",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (cancelled) return;
          setProgress((current) => {
            if (payload.eventType === "INSERT") {
              return [...current, payload.new as StepProgress];
            }
            if (payload.eventType === "UPDATE") {
              const next = payload.new as StepProgress;
              return current.map((p) => (p.id === next.id ? next : p));
            }
            if (payload.eventType === "DELETE") {
              const removedId = (payload.old as { id: string }).id;
              return current.filter((p) => p.id !== removedId);
            }
            return current;
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const byStepId = useMemo(() => {
    const map = new Map<string, StepProgress>();
    progress.forEach((p) => map.set(p.step_id, p));
    return map;
  }, [progress]);

  return { progress, byStepId, loading, error };
}
