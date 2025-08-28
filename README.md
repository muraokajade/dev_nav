# DevNav — React × Spring Boot 統合教材

[![Deploy Frontend (Vercel)](https://img.shields.io/badge/Vercel-Frontend-black)](#)
[![Backend (Koyeb)](https://img.shields.io/badge/Koyeb-Backend-blue)](#)
[![DB (Neon)](https://img.shields.io/badge/Neon-Postgres-green)](#)
[![Cloudflare DNS](https://img.shields.io/badge/Cloudflare-DNS%2FSSL-orange)](#)

## React × Spring Boot 実務再現教材 — 記事80本の開発手順ページで、本番構成を再現しポートフォリオに直結。


## 概要
- React（TS）× Spring Boot（JPA） を接続し、本番構成をそのまま再現できる実務教材。
- **記事80本以上**の開発手順ページで、環境構築〜デプロイを一気通貫で体験。
- Vercel × Koyeb × Neon × Cloudflare による本番同等のクラウド構成を提供。

## 成果
- 読者の成果：本番同等の構成を再現し、クラウド環境へデプロイ可能。
- 制作者の成果：React × Spring Boot 両面で即戦力を証明し案件獲得へ直結。さらに、**Q&A機能によるフィードバックで教材を継続的に洗練**。


## Insomnia テスト（最初の一歩）
1. 環境変数 `REACT_APP_API_URL=https://backend.devnav.tech` を使用  
2. Insomnia で `GET https://backend.devnav.tech/actuator/health` → `{"status":"UP"}`  
3. 主要API例：
   - `POST /api/auth/login`
   - `GET /api/articles?limit=20`
   - `POST /api/likes/{articleId}`

---

## デモ / スクリーンショット
- **本番URL**：https://devnav.tech （検証後に記載）
- **管理画面**：/admin （必要なら）
- 画像を2〜3枚差し込み（トップ / マイページ / Q&A）

---

## システム構成

[Browser]
│
│ HTTPS (Cloudflare)
▼
[Vercel: React CRA / TS] ───────→ [Koyeb: Spring Boot API] ──→ [Neon: Postgres]
▲ │ CORS: https://devnav.tech, https://www.devnav.tech
└────────── Public API ──┘

- **Frontend**: React (CRA, TypeScript)
- **Backend**: Spring Boot 3, JPA, Actuator, CORS
- **DB**: Neon (Postgres, `sslmode=require`)
- **Infra**: Cloudflare (DNS/SSL), Vercel, Koyeb

---

## 主要機能
- 学習進捗：レベルバー（XP）、カレンダー、アクション履歴
- コンテンツ：記事読了ボタン、いいね、Q&A
- 管理：記事管理、ユーザー管理（予定含む）
- 記事フォーマット統一（概要・目的・ゴール・エラー対応）

---

## セットアップ

### 1) Frontend（React CRA）
```bash
cd frontend
cp .env.example .env.local
# 例
REACT_APP_API_URL=https://backend.devnav.tech
npm install
npm start
```

### 2) Backend（Spring Boot）
```bash
cd backend
export JDBC_URL="jdbc:postgresql://<xxx>.neon.tech/<db>?sslmode=require"
export DB_USER="<user>"
export DB_PASS="<pass>"
export SPRING_PROFILES_ACTIVE=prod
./mvnw spring-boot:run
```

### CORS（例）
```java
@Bean
CorsConfigurationSource corsConfigurationSource() {
  CorsConfiguration config = new CorsConfiguration();
  config.setAllowedOrigins(List.of("https://devnav.tech","https://www.devnav.tech","http://localhost:3000"));
  config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
  config.setAllowedHeaders(List.of("*"));
  config.setAllowCredentials(true);
  UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
  source.registerCorsConfiguration("/**", config);
  return source;
}
```

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
- `GET /api/articles`：記事一覧（クエリ：limit, cursor）
- `GET /api/articles/{id}`
- `POST /api/articles`（認証）
- `POST /api/auth/login` / `POST /api/auth/register`
- `POST /api/likes/{articleId}`
- `GET /api/me/progress`（XP, 履歴）

---

## 開発ロードマップ
- 認証まわりのE2E（Playwright）
- Q&A通知（メール/WebPush）
- 記事検索（RAG/Embeddings検討）
- 管理画面のUX研磨（shadcn/ui）

---

## このプロジェクトが解決する課題
- ReactとSpringの接続設計を日本語で再現可能  
- 学習進捗の可視化で初心者の離脱を低減  
- 本番同等の**デプロイ導線（Vercel/Koyeb/Neon/Cloudflare）**を実体験できる  

---

## 実績・数値（更新）
- 記事：80+（最終200想定）
- 実務経験：2年
- 目標：月収50万円（案件40万 + 教材20万）
![Uploading image.png…]()
