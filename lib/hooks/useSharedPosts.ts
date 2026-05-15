"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SharedPost } from "@/lib/types/database";

// 共有タイムラインを購読する。新着が配列の先頭に来る順。
export function useSharedPosts(sessionId: string | null) {
  const [posts, setPosts] = useState<SharedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    let cancelled = false;

    setLoading(true);
    setError(null);

    supabase
      .from("shared_posts")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(error.message);
        else setPosts((data ?? []) as SharedPost[]);
        setLoading(false);
      });

    const channel = supabase
      .channel(`shared-posts-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shared_posts",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (cancelled) return;
          setPosts((current) => {
            if (payload.eventType === "INSERT") {
              return [payload.new as SharedPost, ...current];
            }
            if (payload.eventType === "UPDATE") {
              const next = payload.new as SharedPost;
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

  return { posts, loading, error };
}
