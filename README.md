# DevNav — React × Spring Boot 統合教材

[![Deploy Frontend (Vercel)](https://img.shields.io/badge/Vercel-Frontend-black)](#)
[![Backend (Koyeb)](https://img.shields.io/badge/Koyeb-Backend-blue)](#)
[![DB (Neon)](https://img.shields.io/badge/Neon-Postgres-green)](#)
[![Cloudflare DNS](https://img.shields.io/badge/Cloudflare-DNS%2FSSL-orange)](#)

## React × Spring Boot 実務再現教材 — 記事100本の開発手順ページで、本番構成を再現しポートフォリオに直結。

## 目次
- [概要](#概要)
- [成果](#成果)
- [デモ / スクリーンショット](#デモ--スクリーンショット)
- [Insomnia/Postman テスト](#insomniapostman-テスト管理者ファースト--ローカル)
- [システム構成](#システム構成)
- [主要機能](#主要機能)
- [セットアップ（最短ルート）](#セットアップ最短ルート)
- [デプロイ](#デプロイ)
- [API 一覧（抜粋）](#api-一覧抜粋)
- [開発ロードマップ](#開発ロードマップ)
- [このプロジェクトが解決する課題](#このプロジェクトが解決する課題)
- [実績・数値](#実績数値)

## 概要
- React（TS）× Spring Boot（JPA） を接続し、本番構成をそのまま再現できる実務教材。
- **記事100本**の開発手順ページで、環境構築〜デプロイを一気通貫で体験。
- Vercel × Koyeb × Neon × Cloudflare による本番同等のクラウド構成を提供。

## 成果
- 読者の成果：本番同等の構成を再現し、クラウド環境へデプロイ可能。
- 制作者の成果：React × Spring Boot 両面で即戦力を証明し案件獲得へ直結。さらに、**Q&A機能によるフィードバックで教材を継続的に洗練**。


## デモ / スクリーンショット
- **本番URL**：https://devnav.tech （検証後に記載）

### マイページの主な機能
- プロフィールカード（表示名/メール、Lv/XP%バー）
- 学習カレンダー（月表示・日別アクティビティ）
- 統計カード：記録記事数 / レビュー数 / いいね数 / コメント数
- いいねした記事（最新リストへのリンク）
- 直近のアクション履歴（読了・コメント・いいねのタイムライン）
![マイページ](https://github.com/user-attachments/assets/87aaa417-c130-4bc4-bb41-cea18173cb1e)

### Q&A（学習者）
- 質問投稿（タイトル/本文、ログイン必須）
- ステータス表示（受付中・解決）
- 自分の質問一覧／詳細（コメント履歴つき）
- 通知：回答/更新を受け取り（将来：メール/Push予定）

![ユーザーQA](https://github.com/user-attachments/assets/3e1f2982-80f7-4ce1-9375-bd3a507e7db5)

### Q&A管理（管理者）
- 質問一覧（並び替え・検索・ステータスフィルタ）
- 対応：回答投稿、編集、解決/再開の切替
- モデレーション：不適切質問の非表示/削除
- メタ情報：投稿者、日時、記事紐づけ、タグ管理（予定）
  
![adminQA](https://github.com/user-attachments/assets/6951c124-f82e-4ce4-afca-a5d85d6aa687)

---


## Insomnia/Postman テスト（管理者ファースト / ローカル）

この教材は「管理者を先に作る」前提です。まずは Firebase で管理者ユーザーにカスタムクレーム `admin: true` を付与し、IDトークンを取得して `Authorization: Bearer <ID_TOKEN>` で送信します。

1) 動作確認
- `GET http://localhost:8080/actuator/health` → `{"status":"UP"}`

2) 管理者API（要 Bearer）
- 記事一覧: `GET http://localhost:8080/api/admin/articles?page=0&size=10`
- 記事投稿: `POST http://localhost:8080/api/admin/add-article`  
  - Header: `Authorization: Bearer <ID_TOKEN>`  
  - Body (multipart/form-data): `image?`, `title`, `content`, …(ArticleRequest)

3) 学習者が触れる公開系
- 記事一覧: `GET http://localhost:8080/api/articles?limit=20`(**未ログイン**)
- いいね: `POST http://localhost:8080/api/likes/{articleId}`（**要ログイン**）

---

## システム構成

```sql
[ Browser ]
     |
     |  HTTPS (TLS)
     v
+--------------------+
|   Cloudflare DNS   |
|   & Proxy (SSL)    |
+--------------------+
      |                     \
      | devnav.tech          \ backend.devnav.tech
      v                       v
+-------------------+     +----------------------+
|  Vercel (Frontend)| --> |  Koyeb (Spring API)  |
|  React / TS       |     |  /actuator/health    |
+-------------------+     +----------------------+
                               |
                               | JDBC (TLS, sslmode=require)
                               v
                         +------------------+
                         | Neon (Postgres)  |
                         +------------------+

```

- **Frontend**: React (CRA, TypeScript)
- **Backend**: Spring Boot 3, JPA, Actuator, CORS
- **DB**: Neon (Postgres, `sslmode=require`)
- **Infra**: Cloudflare (DNS/SSL), Vercel, Koyeb

---

## 主要機能
- 学習進捗(マイページ)：レベルバー（XP）、カレンダー、アクション履歴
- コンテンツ：記事読了ボタン、いいね、Q&A、コメント、レビュー点数
- 管理：記事管理、ユーザー管理（予定含む）

---

## セットアップ（最短ルート）

> この教材は「管理者を先に作る」前提です。まず Firebase で管理者ユーザーに `admin: true` を付与しておくこと。

### 前提
- Node.js 18+ / npm
- Java 17+ / IntelliJ IDEA
- Firebase（Email/Password 有効化、管理者ユーザー作成）

### 1) Backend（Spring Initializr → IntelliJで起動）
1. Spring Initializr で生成（Spring Boot 3, Web, JPA, Validation, Actuator など）
2. IntelliJ でプロジェクトを開く → `TechApplication` を **dev** プロファイルで実行  
   - （DB未接続でも起動できる構成ならそのまま。必要なら `application-dev.yml` にローカル設定）
3. 動作確認  
   ```bash
   curl http://localhost:8080/actuator/health
   # => {"status":"UP"}
   ```

### 2) Frontend（React CRA）
1. CRA プロジェクトを開く  
   ```bash
   cd frontend
   npm install
   npm start
   ```
2. API のベースURLはローカル前提（必要になったら `.env.local` に定義）  
   ```bash
   # 例：必要になった時だけ作成
   # REACT_APP_API_URL=http://localhost:8080
   ```

### 3) 管理者トークンでAPI確認（Insomnia/curl）
- ログインして **IDトークン** を取得 → `Authorization: Bearer <ID_TOKEN>`
- 例：記事一覧（管理）：  
  ```
  GET http://localhost:8080/api/admin/articles?page=0&size=10
  Header: Authorization: Bearer <ID_TOKEN>
  ```
- 例：記事投稿（管理・画像任意 / multipart）：  
  ```
  POST http://localhost:8080/api/admin/add-article
  Header: Authorization: Bearer <ID_TOKEN>
  Body: image?, title, content, ...
  ```

### 備考
- CORS は本番移行時にだけ調整（例：`https://devnav.tech` を許可）。ローカルは `http://localhost:3000` が通ればOK。
- デプロイ（Vercel/Koyeb/Neon/Cloudflare）は別セクションで後述。

---

## デプロイ

### DNS（Cloudflare）
- `@` → A → 216.198.79.1（Vercel）
- `www` → CNAME → cname.vercel-dns.com.
- `_vercel` → TXT → vc-domain-verify=devnav.tech,xxxxxxxx（Vercel検証用）
- `backend` → CNAME → <your-koyeb-app>.koyeb.app（API用）

### Vercel（Frontend）
- 環境変数: `REACT_APP_API_URL=https://backend.devnav.tech`
- Domains → devnav.tech, www.devnav.tech（Verified後にリダイレクト統一）

### Koyeb（Backend）
- Secrets: JDBC_URL, DB_USER, DB_PASS, SPRING_PROFILES_ACTIVE=prod
- Health: `/actuator/health`

### Neon（DB）
- Connection string: ...neon.tech/<db>?sslmode=require
- 低権限ユーザー発行推奨

---

## API 一覧（抜粋）
- `GET /api/articles`：記事一覧（クエリ：limit, size）
- `GET /api/articles/{id}`:記事詳細
- `POST /api/admin/add-article`（管理者認証）
- `POST /api/likes/{articleId}`(認証)
- `GET /api/progress`（XP, 履歴）

---

## 開発ロードマップ
- 認証まわりのE2Eテスト（Playwright）  
  → ログイン/記事投稿/いいね等の一連の動作を自動テストで保証する。
- Q&A通知（メール / WebPush）  
  → 質問への回答があったらユーザーに即通知。学習継続を支援する。
- 記事検索機能（AI検索）  
  → タグや全文検索に加え、AI検索で関連記事を高速に引けるようにする。
- 管理画面のUX改善（shadcn/ui）  
  → サイドメニューやフォームをモダンUI化し、運営者が使いやすい管理画面に進化。

---

## このプロジェクトが解決する課題
- **教材不足**：React × Spring Boot を日本語で体系的に学べる実務教材が少ない → 接続設計やデプロイを一気通貫で学習可能。
- **学習の継続性**：進捗管理（Lv/XP、カレンダー）で「どこまでやったか」を可視化し、初心者の挫折を防ぐ。
- **即戦力化**：本番同等の構成（Vercel/Koyeb/Neon/Cloudflare）を体験でき、案件獲得に直結するスキルを証明可能。
- **将来性**：管理画面UX改善や通知機能などを拡張予定。教材にとどまらず「実務・学習コミュニティ基盤」として発展可能。

---

## 実績・数値
- 記事数：100本以上（最終200本予定）  
- 実務経験：2年以上  
- 本番構成：Vercel / Koyeb / Neon / Cloudflare を利用し、即稼働可能なポートフォリオを構築済み  

