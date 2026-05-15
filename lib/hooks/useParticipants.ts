"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Participant } from "@/lib/types/database";

// セッションの参加者一覧を購読する。
// 参加・離脱・役割変更がリアルタイムに反映される。
export function useParticipants(sessionId: string | null) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setParticipants([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    let cancelled = false;

    setLoading(true);
    setError(null);

    supabase
      .from("participants")
      .select("*")
      .eq("session_id", sessionId)
      .order("joined_at", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(error.message);
        else setParticipants((data ?? []) as Participant[]);
        setLoading(false);
      });

    const channel = supabase
      .channel(`participants-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "participants",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (cancelled) return;
          setParticipants((current) => {
            if (payload.eventType === "INSERT") {
              return [...current, payload.new as Participant];
            }
            if (payload.eventType === "UPDATE") {
              const next = payload.new as Participant;
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

  return { participants, loading, error };
}
