import React from "react";
import { MiniCanvas3D } from "./MiniCanvas3D";
import HeroImpact from "./HeroImpact";
import { Navigate, useNavigate } from "react-router-dom";

export type SectionItem = {
  key: string;
  title: React.ReactNode;
  content: React.ReactNode;
  img?: string;
};

export const sections: SectionItem[] = [
  {
    key: "intro",
    title: (
      <div className="flex items-center mt-16">
        <MiniCanvas3D size={60} />
        <span className="text-blue-400">Dev</span>
        <span className="text-white">Nav</span>
        <span className="text-blue-600">+</span>
      </div>
    ),
    content: (
      <div className="flex flex-col items-center gap-14 w-full">
        <p className="text-lg md:text-xl mb-8 text-gray-200 font-bold max-w-2xl mx-auto">
          <span className="text-blue-300 font-bold">Spring Boot</span>と
          <span className="text-blue-300 font-bold">React</span>
          で作られた、本格派の技術ポータル。
          <br />
          実務で通用する設計とモダンなUI/UXを体感しながら、「コードを書く楽しさ」と「開発の最前線」を体験できます。
        </p>
        {/* 画像を白背景で枠囲い */}
      </div>
    ),
  },
  {
    key: "features",
    title: (
      <>
        <span className="flex items-center gap-3 text-2xl font-semibold mb-3 text-white">
          <MiniCanvas3D size={60} />
          主な機能①
        </span>
      </>
    ),
    content: (
      <div className="flex flex-col items-center gap-12 w-full">
        <ul className="list-disc text-gray-200 text-xl md:text-2xl font-semibold space-y-8 w-full max-w-3xl mx-auto px-2">
          <li>
            Spring
            Boot／Reactの記事・コードサンプルを体系的にまとめて参照することができます。
          </li>
          <li>
            技術ごとの「使えるTips」や実践ノウハウを収集可能です。
            <div className="w-full bg-white rounded-xl shadow-lg p-4 mt-4 flex justify-center items-center">
              <img
                src="/assets/images/p1.png"
                alt="syntax"
                className="w-full rounded-lg object-contain"
              />
            </div>
          </li>
        </ul>
      </div>
    ),
  },
  {
    key: "features",
    title: (
      <>
        <span className="flex items-center gap-3 text-2xl font-semibold mb-3 text-white">
          <MiniCanvas3D size={60} />
          主な機能②
        </span>
      </>
    ),
    content: (
      <div className="flex flex-col items-center gap-12 w-full">
        <ul className="list-disc text-gray-200 text-xl md:text-2xl font-semibold space-y-8 w-full max-w-3xl mx-auto px-2">
          <p>①記事読了機能：その記事を読了↔︎未読に切り替えることができます。</p>
          <p>②レビュー機能：記事に対する評価をつけることができます。</p>
          <p>③コメント機能：記事に対するコメントを書くことができます。</p>
          <p>
            ④Q&A機能：記事を書いた管理者に対して、質問をすることができます。
          </p>
          <div className="w-full bg-white rounded-xl shadow-lg p-4 mt-4 flex justify-center items-center">
            <img
              src="/assets/images/comment.png"
              alt="mypage"
              className="w-full rounded-lg object-contain"
            />
          </div>
        </ul>
      </div>
    ),
  },
  {
    key: "features",
    title: (
      <>
        <span className="flex items-center gap-3 text-2xl font-semibold mb-3 text-white">
          <MiniCanvas3D size={60} />
          主な機能③
        </span>
      </>
    ),
    content: (
      <div className="flex flex-col items-center gap-12 w-full">
        <ul className="list-disc text-gray-200 text-xl md:text-2xl font-semibold space-y-8 w-full max-w-3xl mx-auto px-2">
          <li>
            ログインユーザーは自分の学習記録やアクション履歴をカレンダーやレベルバーで見ることができます。
            <div className="w-full bg-white rounded-xl shadow-lg p-4 mt-4 flex justify-center items-center">
              <img
                src="/assets/images/p2.png"
                alt="mypage"
                className="w-full rounded-lg object-contain"
              />
            </div>
          </li>
        </ul>
      </div>
    ),
  },

  {
    key: "features",
    title: (
      <>
        <span className="flex items-center gap-3 text-2xl font-semibold mb-3 text-white">
          <MiniCanvas3D size={60} />
          主な機能④
        </span>
      </>
    ),
    content: (
      <div className="flex flex-col items-center gap-12 w-full">
        <ul className="list-disc text-gray-200 text-xl md:text-2xl font-semibold space-y-8 w-full max-w-3xl mx-auto px-2">
          <li>管理者権限を持つと記事投稿、記事一覧を確認できます。</li>
          <li>
            自分オリジナルの教科書を作成することも可能です。
            <div className="w-full bg-white rounded-xl shadow-lg p-4 mt-4 flex justify-center items-center">
              <img
                src="/assets/images/admin.png"
                alt="syntax"
                className="w-full rounded-lg object-contain"
              />
            </div>
          </li>
        </ul>
      </div>
    ),
  },
  {
    key: "environment",
    title: (
      <div className="flex items-center gap-4 mt-16">
        <MiniCanvas3D size={60} />
        <span className="text-2xl font-semibold text-white">
          開発環境について
        </span>
      </div>
    ),
    content: (
      <div className="flex flex-col gap-8 w-full items-center">
        <ul className="list-disc text-gray-200 text-xl md:text-2xl font-semibold space-y-6 w-full max-w-3xl mx-auto px-2">
          <li>
            開発用PC: <b>MacBook Pro（Appleシリコン）</b>
          </li>
          <li>
            メインIDE:{" "}
            <b>
              IntelliJ IDEA（バックエンド）、Visual Studio
              Code（フロントエンド）
            </b>
          </li>
          <li>
            バックエンド: <b>Spring Boot 3.x + Java 17</b>
          </li>
          <li>
            フロントエンド: <b>React 18 + TypeScript</b>
          </li>
          <li>
            インフラ: <b>Vercel（フロント）、Koyeb（バックエンド）、Neon(DB)</b>
          </li>
          <li>
            データベース: <b>PostgreSQL（管理はDBeaverを使用）</b>
          </li>
          <li>
            APIテスト: <b>Insomnia</b>
          </li>
          <li>
            その他: <b>Tailwind CSS, framer-motion, JWT認証, GitHub Actions,</b>
          </li>
        </ul>
        <div className="bg-gray-800/70 rounded-xl p-8 mt-4 shadow-lg max-w-3xl mx-auto w-full text-base md:text-lg text-gray-200 leading-relaxed">
          <p className="mb-2">
            <span className="font-bold text-blue-500">この環境の特徴：</span>
            <br />
            Mac上でIntelliJ
            IDEAとVSCodeを使い分けて効率よく開発。API動作確認はInsomnia、DB管理はPostgreSQL　DBeaver
            でリアルタイムにテストしながら進めています。
          </p>
          <p>
            <span className="font-bold text-blue-500">
              セットアップ・開発フロー：
            </span>
            <br />
            コード編集→ローカル実行→APIテスト（Insomnia）→DB確認（Workbench）→GitHubへpush→CI/CDで自動デプロイというサイクルで品質向上・効率化を実現しています。
          </p>
          <p>
            ※詳細なセットアップ手順や各ツールの使い方は
            <span className="text-blue-400 underline">README</span>
            をご参照ください。
          </p>
        </div>
      </div>
    ),
  },

  {
    key: "about",
    title: (
      <div className="flex items-center gap-4 mt-16">
        <MiniCanvas3D size={60} />
        <span className="text-2xl font-semibold text-white">
          このサイトについて
        </span>
      </div>
    ),
    content: (
      <div className="flex flex-col gap-8 w-full items-center">
        <ul className="list-disc text-gray-200 text-xl md:text-2xl font-semibold space-y-6 w-full max-w-3xl mx-auto px-2">
          <li>
            日本語でまとまった「Spring Boot ×
            React」教材が少ない現状を変えるべく開発しました。
          </li>
          <li>
            最新トレンドや現場経験を取り入れた、実践的な技術ガイドを作ることを目的としています。
          </li>
          <li>
            技術の「かっこよさ」「楽しさ」を直感的に感じられるUI設計を意識しました。
          </li>
        </ul>
        {/* ↓追記：ユーザー層ごとへのメッセージ */}
        <div className="bg-gray-800/70 rounded-xl p-8 mt-4 shadow-lg max-w-3xl mx-auto w-full text-base md:text-lg text-gray-200 leading-relaxed">
          <p className="mb-2">
            <span className="font-bold text-blue-500">初級者の方へ：</span>
            開発手順記事を読んで写経し、Q&amp;A機能を使って実装にチャレンジしてみてください。
          </p>
          <p className="mb-2">
            <span className="font-bold text-blue-500">中級者の方へ：</span>
            実際に「このコードはリファクタできる」「ロジック的にもっと良い書き方がある」など、一緒に考えていただけると幸いです。
          </p>
          <p>
            <span className="font-bold text-blue-500">上級者の方へ：</span>
            より専門的なアドバイス、厳しいご意見も大歓迎です。ぜひご指導よろしくお願いいたします！
          </p>
        </div>
      </div>
    ),
  },
];
