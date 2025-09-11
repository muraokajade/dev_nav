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
        const res = await apiHelper.get("/api/articles/liked", {
          headers: authHeader,
        });
        console.log(res.data);
        const arr = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.content)
          ? res.data.content
          : [];

        const safe: Article[] = arr
          .map((a: any) => ({
            id: Number(a?.id ?? a?.articleId),
            title: String(a?.title ?? a?.articleTitle ?? ""), // ← tittle→title
            authorName: String(
              a?.authorName ?? a?.author ?? a?.displayName ?? ""
            ),
          }))
          .filter((a: any) => Number.isFinite(a.id) && a.title);

        // デバッグ：キー確認
        console.log("sample keys:", arr[0] && Object.keys(arr[0]));

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
