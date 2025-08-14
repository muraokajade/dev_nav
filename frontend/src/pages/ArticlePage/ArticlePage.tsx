// ArticlesPage.tsx（色・UI改良版）
import { useState } from "react";
import { Link } from "react-router-dom";

type Article = { id:string; title:string; category:string; level:"初級"|"中級"|"上級"; createdAt:string; };
const mock: Article[] = [/* APIつなぐまでダミー */];

export const ArticlesPage = () => {
  const [q,setQ]=useState(""); 
  const [cat,setCat]=useState("all"); 
  const [lvl,setLvl]=useState("all"); 
  const [sort,setSort]=useState<"new"|"popular">("new");

  const filtered = mock
    .filter(a=> 
      (cat==="all"||a.category===cat) && 
      (lvl==="all"||a.level===lvl) && 
      a.title.toLowerCase().includes(q.toLowerCase())
    )
    .sort((a,b)=> sort==="new" ? (b.createdAt.localeCompare(a.createdAt)) : 0);

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-white">記事を探す</h1>

      {/* コントロール */}
      <div className="flex flex-wrap gap-3 mb-8">
        <input 
          value={q} 
          onChange={e=>setQ(e.target.value)} 
          placeholder="キーワード検索" 
          className="px-4 py-2 rounded-xl bg-gray-800/80 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <select value={cat} onChange={e=>setCat(e.target.value)} 
          className="px-3 py-2 rounded-xl bg-gray-800/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="all">カテゴリ</option><option>React</option><option>Spring</option><option>設計</option>
        </select>
        <select value={lvl} onChange={e=>setLvl(e.target.value)} 
          className="px-3 py-2 rounded-xl bg-gray-800/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="all">難易度</option><option value="初級">初級</option><option value="中級">中級</option><option value="上級">上級</option>
        </select>
        <select value={sort} onChange={e=>setSort(e.target.value as any)} 
          className="px-3 py-2 rounded-xl bg-gray-800/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="new">新着順</option><option value="popular">人気順</option>
        </select>
      </div>

      {/* リスト */}
      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map(a=>(
          <Link 
            key={a.id} 
            to={`/articles/${a.id}`} 
            className="p-5 rounded-2xl bg-gray-800/70 border border-gray-700 hover:bg-gray-700/80 transition"
          >
            <div className="text-xs text-sky-400 mb-1">{a.category}・{a.level}</div>
            <div className="font-semibold text-white">{a.title}</div>
            <div className="text-xs text-gray-500 mt-1">{new Date(a.createdAt).toLocaleDateString()}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
