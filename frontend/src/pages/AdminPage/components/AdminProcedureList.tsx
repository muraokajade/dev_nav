import { useCallback, useEffect, useMemo, useState } from "react";
// - import { ArticleModel } from "../../../models/ArticleModel"; // 未使用
import { useAuth } from "../../../context/useAuthContext";
import dayjs from "dayjs";
import { usePagination } from "../../../hooks/usePagination";
import { Procedure } from "../../../models/Procedure";
import { Pagination } from "../../../utils/Pagination";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Link } from "react-router-dom";
import { apiHelper } from "../../../libs/apiHelper";

export const AdminProcedureList = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [procedure, setProcedure] = useState<Procedure | null>(null);

  const { loading, idToken } = useAuth(); // - currentUser未使用のため削除
  const authHeader = useMemo(
    () => (idToken ? { Authorization: `Bearer ${idToken}` } : undefined),
    [idToken]
  ); // - 認証ヘッダ共通化

  // 編集フォーム
  const [stepNumber, setStepNumber] = useState("");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [summary, setSummary] = useState(""); // - 使っているので維持
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [fetching, setFetching] = useState(false); // - 取得中表示
  const [error, setError] = useState<string | null>(null); // - エラー表示

  const { pageIndex, setTotalPages, displayPage, setDisplayPage, totalPages } =
    usePagination();

  const categories = [
    "Spring",
    "React",
    "Vue",
    "Firebase",
    "Tailwind",
    "Other",
  ];
  // - const pageSize = 10; // 未使用のため削除

  const fetchProcedure = useCallback(async () => {
    setFetching(true); // - 追加: ローディング制御
    setError(null);
    try {
      const res = await apiHelper.get(
        // - パス統一の観点では /api/admin/procedures が望ましい。現在のサーバ実装に合わせてこのまま使用。
        `/api/admin/procedure?page=${pageIndex}&size=10`,
        { headers: authHeader }
      );
      setProcedures(res.data.content ?? []);
      setTotalPages(res.data.totalPages ?? 0);
    } catch (e: any) {
      console.error(e);
      setProcedures([]);
      setTotalPages(0);
      setError(e?.response?.data?.message || "一覧の取得に失敗しました。");
    } finally {
      setFetching(false);
    }
  }, [pageIndex, authHeader, setTotalPages]);

  useEffect(() => {
    if (!loading) fetchProcedure();
  }, [loading, fetchProcedure]);

  const togglePublish = async (id: number) => {
    if (loading) return;
    try {
      await apiHelper.put(`/api/admin/procedure/toggle/${id}`, null, {
        headers: authHeader,
      });
      await fetchProcedure();
    } catch (e) {
      console.error("公開状態切替失敗", e);
      setError("公開状態の切り替えに失敗しました。");
    }
  };

  const handleEdit = async (id: number) => {
    if (loading) return;
    try {
      const res = await apiHelper.get(`/api/admin/procedure/${id}`, {
        headers: authHeader,
      });
      setProcedure(res.data);
      // 編集対象の記事情報をステートにセット
      setStepNumber(res.data.stepNumber ?? "");
      setSlug(res.data.slug ?? "");
      setTitle(res.data.title ?? "");
      setSummary(res.data.summary ?? ""); // - ここでフォームに反映
      setContent(res.data.content ?? "");
      setCategory(res.data.category ?? "");
      setIsEditModalOpen(true);
    } catch (err) {
      console.error("❌ 取得失敗", err);
      setError("記事詳細の取得に失敗しました。");
      alert("投稿に失敗しました");
    }
  };

  const handleUpdate = async (id: number) => {
    if (loading) return;

    // - サーバ側バリデーション前に最低限のチェック
    if (!stepNumber || !slug || !title || !category || !content) {
      alert(
        "必須項目（stepNumber, slug, title, category, content）が未入力です。"
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("stepNumber", stepNumber);
      formData.append("slug", slug);
      formData.append("title", title);
      formData.append("category", category);
      // - ★重要: summary を送っていなかったため追加
      formData.append("summary", summary || "");
      formData.append("content", content);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await apiHelper.put(`/api/admin/procedure/${id}`, formData, {
        headers: authHeader,
      });
      await fetchProcedure();
      setIsEditModalOpen(false);
    } catch (e) {
      console.error("データ更新失敗", e);
      setError("更新に失敗しました。");
    }
  };

  const handleDelete = async (id: number) => {
    if (loading) return;
    if (!window.confirm("本当に削除しますか？")) return;
    try {
      await apiHelper.delete(`/api/admin/procedure/${id}`, {
        headers: authHeader,
      });
      await fetchProcedure();
    } catch (e) {
      console.error("削除失敗", e);
      setError("削除に失敗しました。");
    }
  };

  const paginate = (pageNumber: number) => setDisplayPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-8 max-w-5xl mx-auto">
        <h2 className="text-2xl text-white font-bold mb-4 border-b pb-2">
          📚 投稿済み手順
        </h2>

        {/* - ローディング／エラー */}
        {error && (
          <div className="mb-4 rounded bg-red-900/30 text-red-200 px-3 py-2">
            {error}
          </div>
        )}
        {fetching && <div className="text-zinc-300 mb-4">読み込み中...</div>}

        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-gray-900 text-white p-6 rounded-lg w-full max-w-2xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">🛠️ 手順の編集</h3>

              <label>stepNumber</label>
              <input
                className="w-full text-black border px-3 py-2 rounded mb-2"
                value={stepNumber}
                onChange={(e) => setStepNumber(e.target.value)}
                placeholder="ステップ番号（例: 5-09）"
              />
              <label>slug</label>
              <input
                className="w-full text-black border px-3 py-2 rounded mb-2"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="スラッグ（URL識別子）"
              />
              <label>title</label>
              <input
                className="w-full text-black px-3 py-2 rounded mb-2"
                placeholder="タイトル"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <label>category</label>
              <select
                className="w-full text-black border p-2 mb-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">カテゴリを選択</option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* - 追加: summaryの入力欄（送信も追加済み） */}
              <label>summary</label>
              <textarea
                className="w-full text-black px-3 py-2 rounded mb-4"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="要約（省略可）"
                rows={4}
              />

              <label>content</label>
              <textarea
                className="w-full text-black px-3 py-2 rounded mb-4"
                placeholder="本文"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />

              <input
                type="file"
                accept="image/*"
                className="w-full"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setImageFile(e.target.files[0]);
                  }
                }}
              />

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
                >
                  キャンセル
                </button>
                {procedure && (
                  <button
                    onClick={() => handleUpdate(procedure.id)}
                    className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-400"
                  >
                    更新する
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {procedures.map((procedure) => (
            <div
              key={procedure.id} // - slugよりidの方が安定（念のため変更）
              className="flex flex-col sm:flex-row bg-gray-800 text-white rounded-lg px-4 py-3 shadow-sm hover:shadow-md overflow-hidden"
            >
              {/* 左側：基本情報 */}
              <div className="sm:w-[240px] w-full shrink-0 sm:pr-4 text-sm space-y-1 mb-4 sm:mb-0">
                <p className="text-gray-400">
                  StepNumber: {procedure.stepNumber}
                </p>
                <Link
                  to={`/procedures/${procedure.id}-${procedure.slug}`}
                  className="text-3xl hover:underline text-blue-200"
                >
                  {procedure.title}
                </Link>
                <p className="text-gray-400 break-words">
                  Slug: {procedure.slug}
                </p>
                <p className="text-gray-400">
                  カテゴリー: {procedure.category}
                </p>
                <p className="text-gray-500 text-xs">
                  投稿日:{" "}
                  {dayjs(procedure.createdAt).format("YYYY/MM/DD HH:mm")}
                </p>
              </div>

              {/* 中央：縦線（PCのみ） */}
              <div className="hidden sm:block border-l border-gray-600 h-full mx-4" />

              {/* 中央右：手順要約（Markdown） */}
              <div className="prose prose-invert max-w-none text-sm text-gray-200 break-words flex-grow mb-4 sm:mb-0 sm:pr-4 overflow-x-auto">
                <ReactMarkdown
                  // - summaryがあればそれを優先。なければcontent冒頭を抜粋。
                  children={(
                    procedure.summary ||
                    procedure.content ||
                    ""
                  ).slice(0, 300)}
                  components={{
                    code({ className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || "");
                      const codeString = Array.isArray(children)
                        ? children.join("")
                        : String(children);
                      return match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          className="not-prose"
                          {...props}
                        >
                          {codeString.replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    pre: ({ children }) => <>{children}</>,
                  }}
                />
              </div>

              {/* 右端：操作ボタン */}
              <div className="flex flex-row sm:flex-col gap-2 items-start sm:items-end w-full sm:w-auto">
                <button
                  onClick={() => togglePublish(procedure.id)}
                  className={`px-3 py-1 rounded text-sm font-semibold border w-full sm:w-auto ${
                    procedure.published
                      ? "bg-green-600 text-white border-green-700 hover:bg-green-500"
                      : "bg-yellow-500 text-black border-yellow-600 hover:bg-yellow-400"
                  }`}
                >
                  {procedure.published ? "公開中" : "非公開"}
                </button>

                <button
                  onClick={() => handleEdit(procedure.id)}
                  className="px-3 py-1 rounded text-sm font-semibold bg-blue-600 text-white border border-blue-700 hover:bg-blue-500 w-full sm:w-auto"
                >
                  編集
                </button>

                <button
                  onClick={() => handleDelete(procedure.id)}
                  className="px-3 py-1 rounded text-sm font-semibold bg-red-600 text-white border border-red-700 hover:bg-red-500 w-full sm:w-auto"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>

        <Pagination
          displayPage={displayPage}
          totalPages={totalPages}
          maxPageLinks={5}
          paginate={paginate}
        />
      </div>
    </div>
  );
};
