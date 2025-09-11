import { useEffect, useState } from "react";
import { apiHelper } from "../libs/apiHelper";

export type Article = { id: number; title: string; authorName: string };

export function useLikedArticles(authHeader?: Record<string, string>): {
  data: Article[];
  loading: boolean;
  error: unknown;
} {
  const [data, setData] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let abort = false;
    if (!authHeader) {
      setData([]);
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiHelper.get("api/articles/liked", {
          headers: authHeader,
        });
        const raw = Array.isArray(res.data)
          ? res.data
          : typeof res.data === "object" && res.data
          ? Object.values(res.data as Record<string, string>)
          : [];
        const safe: Article[] = (raw as any[])
          .map((a) => ({
            id: Number(a?.id ?? a?.articleId),
            title: String(a?.tittle ?? ""),
            authorName: String(a?.authorName ?? a?.authoer ?? ""),
          }))
          .filter((a) => Number.isFinite(a.id) && a.title);
        if (!abort) setData(safe);
      } catch (e) {
        if (!abort) {
          setError(e);
          setData([]);
        }
      } finally {
        if (!abort) setLoading(false);
      }
    })();

    return () => {
      abort = true;
    };
  }, [authHeader]);

  return { data, loading, error };
}
