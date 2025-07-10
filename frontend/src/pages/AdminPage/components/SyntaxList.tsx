import { useEffect, useState } from "react";
import axios from "axios";
import { ArticleModel } from "../../../models/ArticleModel";
import { useAuth } from "../../../context/useAuthContext";
import dayjs from "dayjs";

export const SyntaxList = () => {
    const [articles, setArticles] = useState<ArticleModel[]>([]);
    const [article, setArticle] = useState<ArticleModel | null>(null);
    const { loading, currentUser, idToken } = useAuth();
    const [slug, setSlug] = useState("");
    const [title, setTitle] = useState("");
    const [sectionTitle, setSectionTitle] = useState("");
    const [content, setContent] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
    const togglePublish = async (slug: string) => {
      if (loading) return;
      try {
        await axios.put(`/api/admin/articles/${slug}/toggle`, null, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        // 再取得
        const updated = await axios.get("/api/admin/articles", {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        setArticles(updated.data);
      } catch (e) {
        console.error("公開状態切替失敗", e);
      }
    };
  
    useEffect(() => {
      const fetchArticles = async () => {
        if (loading) return;
        try {
          const res = await axios.get("/api/admin/articles", {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });
          console.log("取得した記事一覧:", res.data);
          setArticles(res.data);
        } catch (e) {
          console.error("記事取得失敗", e);
        }
      };
      fetchArticles();
    }, [loading, currentUser, idToken]);
  
    const handleEdit = async (id: number) => {
      if (loading) return;
      try {
        const res = await axios.get(`/api/admin/article/${id}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        const article = res.data;
        setArticle(article);
  
        // 編集対象の記事情報をステートにセット
        setSlug(article.slug);
        setTitle(article.title);
        setContent(article.content);
        setSectionTitle(article.sectionTitle);
  
        setIsEditModalOpen(true);
      } catch (err) {
        console.error("❌ 取得失敗", err);
        alert("投稿に失敗しました");
      }
    };
  
    const handleUpdate = async (id: number) => {
      if (loading) return;
      try {
        const formData = new FormData();
        formData.append("slug", slug);
        formData.append("title", title);
        formData.append("sectionTitle", sectionTitle);
        formData.append("content", content);
        if (imageFile) {
          formData.append("image", imageFile);
        }
  
        const res = await axios.put(`/api/admin/article/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        const refreshed = await axios.get("/api/admin/articles", {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
  
        setArticles(refreshed.data);
        setIsEditModalOpen(false);
      } catch (e) {
        console.error("データ更新失敗");
      }
    };
  
    const handleDelete = async (id: number) => {
      if (loading) return;
      if (!window.confirm("本当に削除しますか？")) return;
      try {
        await axios.delete(`/api/admin/article/${id}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        console.log("削除成功");
        // 最新の一覧取得（refreshなどのステートを使って再取得）
        // setRefresh((prev: any) => !prev);
      } catch (e) {
        console.error("削除失敗", e);
      }
    };
  
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl text-white font-bold mb-4 border-b pb-2">
            📚 投稿済み記事
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
                <label>sectionTitle</label>
                <input
                  className="w-full  text-black px-3 py-2 rounded mb-2"
                  placeholder="セクションタイトル"
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                />
                <label>content</label>
                <textarea
                  className="w-full  text-black px-3 py-2 rounded mb-4"
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
                      console.log("📁 選択したファイル:", e.target.files[0]);
                      setImageFile(e.target.files[0]);
                    }
                  }}
                />
  
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
                  >
                    キャンセル
                  </button>
                  {article && (
                    <button
                      onClick={() => handleUpdate(article.id)}
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
            {articles.map((article) => (
              <div
                key={article.slug}
                className="flex items-start bg-gray-800 text-white rounded-lg px-4 py-3 shadow-sm hover:shadow-md"
              >
                {/* 左側：基本情報 */}
                <div className="w-1/3 pr-4 text-sm space-y-1">
                  <p className="font-semibold text-lg">{article.title}</p>
                  <p className="text-gray-400">Slug: {article.slug}</p>
                  <p className="text-gray-400">
                    セクション: {article.sectionTitle}
                  </p>
                  <p className="text-gray-500 text-xs">
                    投稿日: {dayjs(article.createdAt).format("YYYY/MM/DD HH:mm")}
                  </p>
                </div>
  
                {/* 中央：縦線 */}
                <div className="border-l border-gray-600 h-full mx-4" />
  
                {/* 中央右：コンテンツ本文（長文・折り返し） */}
                <div className="flex-1 text-sm text-gray-200 break-words pr-4">
                  {article.content}
                </div>
  
                {/* 右端：編集・削除ボタン */}
                <div className="flex flex-col space-y-2 items-end">
                  <button
                    onClick={() => togglePublish(article.slug)}
                    className={`text-sm ${
                      article.published ? "text-green-400" : "text-yellow-400"
                    } hover:underline`}
                  >
                    {article.published ? "公開中 → 非公開に" : "非公開 → 公開に"}
                  </button>
                  <button
                    onClick={() => handleEdit(article.id)}
                    className="text-blue-400 hover:text-blue-200 text-sm"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(article.id)}
                    className="text-red-400 hover:text-red-200 text-sm"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
}