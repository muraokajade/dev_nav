import React from "react";
import { MiniCanvas3D } from "./MiniCanvas3D";
import { MarkdownWithPrism } from "./CodeBlock";
import { Bullets, GlassCard, MediaFrame } from "./ui";
// import  MarkdownArticle  from "./MarkdownArticle";
import { lazy, Suspense } from "react";
const MarkdownArticle = lazy(() => import("./MarkdownArticle"));
const CodeSkeleton = () => (
  <div className="h-[180px] w-full rounded-xl border border-white/10 bg-white/5 animate-pulse" />
);
export type SectionItem = {
  key: string;
  title: React.ReactNode;
  content: React.ReactNode;
  img?: string;
};

const demo1 = `
\`\`\`tsx
// 認証コンテキスト（抜粋）
import { createContext, useContext, useEffect, useState } from "react";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setCurrentUser(u);
      if (u) {
        setIdToken(await u.getIdToken());
        setIsAdmin((await u.getIdTokenResult()).claims.admin === true);
      } else {
        setIdToken(null); setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
};
\`\`\`
`;
// demo2.ts
export const demo2 = String.raw`
### Java JPQLについて（抜粋）

## 問題の背景
- Spring Boot + JPA において、フロントエンドで表示するための軽量な DTO（データ転送オブジェクト）を定義することは一般的です。
- 以下のように @Query で必要な項目だけを DTO に直接投影するケースがあります：
---
~~~java
@Query("SELECT new com.example.tech.dto.ArticleDTO(a.id, a.title, a.userEmail, a.user.displayName) FROM LikeEntity l JOIN l.article a WHERE l.user.id = :userId")
List<ArticleDTO> findLikedArticlesByUserId(Long userId);
~~~

このとき、一見正しく見えてもビルドエラーや Bean 作成エラーになることがあります。

## 発生したエラー
~~~java
org.hibernate.query.SemanticException:
Missing constructor for type 'ArticleDTO'
~~~
`;

export const sections: SectionItem[] = [
  // --- Intro
  {
    key: "intro",
    title: <>DevNav+ とは</>,
    content: (
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 md:gap-8 items-start">
        {/* 左：コピー/ピル/Stats */}
        <div className="min-w-0 space-y-4">
          <div className="flex items-center gap-3">
            <MiniCanvas3D size={40} />
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-sky-500/10 text-sky-300 border border-sky-400/20">
              日本語の統合教材
            </span>
          </div>

          <p className="text-base md:text-lg text-gray-200 leading-relaxed">
            <b className="text-sky-300">Spring Boot</b> と{" "}
            <b className="text-sky-300">React</b>で作られた技術ポータル。
            実務で通用する設計とモダンなUI/UXを体感しながら学べます。
          </p>

          <ul className="flex flex-wrap gap-2">
            {[
              "体系化された記事とコード",
              "実装→設計→デプロイまで",
              "Prism表示・コピー対応",
            ].map((t) => (
              <li
                key={t}
                className="px-3 py-1 rounded-full text-xs md:text-sm bg-white/5 border border-white/10 text-gray-300"
              >
                {t}
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-3 gap-3 text-center text-sm text-gray-300">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="text-xl font-bold text-white">100+</div>記事
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="text-xl font-bold text-white">40+</div>API手順
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="text-xl font-bold text-white">0円</div>無料で閲覧
            </div>
          </div>
        </div>

        {/* 右：コードプレビュー */}
        <div className="min-w-0">
          <MediaFrame className="text-[13px] md:text-[14px] leading-6 overflow-x-auto">
            <MarkdownWithPrism md={demo1} />
          </MediaFrame>
        </div>
      </div>
    ),
  },

  // --- Features 1
  {
    key: "features1",
    title: <>主な機能①</>,
    content: (
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 md:gap-8 items-start">
        <div className="min-w-0 space-y-4">
          <Bullets
            items={[
              "Spring Boot／React の記事・コードを体系的に横断参照",
              "検索・タグで素早く到達できる設計",
              "コードブロックはハイライト表示・行番号・コピー対応",
            ]}
          />
        </div>
        <div className="min-w-0">
          <MediaFrame className="overflow-x-auto text-white">
            <Suspense fallback={<CodeSkeleton />}>
              <MarkdownArticle md={demo2} />
            </Suspense>
          </MediaFrame>
        </div>
      </div>
    ),
  },

  // --- Features 2
  {
    key: "features2",
    title: <>主な機能②</>,
    content: (
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-6 md:gap-8 items-start">
        <div className="min-w-0">
          <Bullets
            items={[
              "いいね機能:「いいね」、「いいね取り消し」を切替",
              "記事読了機能：読了 ↔ 未読を切替",
              "レビュー機能：記事に評価を付与",
              "コメント機能：記事にコメントを投稿",
              "Q&A機能：管理者に質問を送信",
            ]}
          />
        </div>
        <div className="min-w-0">
          <GlassCard className="flex justify-center items-center">
            <img
              src="/assets/images/comment.png"
              alt="comment"
              className="w-full rounded-lg object-contain"
            />
          </GlassCard>
        </div>
      </div>
    ),
  },

  // --- Features 3
  {
    key: "features3",
    title: <>主な機能③</>,
    content: (
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-6 md:gap-8 items-start">
        <div className="min-w-0">
          <Bullets
            items={[
              "学習記録を管理",
              "ユーザーのアクション履歴を可視化",
              "カレンダー：日々の学習量を色で判定",
              "レベルバー：学習(アクション)が多いとレベルアップ",
              "いいね記事の履歴保存機能",
            ]}
          />
        </div>
        <div className="min-w-0">
          <GlassCard className="flex justify-center items-center">
            <img
              src="/assets/images/p2.png"
              alt="mypage"
              className="w-full rounded-lg object-contain"
            />
          </GlassCard>
        </div>
      </div>
    ),
  },

  // --- Features 4
  {
    key: "features4",
    title: <>主な機能④</>,
    content: (
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-6 md:gap-8 items-start">
        <div className="min-w-0">
          <Bullets
            items={[
              "管理者は記事投稿・記事一覧を操作可能",
              "自分オリジナルの教科書として編集・拡張",
            ]}
          />
        </div>
        <div className="min-w-0">
          <GlassCard className="flex justify-center items-center">
            <img
              src="/assets/images/admin.png"
              alt="admin"
              className="w-full rounded-lg object-contain"
            />
          </GlassCard>
        </div>
      </div>
    ),
  },

  // --- Environment
  {
    key: "environment",
    title: <>開発環境について</>,
    content: (
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 gap-6">
        <Bullets
          items={[
            "開発用PC：MacBook Pro（Appleシリコン）",
            "メインIDE：IntelliJ IDEA（BE）／VS Code（FE）",
            "バックエンド：Spring Boot 3.x + Java 17",
            "フロントエンド：React 18 + TypeScript",
            "インフラ：Vercel（フロント）、Koyeb（バックエンド）、Neon(DB)",
            "データベース：PostgreSQL（管理は DBeaver）",
            "API テスト：Insomnia",
            "その他：Tailwind CSS, framer-motion, JWT 認証, GitHub Actions",
          ]}
        />
        <GlassCard className="text-base md:text-lg text-gray-200 leading-relaxed">
          <p className="mb-2">
            <span className="font-bold text-blue-400">この環境の特徴：</span>
            Mac上で IntelliJ IDEA と VSCode を使い分け、Insomnia と DBeaver
            でリアルタイムに検証しながら開発。
          </p>
          <p>
            <span className="font-bold text-blue-400">
              セットアップ・開発フロー：
            </span>
            コード編集 → ローカル実行 → APIテスト（Insomnia） →
            DB確認（DBeaver） → GitHub push → CI/CD 自動デプロイ。
          </p>
        </GlassCard>
      </div>
    ),
  },

  // --- About
  {
    key: "about",
    title: <>このサイトについて</>,
    content: (
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 gap-6">
        <Bullets
          items={[
            "日本語でまとまった「Spring Boot × React」教材が少ない現状を変えるべく開発",
            "最新トレンドや現場経験を取り入れた、実践的な技術ガイドを目指す",
            "技術の“かっこよさ”“楽しさ”を直感的に感じられるUI設計",
          ]}
        />
        <GlassCard className="text-base md:text-lg text-gray-200 leading-relaxed">
          <p className="mb-2">
            <span className="font-bold text-blue-400">初級者の方へ：</span>
            開発手順記事を写経し、Q&amp;Aで実装にチャレンジ。
          </p>
          <p className="mb-2">
            <span className="font-bold text-blue-400">中級者の方へ：</span>
            リファクタやロジック改善の視点で一緒に磨いてください。
          </p>
          <p>
            <span className="font-bold text-blue-400">上級者の方へ：</span>
            専門的なアドバイス・厳しめの指摘も大歓迎です。
          </p>
        </GlassCard>
      </div>
    ),
  },
];
