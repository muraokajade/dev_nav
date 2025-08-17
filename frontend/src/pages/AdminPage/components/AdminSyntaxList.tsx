import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { SyntaxModel } from "../../../models/SyntaxModel";
import { useAuth } from "../../../context/useAuthContext";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import dayjs from "dayjs";
import { usePagination } from "../../../hooks/usePagination";
import { Pagination } from "../../../utils/Pagination";
import { Link } from "react-router-dom";

export const AdminSyntaxList = () => {
  const [syntaxes, setSyntaxes] = useState<SyntaxModel[]>([]);
  const [syntax, setSyntax] = useState<SyntaxModel | null>(null);
  const { loading, currentUser, idToken } = useAuth();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { totalPages, pageIndex, displayPage, setTotalPages,setDisplayPage } = usePagination();
  const categories = [
    "Spring",
    "React",
    "Vue",
    "Firebase",
    "Tailwind",
    "Other",
  ];

  const fetchAllSyntax = useCallback(async () => {
    try {
      const res = await axios.get(
        `/api/admin/syntaxes?page=${pageIndex}&size=10`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      setSyntaxes(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (e) {
      alert("記事取得失敗");
    }
  }, [pageIndex, idToken, setTotalPages]);

  useEffect(() => {
    (async () => {
      await fetchAllSyntax();
    })();
  });

  const togglePublish = async (slug: string) => {
    if (loading) return;
    try {
      await axios.put(`/api/admin/syntaxes/${slug}/toggle`, null, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      // 再取得
      // const res = await axios.get(
      //   `/api/admin/syntaxes?page=${pageIndex}&size=10`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${idToken}`,
      //     },
      //   }
      // );
      // setSyntaxes(res.data.content);
      // setTotalPages(res.data.totalPages)
      await fetchAllSyntax();
    } catch (e) {
      console.error("公開状態切替失敗", e);
    }
  };

  // useEffect(() => {
  //   const fetchAllSyntaxes = async () => {
  //     if (loading) return;
  //     try {
  //       const res = await axios.get("/api/admin/syntaxes", {
  //         headers: {
  //           Authorization: `Bearer ${idToken}`,
  //         },
  //       });
  //       console.log("取得した記事一覧:", res.data);
  //       setSyntaxes(res.data);
  //     } catch (e) {
  //       console.error("記事取得失敗", e);
  //     }
  //   };
  //   fetchAllSyntaxes();
  // }, [loading, currentUser, idToken]);

  const handleEdit = async (id: number) => {
    if (loading) return;
    try {
      const res = await axios.get(`/api/admin/syntaxes/${id}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      const syntax = res.data;
      setSyntax(syntax);

      // 編集対象の記事情報をステートにセット
      setSlug(syntax.slug);
      setTitle(syntax.title);
      setSummary(syntax.summary);
      setContent(syntax.content);
      setCategory(syntax.category);

      setIsEditModalOpen(true);
    } catch (err) {
      console.error("❌ 取得失敗", err);
      alert("投稿に失敗しました");
    }
  };

  const handleUpdate = async (id: number) => {
    if (loading) return;
    try {
      await axios.put(
        `/api/admin/syntaxes/${id}`,
        { slug, title, category, summary, content },

        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      // const refreshed = await axios.get("/api/admin/syntaxes", {
      //   headers: {
      //     Authorization: `Bearer ${idToken}`,
      //   },
      // });

      // setSyntaxes(refreshed.data);
      await fetchAllSyntax();
      setIsEditModalOpen(false);
    } catch (e) {
      console.error("データ更新失敗");
    }
  };

  const handleDelete = async (id: number) => {
    if (loading) return;
    if (!window.confirm("本当に削除しますか？")) return;
    try {
      await axios.delete(`/api/admin/syntaxes/${id}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      console.log("削除成功");
      // const res = await axios.get("/api/admin/syntaxes", {
      //   headers: {
      //     Authorization: `Bearer ${idToken}`,
      //   },
      // });
      // console.log("取得した記事一覧:", res.data);
      // setSyntaxes(res.data);
      await fetchAllSyntax();
    } catch (e) {
      console.error("削除失敗", e);
    }
  };


  const paginate = (pageNumber: number) => setDisplayPage(pageNumber);
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-8 max-w-5xl mx-auto">
        <h2 className="text-2xl text-white font-bold mb-4 border-b pb-2">
          📚 投稿済み文法
        </h2>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-900 text-white p-6 rounded-lg w-full max-w-2xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">🛠️ 記事の編集</h3>

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
                className="w-full text-black border p-2"
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
              <label>summary</label>
              <textarea
                className="w-full  text-black px-3 py-2 rounded mb-4"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="記事の要約を入力（または自動生成）"
                rows={6}
              />
              <label>content</label>
              <textarea
                className="w-full  text-black px-3 py-2 rounded mb-4"
                placeholder="本文"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
                >
                  キャンセル
                </button>
                {syntax && (
                  <button
                    onClick={() => handleUpdate(syntax.id)}
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
          {syntaxes.map((syntax) => (
            <div
              key={syntax.slug}
              className="flex flex-col sm:flex-row items-start bg-gray-800 text-white rounded-lg px-4 py-3 shadow-sm hover:shadow-md overflow-hidden"
            >
              {/* 左側：基本情報 */}
              <div className="sm:w-[240px] w-full shrink-0 sm:pr-4 text-sm space-y-1 mb-4 sm:mb-0">
                
                <Link
                  to={`/syntaxes/${syntax.id}-${syntax.slug}`}
                  className="text-3xl hover:underline text-blue-200 break-words whitespace-normal"
                >
                  {syntax.title}
                </Link>

                <p className="text-gray-400 break-words">Slug: {syntax.slug}</p>
                <p className="text-gray-400">カテゴリー: {syntax.category}</p>
                <p className="text-gray-500 text-xs">
                  投稿日: {dayjs(syntax.createdAt).format("YYYY/MM/DD HH:mm")}
                </p>
              </div>

              {/* 中央：縦線（スマホでは非表示） */}
              <div className="hidden sm:block border-l border-gray-600 h-full mx-4" />

              {/* 中央右：要約表示（Markdown対応） */}
              <div className="prose prose-invert max-w-none text-sm text-gray-200 break-words flex-grow mb-4 sm:mb-0 sm:pr-4 overflow-x-auto">
                <ReactMarkdown
                  children={syntax.summary}
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

              {/* 右端：編集・削除ボタン */}
              <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 items-start sm:items-end w-full sm:w-auto">
                <button
                  onClick={() => togglePublish(syntax.slug)}
                  className={`px-3 py-1 rounded text-sm font-semibold border w-full sm:w-auto ${
                    syntax.published
                      ? "bg-green-600 text-white border-green-700 hover:bg-green-500"
                      : "bg-yellow-500 text-black border-yellow-600 hover:bg-yellow-400"
                  }`}
                >
                  {syntax.published ? "公開中" : "非公開"}
                </button>

                <button
                  onClick={() => handleEdit(syntax.id)}
                  className="px-3 py-1 rounded text-sm font-semibold bg-blue-600 text-white border border-blue-700 hover:bg-blue-500 w-full sm:w-auto"
                >
                  編集
                </button>

                <button
                  onClick={() => handleDelete(syntax.id)}
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
