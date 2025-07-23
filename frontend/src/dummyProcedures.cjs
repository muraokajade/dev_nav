const dummyProcedures = [
{
  stepNumber: "1-00",
  slug: "node-nvm-setup",
  title: "Node.js + nvmインストール手順【2025年最新版】",
  author: "村岡兼通",
  createdAt: "2024-07-21",
  content: `
### 手順

1. Node.jsのバージョン確認

   Vite 7以降はNode.js v20.19.0以上が必須です。

   ```bash
   node -v
   ```

   - \`zsh: command not found: node\` などのエラーが出る場合はNode.jsが未インストールなので、以下の手順に進んでください。

---

2. nvmのインストール

   nvm（Node Version Manager）はNode.jsのバージョン管理ツールです。  
   ターミナルで次のコマンドを実行してnvmをインストールします。

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   ```

   インストール後、nvmを有効化します（ターミナル再起動または下記を実行）。

   ```bash
   source ~/.nvm/nvm.sh
   ```

   nvmがインストールされたかどうか確認：

   ```bash
   nvm --version
   ```

---

3. どこでもnvm/nodeコマンドが使えるようにする設定（zshの場合）

   ターミナルで下記コマンドを順番に実行します。

   ```bash
   echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
   echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.zshrc
   source ~/.zshrc
   ```

   ※これで**どのディレクトリ・どの場所でも**\`node -v\`や\`nvm\`コマンドが使えるようになります。

---

4. Node.js v20のインストールと利用開始

   Vite 7以降のプロジェクトで推奨されているNode.js v20をインストールします。

   ```bash
   nvm install 20
   nvm use 20
   ```

---

5. Node.jsのバージョン再確認

   ```bash
   node -v
   # v20.19.0 以上かチェック！
   ```

---

### 📝 補足・トラブル対策

- **nvm**を使うと、複数バージョンのNode.jsを簡単に切り替えできます。
- Vite 7以降は、**Node.js v20.19.0以上**が必須です。
- エラーが出る場合は**ターミナルを再起動**するか、\`source ~/.zshrc\` や \`source ~/.nvm/nvm.sh\` を実行。
- もし\`nvm\`コマンドが見つからない場合は、インストール手順と.zshrcの設定を再確認。
- 他のシェル（bash等）の場合は、\`~/.bashrc\` や \`~/.bash_profile\` に同じ設定を追記してください。
- 新しいターミナルを開いたら、最初に必ず「nvm use 20」
- 既存ターミナルでcdするだけなら本来不要だけど、パスが切れる場合は癖でやってもOK

---

#### 参考：今後、複数バージョンのNode.jsを切り替えるには

```bash
nvm install 18    # 例：v18を追加でインストール
nvm use 18        # v18に切り替え
node -v           # バージョン確認
```

---
`,
},


{
  stepNumber: "1-01",
  slug: "react-tailwind-setup",
  title: "React + Tailwind CSS環境構築【2025年最新版／バージョン罠対策】",
  author: "村岡兼通",
  createdAt: "2024-07-21",
  content: `
### 手順

1. プロジェクト用ディレクトリ作成（推奨）

   ```bash
   mkdir dev-nav
   cd dev-nav
   ```

---

2. Vite + React(TypeScript) プロジェクト作成

   ```bash
    npx create-react-app my-app --template typescript

   ```
   ※既存ディレクトリ内で「.」指定するとネストやパスの混乱を防げます。

---

3. 依存パッケージ初期化（おまじない）

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
   ※依存関係の不整合や残骸を防ぐため、最初に必ず1回リセット。

---

4. 【重要】npmのバージョンを9系に下げる

   ```bash
   npm install -g npm@9
   ```
   ※2024年現在、npm10系とtailwindcss最新版（4.x）の組み合わせでバイナリが正しく生成されないバグが報告されています。  
   9系だとほぼ全ての環境で安定します。

---

5. Tailwind CSS（3.4.3）セットアップ

   ```bash
   npm install -D tailwindcss@3.4.3 postcss autoprefixer
   npx tailwindcss init -p
   ```
   ※tailwindcss4系はnpm9/10や一部の環境で「node_modules/.bin/tailwindcss」が生成されないバグがあるため、  
   現時点では3.4.3を使うと確実です（2025年7月時点）。

---

6. tailwind.config.cjs編集

   ```js
   /** @type {import('tailwindcss').Config} */
   module.exports = {
     content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
     theme: { extend: {} },
     plugins: [],
   }
   ```
   ※tailwind.config.jsでエラーが出たら「.cjs」拡張子に。
---

7. postcss.config.cjs作成（Node20+かつ"type":"module"の場合）

   ```js
   // postcss.config.cjs
   module.exports = {
     plugins: {
       tailwindcss: {},
       autoprefixer: {},
     },
   };
   ```
   ※postcss.config.jsでエラーが出たら「.cjs」拡張子に。

---

8. src/index.cssにTailwindディレクティブを追加

   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

---

9. 開発サーバー起動

   ```bash
   npm run dev
   ```

---

### 💡バージョン罠・注意ポイント

- **npm10系 + tailwindcss4系の組み合わせは現時点で非推奨です。**（CLIコマンドが動かないことがある）
- **tailwindcss@3.4.3 + npm9系は安定動作。**
- 必ず最初にNode.jsのバージョンが**v20.19.0以上**であることを確認！
- npmやnode_modulesで意味不明なエラーが出る場合は、\`rm -rf node_modules package-lock.json\`してから\`npm install\`をやり直すとほぼ解決します。
- Vite公式/Tailwind公式の最新手順も念のため随時チェック推奨。

---

#### 【現場トラブル事例】
- 2024-2025年春時点で**tailwindcss4系にnpm10系を合わせると、CLIバイナリが「.bin」に現れない（npxで動かない）バグがありました。**
- npm9系＋tailwindcss3.4.3なら、どんなMac/Win環境でも確実に動くのでおすすめです。

---
`,
}
,


  {
    stepNumber: "1-02",
    slug: "init-git-repo",
    title: "Gitリポジトリ初期化",
    author: "村岡兼通",
    createdAt: "2024-07-21",
    content: `
  ### 手順
  
  1. Git初期化
  
     ```bash
     git init
     ```
  
  2. .gitignoreファイル作成
  
     ```gitignore
     node_modules/
     dist/
     .env
     ```
  
  3. 最初のコミット
  
     ```bash
     git add .
     git commit -m "Initial commit"
     ```
  
  ---
  
  ### 注意・ポイント
  
  - VSCodeの「Source Control」からも操作OK
  - .gitignoreの「node_modules」除外は必須
  - GitHubリポジトリを後から作成し、\`git remote add origin ...\`で紐付け
      `,
  },
  {
    stepNumber: "1-03",
    slug: "eslint-prettier-setup",
    title: "ESLint／Prettier導入",
    author: "村岡兼通",
    createdAt: "2024-07-21",
    content: `
  ### 手順
  
  1. ESLint／Prettierインストール
  
     ```bash
     npm install -D eslint prettier eslint-config-prettier eslint-plugin-react eslint-plugin-import
     ```
  
  2. 設定ファイル作成
  
     ```bash
     npx eslint --init
     ```
     - フレームワークは「React」
     - TypeScriptの場合は「TypeScript」も選択
  
  3. .eslintrcの例
  
     ```json
     {
       "extends": [
         "react-app",
         "plugin:react/recommended",
         "plugin:import/recommended",
         "prettier"
       ]
     }
     ```
  
  4. Prettier設定例（prettier.config.js）
  
     ```js
     module.exports = {
       semi: true,
       singleQuote: false,
       printWidth: 100,
     };
     ```
  
  5. 動作確認
  
     ```bash
     npx eslint src
     npx prettier --write src
     ```
  
  ---
  
  ### 注意・ポイント
  
  - VSCode拡張「ESLint」「Prettier」も入れておくと楽
  - 公式ガイドも随時チェック推奨
      `,
  },
  {
    stepNumber: "1-04",
    slug: "spring-initializr-setup",
    title: "Spring Initializrでバックエンド新規作成",
    author: "村岡兼通",
    createdAt: "2024-07-21",
    content: `
  ### 手順
  
  1. [Spring Initializr](https://start.spring.io/) にアクセス
  
  2. 以下のように入力・選択（好みで変更OK）
  
     - **Project:** Maven Project
     - **Language:** Java17
     - **Spring Boot:** 3.x（例：3.2.0 など最新を推奨）
     - **Group:** \`com.example\`（自分の組織名や好きな文字列でOK）
     - **Artifact:** \`my-app\`（←プロジェクト名。好きな名前でOK。例：\`demo\`や\`portfolio-backend\` など）
     - **Name:** \`my-app\`
     - **Dependencies:**
       - Spring Web
       - Spring Data JPA
       - MySQL Driver
       - Spring Boot DevTools
       - Lombok
  
  3. 「Generate」ボタンでZIPダウンロード
  
  4. ダウンロードしたZIPを展開
     **IntelliJ IDEA**で「Open」→プロジェクトを開く
  
  ---
  
  ### 補足・ポイント
  
  - **Group/Artifact/Nameは「自分用に好きな文字列」でOK**
  - **依存関係（Dependencies）は後から追加も可能**
  - データベースは**MySQL**を想定
  - IntelliJ IDEA推奨（Spring Boot連携が強力）
  - **Firebase連携（例：Cloud Messaging/Storageなど）はSpring Initializrで生成後に「firebase-admin」などをpom.xmlに追記**
  
  ---
  
  > 公式ガイド：[Spring Initializr documentation](https://docs.spring.io/initializr/docs/current/reference/html/)
  `,
  },
{
  stepNumber: "1-05",
  slug: "project-folder-move-reset-nodemodules",
  title: "フォルダ分割＆node_modules再生成手順",
  author: "やまだたろう",
  createdAt: "2024-07-21",
  content: `
### 手順

1. 新しい作業用フォルダ（ここでは「my-apps」）を作成

   ```bash
   mkdir my-apps
   ```

---

2. 既存のプロジェクト（例: sample-frontend, sample-backend）の「node_modules」を**移動前に必ず削除**

   ```bash
   rm -rf sample-frontend/node_modules
   rm -rf sample-backend/node_modules
   ```
   ※古いnode_modulesが残ったまま移動するとエラーの原因になるので、「移動前に消す」のが現場の鉄則です。

---

3. プロジェクトのフォルダ名をわかりやすくリネーム  
（例: sample-frontend → frontend, sample-backend → backend）

   ```bash
   mv sample-frontend frontend
   mv sample-backend backend
   ```

---

4. リネームしたフォルダをmy-apps配下に移動

   ```bash
   mv frontend my-apps/
   mv backend my-apps/
   ```
   ※これで「my-apps/frontend」「my-apps/backend」という構成になります。

---

5. frontend・backendそれぞれで依存パッケージをインストール

   ```bash
   cd my-apps/frontend
   npm install

   cd ../backend
   npm install
   ```
   ※yarnユーザーなら「npm」を「yarn」に置き換えてOK。

---

6. 【補足】.envやREADMEなど、共通/必要なファイルがあれば手動でコピーや整理

   ```bash
   # 例: 共通.envをfrontendとbackendにコピー
   cp ../.env my-apps/frontend/
   cp ../.env my-apps/backend/
   ```

---

### フォルダ構成イメージ

```
my-apps/
  ├── frontend/
  │    ├── package.json
  │    └── ...
  └── backend/
       ├── package.json
       └── ...
```

---

### 💡ポイント・初心者向けTips

- **「node_modules」は絶対にコピーしない！**  
  → 新しい場所で\`npm install\`し直すのがトラブル防止の基本
- エラーや動作がおかしい場合も、\`rm -rf node_modules package-lock.json\`で初期化→\`npm install\`でたいてい解決
- もし「移動したら消えた」「フォルダが見つからない」など不安な時は、まずゴミ箱・iCloud Drive・Finder検索で探してみよう！

---

#### 【ありがちなトラブル例】
- node_modulesを消さずにmv/cpしたら「意味不明なnpmエラー」や「プロジェクトが起動しない」などにハマりやすい。  
→ **まず削除！**これだけで99%防げます。

---
`
},
{
   stepNumber: "1-06",
   slug: "git-github-firstpush",
   title: "Git新規リポジトリ作成＆GitHub初回push手順【最短安全ルート】",
   author: "やまだたろう",
   createdAt: "2024-07-21",
   content: `
   ### 手順

   1. プロジェクトルートに移動（例: dev-nav）

      ```bash
      cd dev-nav
      ```

   ---

   2. README.mdを作成

      ```bash
      echo "# dev-nav" >> README.md
      ```

   ---

   3. Gitリポジトリを初期化

      ```bash
      git init
      ```

   ---

   4. README.mdをステージに追加

      ```bash
      git add README.md
      ```

   ---

   5. 最初のコミット

      ```bash
      git commit -m "first commit"
      ```

   ---

   6. ブランチ名をmainに変更

      ```bash
      git branch -M main
      ```

   ---

   7. リモートリポジトリ（GitHub）を登録

      ```bash
      git remote add origin https://github.com/muraokajade/dev-nav.git
      ```
      ※GitHubで事前にリポジトリ（空でOK）を作成しておくこと！

   ---

   8. 初回push（GitHubにアップロード）

      ```bash
      git push -u origin main
      ```

   ---

   ### 💡補足・注意

   - すでに「origin」が登録されている場合は、git remote -vで確認し、  
   違うリモートならgit remote remove originしてからやり直す。
   - push時に認証エラーが出る場合は、  
   「GitHubのPersonal Access Token」かSSHキーを用意して再トライ。

   ---
   `,
   },{
  stepNumber: "2-01",
  slug: "firebase-auth-admin-mysql-setup",
  title: "Firebase認証＆MySQLで管理者ユーザー作成手順【RDB連携ルート】",
  author: "やまだたろう",
  createdAt: "2024-07-21",
  content: `
### 手順

1. Firebaseプロジェクト新規作成  
   - [Firebaseコンソール](https://console.firebase.google.com/)にアクセス  
   - 新規プロジェクトを作成

---

2. 認証(Authentication)機能を有効化  
   - 左メニュー「Authentication」→「始める」  
   - 「メール/パスワード」を有効化

---

3. 管理者(=Admin)用ユーザーを作成  
   - Firebase Authenticationの「ユーザー」タブ→「ユーザーを追加」  
   - 管理者用メールアドレス＆パスワードで登録（例: admin@example.com）

---

4. MySQLで「users」テーブルを作成  
   - Workbench等で「users」テーブルを用意
   - カラム例：id, email,displayName, role, created_at, など
---

#### 公式ガイド
- [Firebase Authentication公式](https://firebase.google.com/docs/auth)
- [MySQL Workbench公式](https://dev.mysql.com/doc/workbench/en/)

---
`,
}
,{
  stepNumber: "2-02",
  slug: "firebase-auth-react-setup",
  title: "ReactでFirebase認証初期化【2025年版】",
  author: "やまだたろう",
  createdAt: "2024-07-21",
  content: `
### 手順

1. firebaseパッケージをインストール

   ```bash
   npm install firebase
   ```

---

2. Firebaseプロジェクトの「プロジェクトの設定」 > 「自分のアプリ」一覧から
   対象のWebアプリ（</>アイコン）を選択し、(なければ新規作成する)「SDKの設定と構成」欄のfirebaseConfigをコピペ


---

3. プロジェクト内にfirebase.ts（またはfirebaseConfig.ts）を作成し、初期化コードを書く

   ```ts
   // src/firebase.ts
   import { initializeApp } from "firebase/app";
   import { getAuth } from "firebase/auth";

   const firebaseConfig = {
     apiKey: "xxxxxxx",
     authDomain: "xxxxx.firebaseapp.com",
     projectId: "xxxxx",
     storageBucket: "xxxxx.appspot.com",
     messagingSenderId: "xxxxxx",
     appId: "xxxxxx"
   };

   // Firebaseアプリ初期化
   const app = initializeApp(firebaseConfig);

   // Firebase Authインスタンスをエクスポート
   export const auth = getAuth(app);
   ```

---
### 管理者ユーザーにadminクレームを付与（Node.jsスクリプト例）

Firebase Authenticationの「admin権限」を特定ユーザーに付与したい場合は、  
Firebase Admin SDKを使って下記のようなスクリプトを一度だけ実行します。

4. サービスアカウントキー（serviceAccountKey.json）を取得、名前を  
   - Firebaseコンソール > プロジェクトの設定 > サービスアカウント > 新しい秘密鍵を生成で取得したものをserviceAccountKey.jsonにリネームしてfrontend配下に配置

5. 下記Node.jsスクリプトを作成＆実行

```js
// setAdminClaim.cjs
const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(require("./serviceAccountKey.json")),
});

const uid = "ここに対象ユーザーのuidを記入";

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(\`ユーザー(\${uid})にadminクレームを付与しました。\`);
    process.exit();
  })
  .catch(err => {
    console.error("エラー:", err);
    process.exit(1);
  });
```

```bash
npm install firebase-admin
node setAdminClaim.cjs
```
- ユーザー(あなたのuid)にadminクレームを付与しました。と出れば成功！あなたは管理者になりました。
- これで**管理者クレーム（admin: true）**が付きます。
- Reactからは user.getIdTokenResult().then(res => res.claims.admin) で判定できます。

#### 公式ガイド  
- [Firebase JS Auth クイックスタート](https://firebase.google.com/docs/auth/web/start?hl=ja)

---
`,
},
`
{
  stepNumber: "2-03",
  slug: "react-authcontext-global-state",
  title: "React Contextで認証情報をグローバル管理＆useAuthカスタムフック化【現場パターン】",
  author: "やまだたろう",
  createdAt: "2024-07-21",
  content: `
### 手順

本手順では、**React Context API**と**カスタムフック**で「認証情報（ユーザー／管理者判定など）」を**全画面でグローバル共有**する定番パターンを構築します。

---

### 手順

1. **ディレクトリ構成を決める**

```bash
src/
  context/
    AuthContext.ts     # 認証情報の型・Context本体・useAuthフック
    AuthProvider.tsx   # Context Provider（実際に値を配るコンポーネント）
  libs/
    firebase.ts        # Firebase初期化
  ...（省略）
```

---

2. **AuthContext.ts**（認証情報の型・Context本体・カスタムフック）

```ts
// src/context/AuthContext.ts

import type { User } from "firebase/auth";
import { createContext, useContext } from "react";

// 認証情報を型で明確化
export interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  idToken: string | null;
  isAdmin: boolean;
}

// Context本体を初期値で作成（未ログイン状態がデフォ）
export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  loading: true,
  idToken: null,
  isAdmin: false,
});

// どの画面・コンポーネントでも認証情報を参照できるカスタムフック
export const useAuth = () => useContext(AuthContext);
```

---

3. **AuthProvider.tsx**（Context Provider本体）

```tsx
// src/context/AuthProvider.tsx

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../libs/firebase";
import type { User } from "firebase/auth";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseuser) => {
      setCurrentUser(firebaseuser);
      if (firebaseuser) {
        const token = await firebaseuser.getIdToken();
        setIdToken(token);
        const tokenResult = await firebaseuser.getIdTokenResult();
        setIsAdmin(tokenResult.claims.admin === true);
      } else {
        setIdToken(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading,
    idToken,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

### 解説

- **AuthContext.ts** で型・Context本体・useAuthフックを定義  
  → これだけで「どこでも認証情報が型安全で使える」
- **AuthProvider.tsx** で「Firebase認証状態」をリアルタイム監視して、  
  コンテキストとしてグローバルに配布
- **App.tsx**やsrc/index.tsxで
  ```tsx
  <AuthProvider>
    <App />
  </AuthProvider>
  ```
  のようにラップすれば、全コンポーネントから
  ```tsx
  const { currentUser, isAdmin, loading } = useAuth();
  ```
  だけで認証情報にアクセス可能！

---

### ポイント・現場Tips

- **型定義・Context本体・Provider・useAuthフックをファイルで分割**することで「Fast Refresh警告」を回避＆現場保守性もUP
- 管理者権限フラグも「isAdmin」で一元管理できる
- 型やContext本体を分けておくと将来「認証情報の拡張」も楽

---

#### 参考公式  
- [React Context公式](https://react.dev/reference/react/createContext)
- [Firebase Auth公式](https://firebase.google.com/docs/auth/web/start?hl=ja)

---
`,
},
{
  stepNumber: "2-04",
  slug: "firebase-auth-login-page",
  title: "Firebase認証用ログイン画面の実装【React現場パターン】",
  author: "やまだたろう",
  createdAt: "2024-07-21",
  content: `
### 手順

1. **ログイン画面の作成（src/pages/Login.tsx など）**

```tsx
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom"
import { auth } from "../../libs/firebase";

export const Login = () => {
    const navigate = useNavigate(); // ← スペル注意
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { isAdmin, isAuthenticated } = useAuth();

    //ログイン確認用のための目印(コレが出れば成功です。。)
    useEffect(() => {
       if (isAuthenticated && isAdmin) {
          alert("管理者としてログイン成功！");
       }
    }, [isAuthenticated, isAdmin]);

    const handleLogin = async(e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/");
            
        } catch {
            setError("ログインに失敗しました。メールアドレスとパスワードを確認してください。")
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
            <h1 className="text-3xl font-bold text-center text-white mb-6">
              ログイン
            </h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1">メールアドレス</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">パスワード</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-semibold transition"
              >
                ログイン
              </button>
            </form>
            <p className="mt-4 text-center text-gray-400 text-sm">
              アカウントがない方は{" "}
              <a href="/register" className="text-blue-400 hover:underline">
                新規登録
              </a>
            </p>
          </div>
        </div>
      );
}
```

---

### ポイント

- **Firebase Authと連携したログイン処理を1つの関数で完結**
- **useNavigate でログイン後の画面遷移も一発**
- **エラーメッセージもstateでしっかり管理**
- **Tailwind CSSで現場っぽいUIにも対応**

---

### 補足
- ルーティングはreact-router-domの<Route path="/login" element={<Login />} />等で実装
- 新規登録画面は/registerなどに設置

---
`,
},
{
  stepNumber: "2-05",
  slug: "react-router-login-route-setup",
  title: "React Routerでログイン画面ルートを実装する【最小構成サンプル＋解説】",
  author: "やまだたろう",
  createdAt: "2024-07-21",
  content: `
### 実装例

```tsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { Login } from "./pages/CommonPage/Login";
import { Navbar } from "./pages/CommonPage/Navbar";
import { HomePage } from "./pages/HomePage/HomePage";

function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
```

---

### コードのポイント・現場的な解説

- **<BrowserRouter>**  
  アプリ全体をラップして「画面遷移（ルーティング）」を有効化。  
  これがないとURLの切り替えや画面遷移ができない。
- **<Navbar />**  
  ナビゲーションバーを全ページ共通で表示。  
  これを<BrowserRouter>内に置くことで、「リンク遷移」などRouter連携が効く。
- **<Routes>と<Route>**  
  - <Route path="/" element={<HomePage />} />
    …URLが/（トップ）の時、HomePageを表示
  - <Route path="/login" element={<Login />} />
    …URLが/loginの時、Login画面を表示
- **他のページを追加したい時も<Route path="..." element={<... />} />で増やすだけ！**
- **Tailwindのmin-h-screen bg-gray-900で全画面ダーク背景などUIも整えている**

---

### よくある現場TIPS

- **Navbarはルーティングの中で描画することで、ページ遷移しても常に表示される**
- 管理者画面や登録画面なども同じように<Route path="/admin" ... />で追加
- 必要なら「認証が必要なページはProtectedRoute」でガードも可能

---

### 補足

- ルーティングは「URLと画面コンポーネントの紐付け」
- 公式: [React Router v6公式ガイド](https://reactrouter.com/en/main)

---
`,
},
{
  stepNumber: "3-01",
  slug: "spring-firebase-admin-setup",
  title: "Spring BootでFirebase認証・管理SDK＋MySQL初期化手順【バックエンド3-01】",
  author: "やまだたろう",
  createdAt: "2024-07-21",
  content: `
### 手順

1. **Firebase Admin SDK依存を追加（pom.xml）**

```xml
<dependency>
  <groupId>com.google.firebase</groupId>
  <artifactId>firebase-admin</artifactId>
  <version>9.2.0</version>
</dependency>
<!-- セキュリティ用（必要に応じて） -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<!-- MySQLドライバ -->
<dependency>
  <groupId>mysql</groupId>
  <artifactId>mysql-connector-java</artifactId>
  <scope>runtime</scope>
</dependency>
```

---

2. **MySQLデータベースをWorkBench等で作成**

- MySQL WorkBenchなどで  
  \`CREATE DATABASE tech_app DEFAULT CHARACTER SET utf8mb4;\`  
  を実行（データベース名「tech_app」でOK）

---

3. **DB接続設定（application.properties）**

```properties
spring.application.name=tech
spring.datasource.url=jdbc:mysql://localhost:3306/"あなたのDB名"
spring.datasource.username=root
spring.datasource.password=あなたのパスワード
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
```

- ※パスワードはご自身のMySQL環境に合わせてください

---

4. **Firebaseサービスアカウント秘密鍵（firebase-service-account.json）を取得・設置**

- [Firebaseコンソール → プロジェクト設定 → サービスアカウント]で「新しい秘密鍵を生成」
- ダウンロードしたjsonファイルを  
  \`src/main/resources/firebase/firebase-service-account.json\`  
  にリネームして配置

- **.gitignoreの設置方法**  
  プロジェクトルート（\`pom.xml\`や\`src\`と同じ階層）で以下を追加
```
src/main/resources/firebase/firebase-service-account.json
```

---

5. **初期化用の設定クラスを作成（例: FirebaseConfig.java）**

```java
package com.example.tech.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        try {
            InputStream serviceAccount = getClass().getClassLoader()
                .getResourceAsStream("firebase/firebase-service-account.json");

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }

            System.out.println("✅ Firebase initialized");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

---

### 補足・TIPS

- **.gitignoreはプロジェクト直下**  
  (\`pom.xml\`や\`src\`と同じ階層)
- サービスアカウントjsonの場所はプロジェクト構成によってパスを調整
- \`@PostConstruct\`でアプリ起動時に一度だけ初期化
- FirebaseApp.getApps().isEmpty()で「多重初期化」防止
- json名は何でも良いが、「firebase-service-account.json」などにして明示的に管理推奨

---

### トラブル時のチェックポイント

- **Mavenプロジェクトとして認識されない時は…**
    - \`pom.xml\`がプロジェクトルートにあるか確認
    - IntelliJで「右クリック→Maven→Reload」や再起動、またはターミナルで\`./mvnw clean install\`実行
- **importエラー（security系）が出る場合は、pom.xmlに依存を追加したか確認＋プロジェクト再読み込み！**
- **DB接続エラー時はMySQLの起動とユーザー権限を確認！**

---

### 最終チェック

- Spring Bootアプリを起動し、**「✅ Firebase initialized」** というsysoutが出ればFirebase初期化は成功！
- DB連携もapplication.propertiesの設定でOK

---

#### 公式リファレンス  
- [Firebase Admin SDK Setup(Java)](https://firebase.google.com/docs/admin/setup?platform=java)

---
`,
},
{
  stepNumber: "3-02",
  slug: "spring-firebase-token-filter",
  title: "Firebase認証トークン検証フィルターの全行解説【バックエンド3-02】",
  author: "やまだたろう",
  createdAt: "2024-07-21",
  content: `

  ### 手順
### 1. コード全文（コピペOK）

```java
package com.example.dev_nav.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class FirebaseTokenFilter extends OncePerRequestFilter {

    // 一部APIは認証チェックをスキップ
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        // 公開API（認証不要API）はフィルター自体を無効化
        return path.startsWith("/api/articles");
    }

    // 全APIリクエストのフィルター本体
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = getTokenFromHeader(request); // AuthorizationヘッダーからBearerトークン抽出

        if (token != null) {
            try {
                // FirebaseサーバーでJWTトークンを検証＆ユーザー情報取得
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
                String email = decodedToken.getEmail();
                Boolean isAdmin = (Boolean) decodedToken.getClaims().get("admin");

                // Spring Security用の権限リスト生成
                List<GrantedAuthority> authorities = new ArrayList<>();
                if (Boolean.TRUE.equals(isAdmin)) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                } else {
                    authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                }

                // 認証情報をSpring Securityにセット
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        email, null, authorities
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (FirebaseAuthException e) {
                logger.warn("Firebaseトークンの検証に失敗しました: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    // AuthorizationヘッダーからBearerトークンのみ抽出
    private String getTokenFromHeader(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
```

---

### 2. 行ごとの解説

- **shouldNotFilter**
  - 特定のAPI（例：/api/articles）は認証フィルターをスキップ可能  
    → 公開記事一覧API等に便利

- **doFilterInternal**
  - 全リクエストごとに実行される本体
  - 1. getTokenFromHeader()でBearerトークンを取り出す
  - 2. トークンがあればverifyIdToken()でFirebaseサーバーに正当性チェック
      - → 不正・期限切れならFirebaseAuthExceptionでエラー
  - 3. トークンから「メールアドレス（email）」や「管理者権限（admin）」を取得
  - 4. 権限リストにROLE_ADMINまたはROLE_USERをセット
  - 5. Spring Securityの認証ユーザーとして認定  
     → 以後のController等で「認証済みユーザー」「管理者ユーザー」として扱える

- **getTokenFromHeader**
  - HTTPリクエストヘッダーの"Authorization: Bearer {token}"からtoken部分だけ切り出す便利メソッド

---

### 3. tokenの意味＆verifyIdTokenで何が起きているか

- **token**
  - Firebase認証（ログイン）時に発行される「一意の証明書」（JWTトークン）
  - これをフロントがAPIリクエストに付けてサーバーに送る
- **verifyIdToken(token)**
  - トークンの正当性、期限、改ざん、ユーザー情報…をサーバー側（Google/Firebase）が「全部安全に」チェック
  - チェックOKならFirebaseToken型でユーザーemailやカスタム権限（admin等）が引ける

---

### 4. このフィルターが効いていると何が嬉しい？

- **APIを叩いてきたユーザーが「本当にFirebase認証を通っているか」完全に保証できる**
- **認証済みユーザー or 管理者だけ操作可能なAPIも簡単に作れる（Spring Securityの@PreAuthorize等と連携可能）**
- **トークン経由でメールアドレスやuidが確実に取得できるので、DB連携も楽チン！**

---

> **現場ノウハウ：**
> フィルターによる「トークン検証＆認証情報セット」ができていれば、**REST APIのバックエンドはどんな要件でも拡張OK！**  
> Spring Securityとの組み合わせで爆速・安全なAPIサーバー実装ができます。

---
`,
},
{
  stepNumber: "3-03",
  slug: "spring-security-hasrole-admin-flow",
  title: "adminカスタムクレームとhasRole('ADMIN')ルーティングの連携・流れ解説【バックエンド3-03】",
  author: "やまだたろう",
  createdAt: "2024-07-21",
  content: `

### 手順

### 1. ここからの流れ（次の実装ロードマップ）

1. **フィルターでFirebaseトークン検証＆「admin」カスタムクレーム取得**（もうOK！）
2. **Spring Securityの認可設定（SecurityConfigクラス）で「/api/admin/**」は管理者のみ許可**
3. **Controllerで実際に「管理者専用API」を作成し、挙動確認**

---

```java
public class FirebaseTokenFilter extends OncePerRequestFilter {

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        // 公開API（認証不要API）はフィルター自体を無効化
        return path.startsWith("/api/articles");
    }
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = getTokenFromHeader(request); // AuthorizationヘッダーからBearerトークン抽出

        if (token != null) {
            try {
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
                String email = decodedToken.getEmail();
                Boolean isAdmin = (Boolean) decodedToken.getClaims().get("admin");

                List<GrantedAuthority> authorities = new ArrayList<>();
                if (Boolean.TRUE.equals(isAdmin)) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                } else {
                    authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                }

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        email, null, authorities
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (FirebaseAuthException e) {
                logger.warn("Firebaseトークンの検証に失敗しました: " + e.getMessage());

            }
        }

        filterChain.doFilter(request, response);
    }
    private String getTokenFromHeader(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
```

### 2. そもそも「hasRole('ADMIN')」は何を見ているのか？

- **「認証済みユーザーが持つ「ROLE_ADMIN」権限を持っているか？」をSpring Securityが判定している**
- フィルター（FirebaseTokenFilter）で
    ```java
    if (Boolean.TRUE.equals(isAdmin)) {
        authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
    } else {
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
    }
    ```
  というコードで**Spring Securityの「GrantedAuthority（権限）」にROLE_ADMINを持たせている**

---

### 3. 全体の“つながり”はこう

1. **フロントでログイン→管理者ユーザーにはadminクレーム（admin: true）が埋め込まれる**
2. **APIリクエスト時にidToken（JWT）をBearerヘッダーで送信**
3. **バックエンドのフィルターでverifyIdToken(token)→カスタムクレームadmin取得**
4. **admin: trueならSpring Security用に「ROLE_ADMIN」権限を付与**
5. **SecurityConfigで「.requestMatchers('/api/admin/**').hasRole('ADMIN')」で認可制御**

---

### 4. Spring Securityの設定例

```java
// SecurityConfig.java
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/admin/**").hasRole("ADMIN") // 管理者のみ
                .requestMatchers("/api/public/**", "/api/articles/**").permitAll() // 誰でもOK
                .anyRequest().authenticated() // それ以外は認証必須
            );
        return http.build();
    }
}
```

---

### 5. まとめ図：**カスタムクレームadmin → hasRole("ADMIN")の流れ**

1】Firebaseでユーザー作成
→ 管理者ユーザーだけに「admin: true」カスタムクレーム付与

【2】フロントがログイン→IDトークン(JWT)を取得

【3】APIリクエストに「Authorization: Bearer {token}」で送信

【4】バックエンドのFilterが
→ verifyIdToken(token)でトークン検証
→ admin: trueならROLE_ADMIN権限セット

【5】SecurityConfigの
.requestMatchers("/api/admin/**").hasRole("ADMIN")
でアクセス制御！

【6】/api/admin/** へのアクセスは
→ ROLE_ADMIN権限（管理者クレーム持ち）だけOK


---

### 6. 【現場ポイント】

- **ROLE_〇〇はSpring Securityの慣習名（ROLE_ADMIN, ROLE_USERなど）**
- **「hasRole("ADMIN")」→「ROLE_ADMIN」を探しにいく！**
    - authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN")); で付与した権限とマッチ
- **カスタムクレーム名（admin）とROLE名（ADMIN）は、対応づける実装をしてるだけで「自動でマッピングされる」わけじゃない**
    - 必ず**自分でif文等で紐付けてあげる必要あり**

---

### 7. もし管理者APIだけにしたい場合の流れ

- **/api/admin/** で管理者用API（記事削除、BAN、設定変更など）を作る
- Controllerには普通に
    ```java
    @RestController
    @RequestMapping("/api/admin")
    public class AdminController {
        @GetMapping("/secret")
        public String adminOnly() {
            return "管理者だけ見える秘密情報！";
        }
    }
    ```
- **このAPIはhasRole("ADMIN")でガッチリガードできる**

---

> **現場ノウハウ：**  
> ここまでできていれば「現代的な認可の設計」を最短ルートで実現できてます。  
> 次は**「管理者権限のテスト」「他ロール追加」「Spring Securityの@PreAuthorize活用」**など、いくらでも発展できます！

---
`,
},
{
  stepNumber: "4-01",
  slug: "spring-firebase-authservice-helper",
  title: "Firebase認証トークン便利ユーティリティ（メール・管理者判定）サービス層リファクタ【バックエンド3-04】",
  author: "やまだたろう",
  createdAt: "2024-07-21",
  content: `
### 1. サービス層に「認証・権限チェックの共通ロジック」をまとめる意義

- コントローラーから**「tokenの検証・ユーザーのメール抽出・管理者権限チェック」**を直接書くと超冗長＆コピペ地獄になる
- そこで**サービス層（例：FirebaseAuthService）**に「共通ユーティリティ」として分離・リファクタ
- 他のサービスやControllerから**「一発でメール抽出＆権限チェック」**を呼べる便利関数に

---

### 2. コード全文

```java
package com.example.tech.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FirebaseAuthService {

    /**
     * トークンを検証し、admin権限を持っていれば email を返す。
     * 権限がない or トークン無効なら例外スロー。
     */
    public String verifyAdminAndGetEmail(String token) {
        String idToken = token.replace("Bearer ", "");

        FirebaseToken decodedToken;
        try {
            decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
        } catch(FirebaseAuthException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"トークンの検証に失敗しました。");
        }

        boolean isAdmin = Boolean.TRUE.equals(decodedToken.getClaims().get("admin"));

        if(!isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,"管理者のみが実行できます。");
        }

        return decodedToken.getEmail();
    }

    /**
     * 権限チェックなしでメールのみ抽出
     */
    public String verifyAndGetEmail(String token) {
        String idToken = token.replace("Bearer ", "");

        FirebaseToken decodedToken;
        try {
            decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
        } catch(FirebaseAuthException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"トークンの検証に失敗しました。");
        }

        // admin権限のチェックは不要！
        return decodedToken.getEmail();
    }
}
```

---

### 3. メソッドごとの**ポイント解説**

- **verifyAdminAndGetEmail(token)**
  - AuthorizationヘッダーのBearer xxxxxから**トークンだけ抜き出し**
  - Firebaseで**署名・有効期限等を全チェック**
  - decodedToken.getClaims().get("admin")で**カスタムクレームのadmin判定**
      - **trueであればメールアドレスを返す**
      - **管理者でなければ403（FORBIDDEN）エラーに**
      - **トークン不正なら401（UNAUTHORIZED）**
  - → **管理者APIで一発呼び出せる便利関数**

- **verifyAndGetEmail(token)**
  - **adminチェックせず、「tokenからメールアドレスだけ抽出」**
  - 「誰のリクエストか」だけ知りたいとき（記事投稿者など）に使う
  - 管理者権限が不要なAPIで使える

---

### 4. こういうサービスを用意することで…

- **Controllerや他のサービス層で「毎回トークン検証や権限チェックを書く必要なし」**
- **エラー時の例外処理も共通化できる**
- **「認可の設計」が超わかりやすくなる＆メンテも楽チン！**

---

> **現場Tips：**
> こういう“ヘルパーサービス”が設計にあるだけで、**APIの品質・メンテ性・セキュリティが激変します！**
> どんどん再利用できるよう、ロジックは「サービス層→Controller呼び出し」パターンに整理するのがオススメ！

---
`,
},
{
stepNumber: "4-02",
slug: "spring-admin-article-upload-insomnia",
title: "管理者用 記事画像アップロードAPI（Insomniaでテスト）【バックエンド4-02】",
author: "やまだたろう",
createdAt: "2024-07-21",
content: `

1. エンドポイントの仕様と背景
URL
POST http://localhost:8080/api/admin/add-article

用途
管理者だけが新規記事を画像付きで投稿するAPI

このAPIは管理者JWTトークン、記事情報（slug, title, adminEmail, category, content）、画像ファイル（image）をmultipartで受け付けます。

2. コントローラーの解説


```java
package com.example.dev_nav.controller;

import com.example.dev_nav.dto.request.ArticleRequest;
import com.example.dev_nav.service.AdminService;
import com.example.dev_nav.service.FirebaseAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
@RequestMapping("/api/admin")
public class AdminController {

private final AdminService adminService;
private final FirebaseAuthService firebaseAuthService;
@PostMapping("/add-article")
public ResponseEntity<?> postArticle(
    @RequestHeader(name = "Authorization") String token,
    @RequestParam("image") MultipartFile imageFile,
    @ModelAttribute ArticleRequest request
) {
    String adminEmail = firebaseAuthService.verifyAdminAndGetEmail(token);
    adminService.postArticle(adminEmail, request);
    return ResponseEntity.ok("投稿完了");
}
}
```
ポイント：

AuthorizationヘッダーでJWTトークン（Bearer idToken）を受け取る

imageFileで画像ファイル、requestで本文情報を受け取る

FirebaseAuthServiceで「管理者だけ」許可

投稿成功時は「投稿完了」と返す

3. ArticleRequestの内容
```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ArticleRequest {
    private String slug;
    private String title;
    private String adminEmail;
    private String category;
    private String content;
    private MultipartFile image;
}
```
ArticleRequestには以下のフィールドがある

slug … 記事URL用の一意文字列

title … 記事タイトル

adminEmail … 管理者メール

category … 記事カテゴリ名

content … 記事本文

※画像はimageFileとして別で送る。adminEmailはトークンからサーバ側で上書きしてもOK

4. Insomniaでテストする手順
InsomniaのリクエストBodyタブで「Multipart」タイプを選ぶ

各フィールドを以下のように入力
slug → sample
title → title
adminEmail → admin@example.com
category → React
content → サンプル
image → ts.png（画像ファイルとして追加）

Headersタブで「Authorization: Bearer <idToken>」をセット
<idToken>はフロント側console.log(idToken)などで取得したトークン

【補足】
idTokenはReact側でconst { idToken } = useAuth();として取得し、
console.log(idToken); で好きな画面からトークンを確認・コピペできる。
（例：ログイン後の画面でidTokenが表示できれば便利！）

送信後、「投稿完了」と返ればOK

5. 成功時のInsomnia画面例
slug, title, adminEmail, contentはテキスト

imageはファイルアップロード形式

ステータス 200 OK、bodyに「投稿完了」と表示されればテスト成功

6. 補足・現場TIPS
imageパートを省略すると400エラー（Bad Request）になるため必ず画像ファイルを付ける

JWTトークンがadmin権限でないと403エラー

マルチパート形式で送ればフロントのAPI実装も同じ要領でOK

以上でInsomniaによる管理者記事画像投稿APIのテストが完了します。
`,
},
{
stepNumber: "4-03",
slug: "spring-admin-article-upload-file-save",
title: "管理者用 記事画像アップロードAPI（サーバ保存対応+Insomniaテスト）【バックエンド4-03】",
author: "やまだたろう",
createdAt: "2024-07-21",
content: `

1. エンドポイントの仕様と背景

URL  
POST http://localhost:8080/api/admin/add-article

用途  
管理者だけが新規記事を画像付きで投稿し、サーバーのuploadsディレクトリに画像を保存するAPI。

このAPIは管理者JWTトークン、記事情報（slug, title, adminEmail, category, content）、画像ファイル（image）をmultipartで受け付け、画像ファイルをサーバー内に保存し、そのパスを記事データとして管理します。

---

2. コントローラーの解説

画像ファイル保存まで対応した改良版です。

```java
@RestController
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final FirebaseAuthService firebaseAuthService;

    @PostMapping("/add-article")
    public ResponseEntity<?> postArticle(
        @RequestHeader(name = "Authorization") String token,
        @RequestParam("image") MultipartFile imageFile,
        @ModelAttribute ArticleRequest request
    ) {
        // 1. 管理者認証＆メール取得
        String adminEmail = firebaseAuthService.verifyAdminAndGetEmail(token);

        // 2. 保存ディレクトリの準備
        // uploadsはプロジェクトのカレントディレクトリ直下で作成される
        String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";
        File dir = new File(uploadDir);
        if (!dir.exists() && !dir.mkdirs()) {
            return ResponseEntity.status(500).body("ディレクトリ作成に失敗しました");
        }

        // 3. 画像ファイル名の決定
        String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
        File dest = new File(dir, fileName);

        // 4. 画像ファイルの保存
        try {
            imageFile.transferTo(dest);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("画像保存エラー");
        }

        // 5. 公開用画像URLの生成（実運用ではNginxや静的公開パスでマッピングを意識）
        String imageUrl = "/uploads/" + fileName;

        // 6. サービス層に投稿処理を依頼（imageUrlを渡す）
        adminService.postArticle(adminEmail, request, imageUrl);

        return ResponseEntity.ok("投稿完了");
    }
}
```

ポイント：

- 管理者認証の後、uploadsディレクトリを自動生成（なければmkdirs）
- 画像ファイル名はタイムスタンプ+元ファイル名で衝突回避
- サーバ保存先パスと公開URLパスを分けて管理可能
- サービス層で画像URL含む記事情報を保存

---

3. ArticleRequestの内容

```java
@Data  
@AllArgsConstructor  
@NoArgsConstructor  
public class ArticleRequest {  
    private String slug;  
    private String title;  
    private String adminEmail;  
    private String category;  
    private String content;  
    private MultipartFile image;  
}
```

slug … 記事URL用の一意文字列  
title … 記事タイトル  
adminEmail … 管理者メール  
category … 記事カテゴリ名  
content … 記事本文  
image … 画像ファイル

画像は@ModelAttributeでなく@ReqeustParam("image")として個別で扱う。

---

4. Insomniaでテストする手順

- リクエストBodyタブで「Multipart」タイプを選択
- slug、title、adminEmail、category、content：テキスト入力
- image：ファイルパートで画像ファイル(ts.png等)を追加
- HeadersでAuthorization: Bearer <idToken>をセット  
  <idToken>はフロントでconst { idToken } = useAuth();のconsole.log(idToken)で取得しコピペ
- 送信して「投稿完了」と返ればOK

---

5. 成功例・現場TIPS

- uploadsディレクトリに画像が保存されているか要確認
- imageパートが抜けると400 Bad Request
- JWTが不正/管理者でない場合403エラー
- 公開URLは静的サーバ設定（Nginx等）と合わせて運用

---

以上でサーバ保存つきの管理者記事画像投稿APIテストの説明は完了です。

`,
},
{
  stepNumber: "4-04",
  slug: "spring-jpa-entity-relation",
  title: "Spring JPAエンティティ設計：UserとArticleのリレーション解説＆初期データ準備【バックエンド4-04】",
  author: "やまだたろう",
  createdAt: "2024-07-21",
  content: `
1. Entity（エンティティ）とは？

Spring Boot（JPA）でDBテーブルとJavaクラスを1対1でマッピングするのがEntity（エンティティ）です。
・@Entityアノテーションで宣言
・各フィールドはテーブルのカラムと一致

2. 今回定義した2つのEntity

A) UserEntity

・usersテーブルを表現
・id（主キー）、email、displayName、createdAt、updatedAt

B) ArticleEntity

・articlesテーブルを表現
・id（主キー）、slug、title、user（UserEntity型）、userEmail、authorName、category、content、imageUrl、createdAt、updatedAt、published

3. リレーションの実装理由とメリット

・@ManyToOneアノテーションで「1ユーザーが複数記事を持つ」リレーションを実現
・ArticleEntity.userはUserEntity型 → 記事から投稿者（ユーザー）の情報を即取得できる

【メリット】
- テーブル設計と実装が自然にリンクする
- 記事データから「投稿者の情報」を即参照できる
- 逆にユーザーから「自分が投稿した記事一覧」も取得しやすい
- 参照整合性（外部キー制約）により「存在しないユーザーに記事がぶら下がる」事故を防げる

4. UserEntity・ArticleEntityのコード抜粋

```java
@Entity
@Table(name = \"users\")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String email;
    private String displayName;
    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = \"articles\")
public class ArticleEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String slug;

    private String title;

    @ManyToOne
    @JoinColumn(name = \"user_id\")
    private UserEntity user;

    private String userEmail;
    private String authorName;
    private String category;
    @Column(columnDefinition = \"TEXT\")
    private String content;
    private String imageUrl;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(name = \"is_published\", nullable = false)
    private boolean published = true;
}
```
5. usersテーブルへ初期データをINSERTするSQL

-- usersテーブル作成クエリ（既に存在する場合はスキップ）

```sql
CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
-- 管理者ユーザー追加
```sql
INSERT INTO users (email, display_name)
VALUES ('admin@example.com', '管理者アカウント');
```
-- 確認用
```sql
SELECT * FROM users;
```
【注意】
- すでにテーブルやカラムがあればCREATE文は不要
- 必ずusersテーブルに「記事を紐付けるユーザー（ここではadmin@example.com）」が存在する状態にする

6. まとめ

- JPAリレーションを活用することで、エンティティ同士のつながりがDB設計そのまま実装できる
- データ取得も楽、事故も防げて現場の開発速度UP！
- 記事を投稿する際は必ず対応するユーザーがusersテーブルに存在する必要がある

`
},
{
  stepNumber: "4-05",
  slug: "spring-adminservice-article-method-relation",
  title: "サービス層メソッド全文＆リレーション設計・Lombok自動生成解説【バックエンド4-05】",
  author: "やまだたろう",
  createdAt: "2024-07-21",
  content: `
1. AdminServiceのメソッド全文（コメント付き）

```java
@Service
@RequiredArgsConstructor
public class AdminService {
    private final AdminRepository adminRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    /**
     * 管理者が記事投稿する際のビジネスロジック
     * @param adminEmail 管理者メール
     * @param request 投稿リクエスト（記事情報）
     * @param imageURL 保存した画像のURL
     */
    public void postArticle(String adminEmail, ArticleRequest request, String imageURL) {
        // 1. ArticleEntityをnew
        ArticleEntity entity = new ArticleEntity();

        // 2. ユーザー取得（adminEmailで検索／存在しなければ例外）
        UserEntity user = userRepository.findByEmail(adminEmail)
            .orElseThrow(() -> new RuntimeException(\"ユーザーが見つかりません。\"));

        // 3. 記事Entityに各プロパティをセット
        entity.setSlug(request.getSlug());
        entity.setTitle(request.getTitle());
        entity.setUser(user); // UserEntity型プロパティでリレーションを貼る
        entity.setUserEmail(user.getEmail());
        entity.setAuthorName(user.getDisplayName());
        entity.setCategory(request.getCategory());
        entity.setContent(request.getContent());
        entity.setImageUrl(imageURL);
        entity.setPublished(true);

        // 4. DBに保存
        articleRepository.save(entity);
    }
}
```
---

2. リレーション設計とEntityのアノテーション

【リレーションの考え方・理由】
- 1人のユーザーが複数記事を持つ（1対多）→ ArticleEntityがUserEntityを参照
- 記事→投稿者の情報を簡単に取得できる（user.getDisplayName()など）
- 逆にUser側から「投稿記事一覧」を持たせるなら@OneToManyでも拡張可能

【コード抜粋とアノテーション解説】
```java
@Entity
@Table(name = \"articles\")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ArticleEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne // (1つの記事に1人のユーザーが紐づく)
    @JoinColumn(name = \"user_id\")
    private UserEntity user;

    // ...その他省略
}

@Entity
@Table(name = \"users\")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String email;
    private String displayName;
    // ...その他省略
}
```
【@ManyToOne, @JoinColumn】
- ArticleEntity.userは「UserEntity型」→ 記事から投稿者をオブジェクトで取得
- @JoinColumnでDB上はuser_idカラムとして保存

---

3. Lombokアノテーション(@Data, @AllArgsConstructor, @NoArgsConstructor)の効果

- @Data … 全フィールドのgetter/setter, equals, hashCode, toString自動生成
- @AllArgsConstructor … 全フィールド引数のコンストラクタ自動生成
- @NoArgsConstructor … 引数なしコンストラクタ自動生成

→ 各Entityクラスで「getter/setterを自分で書かなくてもOK」になる  
→ 記事Entityのentity.setXxx()や、user.getEmail()などが即利用できる

---

4. まとめ

- サービス層で「エンティティ生成＋リレーション張り＋プロパティセット＋保存」まで一気にできる
- リレーションで「記事とユーザー」のつながりがDB・コード両方で安全に管理できる
- Lombokアノテーションでボイラープレート削減・設計もシンプル化

`
},
{
   stepNumber: "4-06",
slug: "spring-article-upload-insomnia-db-check",
title: "Insomniaで記事画像アップロードAPIをテスト→DB反映確認【バックエンド4-06】",
author: "やまだたろう",
createdAt: "2024-07-21",
content: `

Insomniaで記事投稿APIを再テスト

前回作成した管理者用記事投稿API（/api/admin/add-article）に、
Insomniaから「画像付き」でPOSTリクエストを送ります。

【手順】

Bodyタブで「Multipart」タイプを選択

slug … test-slug

title … サンプルタイトル

adminEmail … admin@example.com（実際はサーバ側でtokenから上書き推奨）

category … React

content … サンプル本文

image … 任意の画像ファイル（pngなど）

Headersタブで「Authorization: Bearer <idToken>」をセット

idTokenはReactフロントでuseAuthなどから取得・console.logでコピー

送信後、ステータス200で「投稿完了」とレスポンスが返ればOK

WorkbenchでDBにデータが入っているか確認

MySQL WorkbenchやDBeaverなどで、
articlesテーブルをSELECTして投稿内容が保存されていれば成功。

例）
SELECT * FROM articles ORDER BY id DESC;

画像ファイル名やアップロード先URL、user_id（投稿者のid）も保存されている

usersテーブルにもadmin@example.com（管理者）が存在し、user_idが紐づいている

ここまでできれば「フロント→API→DBまで一気通貫」の投稿動線が実現できたことになる

【よくあるトラブル】

画像ファイルがuploadsディレクトリに保存されているか

user_idの外部キーが一致しているか（admin@example.comがusersテーブルに必須）

まとめ

Insomniaで「画像付き記事投稿API」をテストし、DBで記事データが入ったことを確認

これで管理者がWeb管理画面から投稿→API経由で保存→DB反映という流れが動作

現場感として「Insomniaで200OK＆DB反映まで確認できたら基礎はクリア」です！
`
},

{
   stepNumber: "5-01",
slug: "frontend-adminroute-setup",
title: "React 管理者専用ルート（AdminRoute）の実装とRoute設定【フロントエンド5-02】",
author: "やまだたろう",
createdAt: "2024-07-21",
content: `

## 1. 何を作るのか？

- 管理者だけがアクセスできるページ（例：管理者ダッシュボード/AdminPage）を作りたい
- 通常ユーザーや未ログインユーザーはリダイレクトしたい

---

## 2. React Routerでの「管理者専用ルート」設計の注意

- \`<Routes>\`配下は必ず\`<Route>\` or \`<React.Fragment>\`でなければならない
- つまり「ラッパーコンポーネント（AdminRoute）」を素でネストはNG
- → **element属性でラップする方法が定石**

---

## 3. AdminRouteコンポーネント実装例

```tsx
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext"; 
import { Navigate } from "react-router-dom";

export const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { isAdmin, loading } = useAuth();

  if (loading || isAdmin === null) return <p>Loading...</p>;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
};
```

- \`useAuth\`で管理者判定（isAdmin）・ローディング状態取得
- \`loading\`なら「Loading...」表示
- 管理者でなければトップにリダイレクト
- 管理者のみ子要素（管理画面など）を表示

---

## 4. ルーティング設定例

```tsx
import { Routes, Route } from "react-router-dom";
import { AdminRoute } from "./components/AdminRoute";
import { AdminPage } from "./pages/AdminPage";
import { HomePage } from "./pages/HomePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />
    </Routes>
  );
}
```

---

## 5. ポイントまとめ

- 管理者判定は必ず**element属性の中でAdminRouteラップ**で書く
- \`<AdminRoute><AdminPage /></AdminRoute>\`の形にすることで**柔軟にガード可**
- 複数ページをまとめてガードしたいときは\`<Outlet>\`方式も活用できる（詳細は別途）

---

> **Tips**
>
> - \`useAuth\`のisAdminがnull/undefinedならローディング状態扱い
> - フロントで管理者フラグを簡単に扱える設計がベスト
> - 本番ではAPI側も必ず管理者判定をすること！

---
`

},
{
   stepNumber: "5-02",
slug: "frontend-adminpage-menu-ui",
title: "管理者ページ（AdminPage）の実装例とサイドメニュー切り替え【フロントエンド5-03】",
author: "やまだたろう",
createdAt: "2024-07-21",
content: `

## 1. 何を作るのか？

- 管理者専用ページ（AdminPage）のUI
- サイドメニューで「ダッシュボード／記事投稿／文法投稿／記事一覧…」等を切り替え
- クリックで即座にコンポーネント切替
- まだデータがない機能（例：記事一覧）はエラーになる場合がある

---

## 2. サンプル実装例（コピーOK）

```tsx
import { useState } from "react";
import { AddArticleForm } from "./components/AddArticleForm";
import { AddSyntaxForm } from "./components/AddSyntaxForm";
import { AdminArticleList } from "./components/AdminArticleList";
import { AdminSyntaxList } from "./components/AdminSyntaxList";
import { AdminQAPage } from "./components/AdminQAPage";
import { AdminDashboard } from "./components/AdminDashboard";
// ...必要なら他のimport

export const AdminPage = () => {
  // サイドメニューの定義
  const menus = [
    { key: "dashboard", name: "ダッシュボード", icon: "🏠" },
    { key: "add-article", name: "技術記事投稿", icon: "📝" },
    { key: "add-syntax", name: "基本文法投稿", icon: "📝" },
    { key: "articles", name: "記事一覧", icon: "📄" },
    { key: "syntaxes", name: "文法一覧", icon: "📄" },
    { key: "qa", name: "Q&A管理", icon: "❓" },
  ];

  // 現在アクティブなメニュー
  const [active, setActive] = useState("dashboard");

  // メイン表示を切り替える
  const renderContent = () => {
    switch (active) {
      case "dashboard":
        return <AdminDashboard />;
      case "add-article":
        return <AddArticleForm />;
      case "add-syntax":
        return <AddSyntaxForm />;
      case "articles":
        return <AdminArticleList />;
      case "syntaxes":
        return <AdminSyntaxList />;
      case "qa":
        return <AdminQAPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* サイドメニュー */}
      <aside className="w-56 bg-zinc-950 py-8 flex flex-col gap-2">
        {menus.map((menu) => (
          <button
            key={menu.key}
            onClick={() => setActive(menu.key)}
            className={\`flex items-center gap-3 px-6 py-3 text-lg font-semibold rounded-l-xl transition
              \${
                active === menu.key
                  ? "bg-blue-700 text-white"
                  : "bg-zinc-950 text-zinc-300 hover:bg-zinc-800"
              }\`}
          >
            <span className="text-2xl">{menu.icon}</span>
            <span>{menu.name}</span>
          </button>
        ))}
      </aside>

      {/* メインエリア */}
      <main className="flex-1 bg-gray-950 p-10">{renderContent()}</main>
    </div>
  );
};
```

---

## 3. 注意点・現場Tips

- サイドバーのボタンで**setActive**を使ってメニュー状態を切り替え
- 最初は"dashboard"（ダッシュボード）タブから表示
- 各メニューは対応するコンポーネント（例：AddArticleForm, AdminArticleListなど）をrenderContent関数で出し分け
- **まだ投稿がないとき、記事一覧や文法一覧は「エラーや空表示」になるのは正常**  
→ 投稿機能から記事を追加すればOK！

---

## 4. どんな設計にも拡張しやすい

- メニュー項目を配列で管理しているため、項目追加・順番入れ替えも1行で可能
- 管理者ページ専用のUIデザインもclassNameやTailwindでカスタムしやすい

---

> **Tips**
>
> - 実際の業務ではAdminPageのレイアウトを個別のサブページ（ルーティング）で分けることも多い
> - 今回は「1画面でサイド切り替え」形式で完結・体験できる
> - 記事が投稿されていないときにAdminArticleList等でエラーが出ても**仕様上問題なし**  
> → 必要なら「投稿がありません」と表示するハンドリングを追加してもOK！

---
`
`
},
{
   stepNumber: "5-03",
slug: "frontend-article-form-setup-markdown-image",
title: "記事投稿フォーム:AddArticleForm実装  --準備（画像/Markdown/型エラー対応）",
author: "やまだたろう",
createdAt: "2024-07-21",
content: `

### 1. 記事投稿フォームで必要なパッケージ

- 画像アップロード：input type="file"
- マークダウン：react-markdown
- コードハイライト：react-syntax-highlighter

#### 必要なnpmコマンド

```bash
npm install react-markdown react-syntax-highlighter
```

---

### 2. react-syntax-highlighter導入時のTypeScriptエラーについて

```ts
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
```

**このとき、下記の型エラーが出ることがあります：**

> モジュール 'react-syntax-highlighter/dist/esm/styles/prism' の宣言ファイルが見つかりませんでした。
>
> '/node_modules/react-syntax-highlighter/dist/esm/styles/prism/index.js' は暗黙的に 'any' 型になります。

#### **→ 対応方法：型定義ファイル（custom.d.ts）を自作**

- プロジェクトのsrc直下などに
  custom.d.tsファイルを作成し、下記をコピペ

```ts
declare module 'react-syntax-highlighter/dist/esm/styles/prism';
```

これで型エラーは消えます（VSCodeの型チェッカー再起動推奨）。

> **テーマ複数使う場合：**
> 
> ```ts
> declare module 'react-syntax-highlighter/dist/esm/styles/*';
> ```

---

### 3. 記事投稿フォームのサンプル（概要）

```tsx
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useState } from "react";
import ReactMarkdown from "react-markdown"; // 追加
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export const AddArticleForm = () => {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const categories = [
    "Spring",
    "React",
    "Vue",
    "Firebase",
    "Tailwind",
    "Other",
  ];

  const { idToken, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    if (loading) return;
    e.preventDefault();
    if (!slug || !title || !category || !content || !imageFile) {
      alert("すべての項目を入力してください");
      return;
    }

    const formData = new FormData();
    formData.append("slug", slug);
    formData.append("title", title);
    formData.append("category", category);
    formData.append("content", content);
    formData.append("image", imageFile);

    try {
      await axios.post("/api/admin/add-article", formData, {
        headers: {
          Authorization: Bearer {idToken},
        },
      });
      setSlug("");
      setTitle("");
      setCategory("");
      setContent("");
      setImageFile(null);
      alert("投稿しました。");
    } catch (err) {
      console.error("❌ 投稿失敗", err);
      alert("投稿に失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-8 max-w-3xl mx-auto">
        <button
          type="button"
          className="mb-4 px-4 py-2 bg-gray-600 rounded text-white"
          onClick={() => setIsPreviewOpen(true)}
        >
          プレビューを見る
        </button>

        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <input
            className="w-full text-black border p-2"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="スラッグ（URL識別子）"
          />
          <input
            className="w-full text-black border p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトル"
          />
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

          <textarea
            className="w-full text-black border p-2"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="内容"
            rows={40}
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
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            投稿
          </button>
        </form>

        {/* プレビューモーダル */}
        {isPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div
              className="bg-gray-900 rounded-xl shadow-lg p-6 max-w-2xl w-full relative
                 max-h-[80vh] flex flex-col"
            >
              <button
                className="absolute top-2 right-3 text-xl text-white"
                onClick={() => setIsPreviewOpen(false)}
              >
                ×
              </button>
              <div className="font-bold mb-3 text-white">プレビュー</div>
              <div
                className="prose prose-invert max-w-none bg-white p-4 rounded
                        flex-1 overflow-y-auto break-words"
                style={{ maxHeight: "60vh" }} // 必要ならJSX styleで補強
              >
                <ReactMarkdown
                  children={content}
                  components={{
                    code({ className, children, ...props }) {
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

```

---

### 4. **まとめ・現場Tips**

- コードハイライトやMarkdownプレビュー導入には型定義ファイル自作がほぼ必須
- 画像アップロード・マークダウン・コードプレビュー全部入りのフォームを1ページで作ると実務力アピール度UP！
- 型エラーは自作d.tsで解決しよう

---
`

},
{
  stepNumber: "5-04",
  slug: "frontend-vie-cra-proxy-axios-post-article",
  title: "Vite/CRAのAPIプロキシ設定・slug注意・投稿フォームから記事投稿！【フロントエンド】",
  author: "やまだたろう",
  createdAt: "2024-07-21",
  content: `

### 1. Viteの場合（vite.config.tsで設定）

Viteではpackage.jsonの"proxy"は効かないので**vite.config.ts**に設定！

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
});
```

- サーバ設定変更後は必ず\`npm run dev\`を再起動

---

### 2. CRA（Create React App）の場合

```json
// package.json
"proxy": "http://localhost:8080",
```

- package.jsonに\`"proxy"\`を追加すればOK

---

### 3. Axiosでフォーム送信するサンプル

```ts
const formData = new FormData();
formData.append("slug", slug);
formData.append("title", title);
formData.append("category", category);
formData.append("content", content);
formData.append("image", imageFile);

await axios.post("/api/admin/add-article", formData, {
  headers: {
    Authorization: \`Bearer \${idToken}\`,
  },
});
```

- \`Content-Type\`は自動で\`multipart/form-data\`になる
- 画像は\`File\`型でそのままappend

---

### 4. slugはユニーク！

- slugは記事ごとに**一意（ユニーク）**な文字列が必要
- 例：\`sample\`を何度も使うとDBエラー（重複不可）

---

### 5. 投稿画面の実際のスクリーンショット

**投稿画面のイメージ（public/images/admin-post-example.pngを使う例）**

```md
![ここから投稿してみよう！](/assets/images/admin-post-example.png)
```
<img src="/assets/images/admin-post-example.png" alt="ここから投稿してみよう！" style="max-width:100%;margin:2rem auto;display:block;" />

> ※画像ファイルはpublic/images内に入れてください  
> Vite・CRAどちらもpublic配下はそのまま静的公開されます

---

### 6. まとめ・現場Tips

- **Vite：vite.config.tsのproxyでAPI中継（再起動必須）**
- **CRA：package.jsonのproxyでOK**
- **slugは必ず一意の文字列にする（重複注意！）**
- **画像はinputからFile型をFormDataにappendして送信**

---

### 補足

- 本番環境やVercelではpublic配下の画像もデプロイOK
- 「投稿できない」「404」等はプロキシ設定・APIパス・CORSを再確認

---
`
},
{
   stepNumber: "5-05",
slug: "spring-article-list-pagination-page",
title: "Spring 投稿記事一覧API（ページネーション対応）【バックエンド5-05】",
author: "やまだたろう",
createdAt: "2024-07-21",
content: `

### 1. この章でやること

- 投稿記事を **ページング** で取得するAPIの実装
- 将来的なフロントの「無限スクロール」や「ページ切替」にも対応しやすくする
- 戻り値は **Page<ArticleDTO>** でページ情報も一緒に返す設計

---

### 2. コントローラー（記事一覧API）

```java
// 管理者用 記事一覧取得API（ページネーション対応）
@GetMapping("/articles")
public ResponseEntity<Page<ArticleDTO>> getAllArticles(
    @RequestHeader(name = "Authorization") String token,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size
) {
    Pageable pageable = PageRequest.of(page, size);  // ページ番号・サイズ指定
    String adminEmail = firebaseAuthService.verifyAdminAndGetEmail(token);  // 管理者認証
    Page<ArticleDTO> articles = articleService.findAllArticles(adminEmail, pageable);
    return ResponseEntity.ok(articles);
}
```

- **@GetMapping("/articles")** でURLは /api/admin/articles
- **page, size** パラメータでページング可（例：?page=1&size=20）
- 認証済み管理者しか取得できない

---

### 3. サービス層（findAllArticlesメソッド）

```java
// Serviceクラス例
public Page<ArticleDTO> findAllArticles(String adminEmail, Pageable pageable) {
    // 1. 全記事をページングで取得
    Page<ArticleEntity> entities = articleRepository.findAll(pageable);

    // 2. 管理者ユーザー情報の取得（今は未使用・将来管理画面で制御したい時に使える）
    UserEntity user = userRepository.findByEmail(adminEmail)
            .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));

    // 3. Page<ArticleEntity> → Page<ArticleDTO> に変換
    return entities.map(this::convertToArticleDTO);
}
```

- **Page<ArticleEntity>** を **Page<ArticleDTO>** に一発変換（.map()）
- 必要に応じて**管理者ユーザー情報も取得**  
  （管理画面での制御/フィルター等にも活用できる）

---

### 4. DTO変換用メソッド

```java
private ArticleDTO convertToArticleDTO(ArticleEntity entity) {
    ArticleDTO dto = new ArticleDTO();
    dto.setId(entity.getId());
    dto.setSlug(entity.getSlug());
    dto.setTitle(entity.getTitle());
    // エンティティ内のUserリレーション経由でメール取得
    dto.setUserEmail(entity.getUser().getEmail());
    dto.setAuthorName(entity.getAuthorName());
    dto.setCategory(entity.getCategory());
    dto.setContent(entity.getContent());
    dto.setImageUrl(entity.getImageUrl());
    dto.setPublished(entity.isPublished());
    return dto;
}
```

- **DTO = Data Transfer Object**（フロント用に余計な内部情報を持たせない「渡す用クラス」）
- **User情報はリレーション経由で取得**  
  entity.getUser().getEmail()

---

### 5. 型のポイント

- **Page<ArticleDTO>**
  - Spring DataのPage型は、ページ情報（現在ページ、総ページ数、全件数など）も内包
  - フロント実装時に**無限スクロールやページングUI**と相性が良い
- **DTOとEntityは明確に分離**
  - Entityをそのまま返すと、セキュリティ的にも推奨されない
  - DTOを用意して必要なプロパティだけ返す

---

### 6. 補足Tips

- **slugは一意（unique）なので、同じslugで複数記事は投稿不可（バリデーションエラー）**
- **Page<>型の戻り値**  
  → Spring Dataが自動で「何ページ目？」「合計何件？」を返してくれる  
- **今後フロントで「次のページ」取得する場合は?page=1&size=10のようにクエリを付与**

---

> **現場Tips：**
> 一覧表示をPage<>で返しておけば「APIに変更不要」で無限スクロールやページ切替も全部まかなえるので超オススメです！

---
`

},
{
stepNumber: "5-06",
slug: "spring-article-list-insomnia-test",
title: "【Insomnia】Spring 記事一覧APIテストサンプル（ページネーション付き）",
author: "やまだたろう",
createdAt: "2024-07-21",
content: `

### 1. エンドポイント

GET http://localhost:8080/api/admin/articles

---

### 2. 認証

- 必須ヘッダー  
  Authorization: Bearer {idToken}

---

### 3. クエリパラメータ

- page（0始まり、省略時0）
- size（1ページの件数、省略時10）

---

### 4. Insomniaでの設定例

- Method: GET
- URL: http://localhost:8080/api/admin/articles?page=0&size=10
- ヘッダー: Authorization: Bearer {idToken}
- Body: （不要）

---

### 5. コントローラー＆サービスサンプル

```java
// Controller
@GetMapping("/articles")
public ResponseEntity<Page<ArticleDTO>> getAllArticles(
    @RequestHeader(name = "Authorization") String token,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size
) {
    Pageable pageable = PageRequest.of(page, size);
    String adminEmail = firebaseAuthService.verifyAdminAndGetEmail(token);
    Page<ArticleDTO> articles = articleService.findAllArticles(adminEmail, pageable);
    return ResponseEntity.ok(articles);
}

// Service
public Page<ArticleDTO> findAllArticles(String adminEmail, Pageable pageable) {
    Page<ArticleEntity> entities = articleRepository.findAll(pageable);
    // 管理者バリデーション（用途に応じて）
    UserEntity user = userRepository.findByEmail(adminEmail)
            .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));
    return entities.map(this::convertToArticleDTO);
}

private ArticleDTO convertToArticleDTO(ArticleEntity entity) {
    ArticleDTO dto = new ArticleDTO();
    dto.setId(entity.getId());
    dto.setSlug(entity.getSlug());
    dto.setTitle(entity.getTitle());
    dto.setUserEmail(entity.getUser().getEmail());
    dto.setAuthorName(entity.getAuthorName());
    dto.setCategory(entity.getCategory());
    dto.setContent(entity.getContent());
    dto.setImageUrl(entity.getImageUrl());
    dto.setPublished(entity.isPublished());
    dto.setCreatedAt(entity.getCreatedAt());
    dto.setUpdatedAt(entity.getUpdatedAt());
    return dto;
}
```

---

### 6. Entity/DTO定義例

**ArticleEntity（DBの構造を表現）**

```java
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "articles")
public class ArticleEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String slug;   // 記事URL用
    private String title;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;  // 投稿ユーザーとのリレーション

    private String userEmail;
    private String authorName;  // 表示用名
    private String category;
    @Column(columnDefinition = "TEXT")
    private String content;
    private String imageUrl;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(name = "is_published", nullable = false)
    private boolean published = true;
}
```

**ArticleDTO（APIの返却データ用：フロントに渡す）**

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ArticleDTO {
    private Long id;
    private String slug;
    private String title;
    private String userEmail;
    private String authorName;
    private String category;
    private String content;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean published;
}
```

---

### 7. レスポンス例

```json
{
  "content": [
    {
      "id": 1,
      "slug": "sample-article",
      "title": "Reactとは？",
      "userEmail": "admin@example.com",
      "authorName": "管理者ユーザー",
      "category": "React",
      "content": "この記事ではReactの基礎を解説します...",
      "imageUrl": "/uploads/1727371011_sample.png",
      "published": true,
      "createdAt": "2024-07-21T10:12:34",
      "updatedAt": "2024-07-21T10:12:34"
    }
  ],
  "pageable": { ... },
  "totalPages": 1,
  "totalElements": 3,
  ...
}
```

---

### 8. 注意点

- DTOは「フロントに返したい項目だけ」に限定できる
- createdAt, updatedAtはEntityに @CreationTimestamp, @UpdateTimestamp を指定
- Entity⇔DTO変換は「サービス層で責務分離」がベストプラクティス

---
`
},
{

  "stepNumber": "5-07",
  "slug": "frontend-admin-article-list-axios-pagination-edit-delete",
  "title": "【フロント】管理画面 記事一覧表示 サンプル&実装ポイント",
  "author": "やまだたろう",
  "createdAt": "2024-07-21",
  "content": `
## 管理者用 記事一覧取得（最小実装サンプル）

- useEffectとaxiosだけで「管理者トークンで記事一覧を取得」
- 編集・削除などは不要な場合の最小サンプル

---

```tsx
import { useEffect, useState } from "react";
import axios from "axios";
import type { ArticleModel } from "../../../models/ArticleModel";
import { useAuth } from "../../../context/AuthContext";

export const AdminArticleList = () => {
  const [articles, setArticles] = useState<ArticleModel[]>([]);
  const { loading, idToken } = useAuth();

  useEffect(() => {
    // 管理者ログイン＆idToken取得後のみ実行
    if (loading) return;
    const fetchArticles = async () => {
      try {
        const res = await axios.get("/api/admin/articles", {
          headers: {
            Authorization: \`Bearer \${idToken}\`,
          },
        });
        console.log(res.data) ;//res.dataの構造確認しましょう。
        setArticles(res.data.content); // ← ページネーション時はcontent配列をセット
        setTotalPages(res.data.totalPages);
      } catch (e) {
        console.error("記事取得失敗", e);
      }
    };
    fetchArticles();
  }, [loading, idToken]);

  return (
    <div>
      <h2>記事一覧</h2>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>
            {article.title}（{article.slug}）
          </li>
        ))}
      </ul>
    </div>
  );
};
```

---

### ポイント

- **useEffect**で認証後に一回だけ実行
- **axios.get**で記事一覧を取得
- **ページネーション**対応の場合は\`res.data.content\`に配列が入っている
- 編集/削除/公開切替などはあとで追加OK
- \`ArticleModel\`型はサーバー側DTOに合わせて定義しておく

> 「最小サンプル」で開発スタート→徐々に管理機能を足していくのが現場でも定番です！
`
},
{
  stepNumber: "5-08",
  slug: "backend-admin-article-get-by-id",
  title: "【バックエンド】記事詳細取得API & Insomniaテスト",
  author: "やまだたろう",
  createdAt: "2024-07-21",
  content: `
## 管理者用 記事詳細取得API（by ID）

- 管理者が特定の記事詳細を取得するAPIのサンプル
- JPA（Spring Data）のRepository命名規則についても解説
- Insomnia等のAPIクライアントでテスト可

---

### コントローラー

```java
// ArticleController.java
@GetMapping("/articles/{id}")
public ResponseEntity<ArticleDTO> getArticleById(
    @RequestHeader(name = "Authorization") String token,
    @PathVariable Long id
) {
    // Firebase認証で管理者権限を確認し、メールアドレスを取得
    String adminEmail = firebaseAuthService.verifyAdminAndGetEmail(token);

    // サービスで記事DTO取得
    ArticleDTO article = adminService.findById(adminEmail, id);

    // 200 OKで返却
    return ResponseEntity.ok(article);
}
```

---

### サービス

```java
// AdminService.java
public ArticleDTO findById(String adminEmail, Long id) {
    // JPAリポジトリで記事エンティティをID検索
    ArticleEntity entity = articleRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("記事が見つかりません。"));

    // Entity → DTO への値写し（現場だとMapStructやBeanUtilsで自動化も多い）
    ArticleDTO dto = new ArticleDTO();
    dto.setId(entity.getId());
    dto.setSlug(entity.getSlug());
    dto.setTitle(entity.getTitle());
    dto.setUserEmail(adminEmail);
    dto.setAuthorName(entity.getAuthorName());
    dto.setCategory(entity.getCategory());
    dto.setContent(entity.getContent());
    dto.setCreatedAt(entity.getCreatedAt());
    dto.setUpdatedAt(entity.getUpdatedAt());
    return dto;
}
```

---

### JPAリポジトリ命名規則のポイント

- \`findById(id)\`はSpring Data JPAの標準メソッド  
  （エンティティのID主キーで検索する場合は自動で実装される）
- 他にも\`findBySlug(String slug)\`や\`findByCategory(String category)\`など  
  メソッド名でクエリが自動生成される（シグネチャに沿った命名が大事）
- 複雑な検索条件は\`findByTitleContainingAndCategory\`のように組み合わせも可能

---

### Insomniaテスト例

- **GET** \`/api/admin/articles/1 or 2 or 3\`
- Header  
  - Authorization: Bearer {Firebase発行のidToken}

```
GET /api/admin/articles/1
Authorization: Bearer eyJhbGciOi...
```

- レスポンス例（200 OK）

```json
{
  "id": 1,
  "slug": "my-article",
  "title": "記事タイトル",
  "userEmail": "admin@example.com",
  "authorName": "山田太郎",
  "category": "技術",
  "content": "本文...",
  "createdAt": "2024-07-01T12:34:56",
  "updatedAt": "2024-07-15T09:00:00"
}
```

---

### 解説・現場ポイント

- 認証は\`@RequestHeader\`でトークン受け取り→Firebaseで管理者認証
- サービス層で「Entity→DTO」に変換して返却（責務分離）
- JPAのリポジトリは命名だけで基本的な検索が自動で使える（findById, findBySlug, etc）
- InsomniaやPostmanで**トークンつきGETリクエスト**を投げればフロントなしでもAPI動作確認が可能

> バックエンド→APIテスト→フロント連携、の流れが効率的！

`
},
{
  stepNumber: "5-09",
  slug: "backend-admin-article-put-update-image",
  title: "【バックエンド】記事編集（画像アップロード付き）API & Insomniaテスト",
  author: "やまだたろう",
  createdAt: "2024-07-21",
  content: `
## バックエンド：記事編集API（画像アップロード込み・PUT）

- エンドポイント：/api/admin/articles/{id}
- Insomniaで**200 OKが返ればゴール**
- フロントと繋げる前の「動作保証」まで

---

### コントローラー：画像アップロードつき記事編集API

```java
@PutMapping("/articles/{id}")
public ResponseEntity<?> putArticle(
    @RequestHeader(name = "Authorization") String token,
    @RequestParam("image") MultipartFile imageFile,
    @PathVariable Long id,
    @ModelAttribute ArticleRequest request
) {
    // 1. 管理者認証（Firebase）＆メール取得
    String adminEmail = firebaseAuthService.verifyAdminAndGetEmail(token);

    // 2. 保存ディレクトリの準備（プロジェクト直下のuploads）
    String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";
    File dir = new File(uploadDir);
    if (!dir.exists() && !dir.mkdirs()) {
        return ResponseEntity.status(500).body("ディレクトリ作成に失敗しました");
    }

    // 3. ファイル名をユニークに生成
    String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
    File dest = new File(dir, fileName);

    // 4. ファイル保存
    try {
        imageFile.transferTo(dest);
    } catch (IOException e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body("画像保存エラー");
    }

    // 5. 公開用画像URL作成（/uploads/ファイル名形式。静的公開/マッピングは別途実装）
    String imageUrl = "/uploads/" + fileName;

    // 6. サービス層でDB更新（記事更新）
    adminService.putArticle(adminEmail, id, request, imageUrl);

    // 7. 完了レスポンス
    return ResponseEntity.ok("更新完了");
}
```

---

### サービス層：記事更新ロジック

```java
public void putArticle(String adminEmail, Long id, ArticleRequest request, String imageUrl) {
    // 1. 記事（ArticleEntity）が存在するか確認
    ArticleEntity entity = articleRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("記事が見つかりません。"));

    // 2. 管理者ユーザー情報を取得
    UserEntity user = userRepository.findByEmail(adminEmail)
        .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));

    // 3. 記事情報をリクエスト内容で上書き
    entity.setSlug(request.getSlug());
    entity.setTitle(request.getTitle());
    entity.setUser(user); // リレーションのセット
    entity.setUserEmail(user.getEmail());
    entity.setAuthorName(user.getDisplayName());
    entity.setCategory(request.getCategory());
    entity.setContent(request.getContent());
    entity.setImageUrl(imageUrl);
    entity.setPublished(true);

    // 4. 保存
    articleRepository.save(entity);
}
```

---

### Insomniaテスト手順

#### 1. エンドポイントとメソッド

- **PUT** /api/admin/articles/{id}
  - 例：/api/admin/articles/1
- 管理者認証用トークン（Authorizationヘッダ）は必須

#### 2. リクエスト構成（multipart/form-data）

- **Headers**
  - Authorization: Bearer {FirebaseのidToken}

- **Body（Multipart）**
  - image: 画像ファイル選択（ファイルタイプ指定）
  - slug: 例 my-updated-article
  - title: 例 新しいタイトル
  - category: 例 技術
  - content: 例 新しい本文
  - （必要に応じてArticleRequestの全項目）

#### 3. サンプル画面（Insomnia）

- Method: PUT
- URL: http://localhost:8080/api/admin/articles/1
- Headers:  
    Authorization: Bearer [トークン]
- Body（type: multipart/form-data）:
    - image: [ファイルを選択]
    - slug: my-updated-article
    - title: 新しいタイトル
    - category: 技術
    - content: 新しい本文

#### 4. レスポンス例


200 OK
"更新完了"


---

### ポイント・注意

- @RequestParam("image") MultipartFile imageFile と @ModelAttribute ArticleRequest request を組み合わせることで  
  **画像＋テキストの両方**を一度に受け取れる（POSTでもPUTでも同じ構造OK）
- アップロードファイルはプロジェクト直下に保存（公開/ダウンロード設定は別途Nginx等で実施推奨）
- InsomniaやPostmanで「画像つきフォーム送信」がテストできれば、**フロントなしでAPIだけ完成確認**ができる
- エラー時は500や400等で理由を返しているので、API設計のデバッグもしやすい

> 「APIがInsomniaで200 OKになる＝バックエンド完成」は現場でも王道手順です！

`
}
,
{
  stepNumber: "5-10",
  slug: "frontend-admin-article-edit-modal",
  title: "【フロント】管理画面 記事編集 モーダルで編集フォーム表示",
  author: "やまだたろう",
  createdAt: "2024-07-21",
  content: `
## 管理画面 記事編集（編集ボタンクリック → 記事情報取得 → モーダル表示）

- 記事一覧の「編集」ボタン押下で、記事情報を取得し、モーダルに編集フォームとして展開
- 編集前に値を全てフォームのstateへセット
- 取得後にモーダルを開く流れ

---

```tsx
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

// 管理画面の記事一覧コンポーネント例
export const AdminArticleList = () => {
  // 記事リストや認証情報のstate
  const [articles, setArticles] = useState<ArticleModel[]>([]);
  const { loading, idToken } = useAuth();

  // 編集用state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [article, setArticle] = useState<ArticleModel | null>(null);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // 編集ボタンを押したとき
  const handleEdit = async (id: number) => {
    if (loading) return;
    try {
      // idで記事データを取得
      const res = await axios.get(\`/api/admin/articles/\${id}\`, {
        headers: {
          Authorization: \`Bearer \${idToken}\`,
        },
      });
      setArticle(res.data);

      // 取得した内容をフォームstateへ
      setSlug(res.data.slug);
      setTitle(res.data.title);
      setCategory(res.data.category);
      setContent(res.data.content);

      setIsEditModalOpen(true); // モーダル表示
    } catch (err) {
      console.error("❌ 記事取得失敗", err);
      alert("記事情報の取得に失敗しました");
    }
  };

  // 記事更新処理（例。実装は必要に応じて）
  const handleUpdate = async (id: number) => {
    // TODO: 更新API呼び出し
    alert("更新処理は別途実装してください");
  };

  return (
    <div>
      <h2>記事一覧</h2>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>
            {article.title}（{article.slug}）
            <button
              onClick={() => handleEdit(article.id)}
              className="text-blue-400 hover:text-blue-200 text-sm ml-4"
            >
              編集
            </button>
          </li>
        ))}
      </ul>

      {/* 編集モーダル */}
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
    </div>
  );
};
```

---

### ポイント

- **編集ボタン**はarticles.map()内で展開し、クリック時にhandleEdit(article.id)を実行
- **handleEdit**で該当記事の詳細をAPIから取得し、編集用state（slug, title, category, content）にセット
- **isEditModalOpen**がtrueのときだけモーダルを表示
- 入力フォームは取得した値が初期値として反映される
- 画像アップロードもinputで用意（FormDataで送信可能）
- 「キャンセル」でモーダルを閉じ、「更新」でAPIへPUT/PATCHリクエストを投げる設計

> このパターンは実務でも「編集フローの基本形」として多用されます。最小構成から機能追加・拡張もしやすいです！
`
},
{
  stepNumber: "5-11",
  slug: "backend-admin-article-update-put-explanation",
  title: "【バックエンド】記事更新API（PUT）とInsomniaテスト解説",
  author: "やまだたろう",
  createdAt: "2024-07-21",
  content: `
## 記事更新API（PUT）とInsomniaテストのポイント

### ゴール
- InsomniaでPUT http://localhost:8080/api/admin/articles/2
- 200 OK & "更新完了" のレスポンスを受け取れれば合格！

---

### コントローラ実装

```java
@PutMapping("/articles/{id}")
public ResponseEntity<?> putArticle(
    @RequestHeader(name = "Authorization") String token,
    @RequestParam("image") MultipartFile imageFile,
    @PathVariable Long id,
    @ModelAttribute ArticleRequest request
) {
    // 1. 管理者認証＆メール取得
    String adminEmail = firebaseAuthService.verifyAdminAndGetEmail(token);

    // 2. 保存ディレクトリの準備（プロジェクト直下 "uploads"）
    String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";
    File dir = new File(uploadDir);
    if (!dir.exists() && !dir.mkdirs()) {
        return ResponseEntity.status(500).body("ディレクトリ作成に失敗しました");
    }

    // 3. 画像ファイル名の決定（衝突防止のためタイムスタンプを付与）
    String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
    File dest = new File(dir, fileName);

    // 4. 画像ファイルの保存
    try {
        imageFile.transferTo(dest);
    } catch (IOException e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body("画像保存エラー");
    }

    // 5. 公開用画像URLの生成（Nginx/静的サーバのパス想定）
    String imageUrl = "/uploads/" + fileName;

    // 6. サービス層に記事更新処理を依頼
    adminService.putArticle(adminEmail, id, request, imageUrl);

    // 7. 成功レスポンス
    return ResponseEntity.ok("更新完了");
}
```

---

### サービス実装

```java
public void putArticle(String adminEmail, Long id, ArticleRequest request, String imageUrl) {
    // 1. 記事の存在確認と取得
    ArticleEntity entity = articleRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("記事が見つかりません。"));

    // 2. ユーザー（管理者）の存在確認
    UserEntity user = userRepository.findByEmail(adminEmail)
        .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));

    // 3. エンティティの各項目をリクエスト内容で上書き
    entity.setSlug(request.getSlug());
    entity.setTitle(request.getTitle());
    entity.setUser(user); // Userリレーションをセット
    entity.setUserEmail(user.getEmail());
    entity.setAuthorName(user.getDisplayName());
    entity.setCategory(request.getCategory());
    entity.setContent(request.getContent());
    entity.setImageUrl(imageUrl);
    entity.setPublished(true); //（必要に応じて公開フラグ）

    // 4. 保存（JPAで自動的にUPDATEされる）
    articleRepository.save(entity);
}
```

---

### 現場ポイント・解説

- 認証→画像保存→DB更新の流れを1つのAPIで完結させている
- @RequestParam("image") と @ModelAttribute を組み合わせて
  画像＋フォームの複数項目を一度に受け取れる
- 画像ファイル名はSystem.currentTimeMillis()を先頭につけて
  ファイル名の衝突を防止（上書き事故回避）
- 画像保存パスは /uploads/ のように静的公開前提の設計（本番ではNginxやCDNで公開ディレクトリ指定が定番）
- エンティティ保存は articleRepository.save(entity) だけでOK
  → JPAがID一致のエンティティはUPDATEとして扱う
- サービス層の役割
  存在確認、リクエスト値セット、リレーション（User）セット、保存
  責任の分離が明快でテストしやすい

---

### Insomniaテスト手順

1. PUT http://localhost:8080/api/admin/articles/2
2. ヘッダー
    - Authorization: Bearer [FirebaseのidToken]
3. ボディ（multipart/form-data）
    - image: ファイルを選択
    - slug: 新しいスラッグ
    - title: 新しいタイトル
    - category: 新しいカテゴリ
    - content: 新しい本文
    - 他、ArticleRequestの項目があれば全てセット

---

200 OK ＆ "更新完了" が返ってきたらAPI完成！

Insomniaで200 OKが出るまでがバックエンドのゴール
現場の基本です！
`
},
{
  stepNumber: "5-12",
  slug: "frontend-admin-article-update-axios-formdata",
  title: "【フロント】記事編集API PUTリクエスト実装と解説",
  author: "やまだたろう",
  createdAt: "2024-07-21",
  content: `
## フロント：記事編集（更新）APIへのPUTリクエスト実装

### 概要

- モーダルフォームで編集した内容をAPI（PUT）で送信
- 画像アップロード含めた**multipart/form-data**でバックエンドと連携
- 成功時は一覧をリロードし、モーダルを閉じる

---

### 実装サンプル（ボタン押下時）

```tsx
const handleUpdate = async (id: number) => {
  if (loading) return;
  try {
    const formData = new FormData();
    formData.append("slug", slug);
    formData.append("title", title);
    formData.append("category", category);
    formData.append("content", content);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    // PUTでFormData送信
    await axios.put(/api/admin/articles/{id}, formData, {
      headers: {
        Authorization: Bearer {idToken},
      },
    });

    // 一覧をリロードして最新化
    const refreshed = await axios.get("/api/admin/articles", {
      headers: {
        Authorization: Bearer {idToken},
      },
    });
    alert("更新成功");
    setArticles(refreshed.data.content);
    setIsEditModalOpen(false); // モーダル閉じる

  } catch {
    console.error("データ更新失敗");
  }
};
```

---

### 更新ボタン配置（記事編集モーダル内）

```tsx
{article && (
  <button
    onClick={() => handleUpdate(article.id)}
    className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-400"
  >
    更新する
  </button>
)}
```

---

### 現場ポイント・解説

- **FormData**を使うことで、画像ファイル（imageFile）も一緒に送信可能
  - append("image", imageFile) の部分でファイルを追加
- axiosで**PUT＋FormData**送信時、Content-Typeヘッダーはaxios側で自動設定されるので、手動設定は不要
- AuthorizationはBearerトークンを必ず付与（バックエンド認証用）
- 更新後、最新の記事一覧を再取得してsetArticlesで即反映
- setIsEditModalOpen(false)でモーダルを閉じることで、編集体験もスムーズ
- ボタンのonClickで handleUpdate(article.id) を呼び出し。  
  article.idはarticles.mapで展開した各記事のID

---

**これで「バックエンドで200 OK → フロントでモーダル更新→再取得まで」が一連でつながります。**

現場でも「FormDataでPUT＋認証ヘッダー」「リスト再取得」の流れは定番！
`
},
{
  stepNumber: "5-13",
  slug: "backend-admin-article-delete-api",
  title: "【バックエンド】記事削除API（DELETE）とInsomniaテスト解説",
  author: "やまだたろう",
  createdAt: "2024-07-21",
  content: `
## 記事削除API（DELETE）とInsomniaテストのポイント

### ゴール
- InsomniaでDELETE http://localhost:8080/api/admin/articles/2
- 200 OK & "削除完了" のレスポンスで合格！

---

### コントローラ実装

```java
@DeleteMapping("/articles/{id}")
public ResponseEntity<?> deleteArticle(
    @RequestHeader(name = "Authorization") String token,
    @PathVariable Long id
) {
    // 1. 管理者認証（メール取得）
    String adminEmail = firebaseAuthService.verifyAdminAndGetEmail(token);

    // 2. サービス層で削除
    adminService.deleteArticle(id);

    // 3. 成功レスポンス
    return ResponseEntity.ok("削除完了");
}
```

---

### サービス実装

```java
public void deleteArticle(Long id) {
    // 1. 存在確認（なければ例外）
    ArticleEntity entity = articleRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("記事が見つかりません。"));

    // 2. 削除
    articleRepository.deleteById(id);
}
```

---

### 現場ポイント・解説

- 認証後にIDで存在確認し、なければ例外スロー
- deleteById(id) でJPAリポジトリから物理削除（論理削除ならフラグセットに変更も可）
- エラー時は400/404など適切なHTTPステータスを返す設計もオススメ
- DELETEのリクエストにはボディ不要、**認証ヘッダーだけでOK**

---

### Insomniaテスト手順

1. DELETE http://localhost:8080/api/admin/articles/2
2. ヘッダー
    - Authorization: Bearer [FirebaseのidToken]
3. ボディ不要

---

200 OK ＆ "削除完了" が返ってきたらAPI完成！

Insomniaで200 OKが出るまでがバックエンドのゴール  
`
},
{
  stepNumber: "5-14",
  slug: "backend-admin-article-toggle-publish-api",
  title: "【バックエンド】記事公開・非公開切り替えAPI（PUT）とInsomniaテスト解説",
  author: "やまだたろう",
  createdAt: "2024-07-21",
  content: `
## 記事公開・非公開切り替えAPI（PUT）とInsomniaテストのポイント

### ゴール
- InsomniaでPUT http://localhost:8080/api/admin/articles/toggle/4
- 200 OK & "公開状態更新" のレスポンスで合格！
- ※ 直前でDELETEしている場合、**DBで現在のidが存在するか必ず確認してからテスト**すること

---

### コントローラ実装

```java
@PutMapping("/articles/toggle/{id}")
public ResponseEntity<?> togglePublish(
    @RequestHeader(name = "Authorization") String token,
    @PathVariable Long id
) {
    // 1. 管理者認証
    String adminEmail = firebaseAuthService.verifyAdminAndGetEmail(token);

    // 2. サービス層でトグル処理
    adminService.togglePublish(id);

    // 3. レスポンス
    return ResponseEntity.ok("公開状態更新");
}
```

---

### サービス実装

```java
public void togglePublish(Long id) {
    ArticleEntity entity = articleRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("記事が見つかりません。"));

    // 公開・非公開フラグを反転
    entity.setPublished(!entity.isPublished());
    articleRepository.save(entity);
}
```

---

### 現場ポイント・解説

- **idは事前にDBで確認して存在するものを使うこと！**  
  直前にDELETE操作している場合は最新のidを選ぶ（エラー回避）
- toggle方式でワンクリック切り替えができる
- レスポンスメッセージは "公開状態更新" としているが、必要なら現在状態を返すのも実務で多い
- 認証ヘッダーは必須（管理者のみ）

---

### Insomniaテスト手順

1. PUT http://localhost:8080/api/admin/articles/toggle/4
2. ヘッダー
    - Authorization: Bearer [FirebaseのidToken]
3. ボディ不要

---

200 OK ＆ "公開状態更新" が返ってきたらAPI完成！

Insomniaで200 OKが出るまでがバックエンドのゴール  
idの存在はDB（例：phpMyAdminやDBコンソール）で事前確認推奨！
`
},
{
  stepNumber: "5-15",
  slug: "frontend-admin-article-toggle-publish",
  title: "【フロント】記事の公開・非公開切り替えAPI連携",
  author: "やまだたろう",
  createdAt: "2024-07-21",
  content: `
## 記事の公開・非公開切り替え（フロントエンド）

### 概要

- 公開/非公開ボタンでトグルAPIを叩く
- 切り替え後は一覧を再取得して即反映
- 公開状態でボタンの色や表示文言を変えるUI

---

### 実装サンプル

```tsx
const togglePublish = async (id: number) => {
  if (loading) return;
  try {
    await axios.put(/api/admin/articles/toggle/{id}, null, {
      headers: {
        Authorization: Bearer {idToken},
      },
    });
    // 再取得
    const updated = await axios.get("/api/admin/articles", {
      headers: {
        Authorization: Bearer {idToken},
      },
    });
    setArticles(updated.data.content);
  } catch (e) {
    console.error("公開状態切替失敗", e);
  }
};
```

---

### ボタンUI例（記事一覧や編集モーダル内で利用）

```tsx
<button
  onClick={() => togglePublish(article.id)}
  className={text-sm {
    article.published ? "text-green-400" : "text-yellow-400"
  } hover:underline}
>
  {article.published ? "公開中 → 非公開に" : "非公開 → 公開に"}
</button>
```

---

### 現場ポイント・解説

- ボタンを押すだけで「公開・非公開」トグルAPIを叩ける
- 成功後、一覧を再取得することで即時反映
- ボタンの色・テキストで状態が分かりやすいUI設計（現場でもよく使うパターン）
- 管理者権限のBearerトークンは必須
`
},
{
  stepNumber: "5-16",
  slug: "frontend-backend-admin-crud-flow-summary",
  title: "【まとめ】管理画面（adminルート）CRUD全実装の流れ",
  author: "やまだたろう",
  createdAt: "2024-07-21",
  content: `
## 管理画面（adminルート）CRUD全実装の流れまとめ

### ここまでの実装フロー

1. **記事一覧表示（GET）**
   - 認証付きで記事の配列を取得・一覧化

2. **記事詳細取得・編集（GET, PUT）**
   - 編集ボタンでモーダルに情報をセットし、編集フォームを展開
   - 画像アップロード込みで編集API（PUT）へ送信

3. **記事削除（DELETE）**
   - 一覧から削除ボタンでAPI呼び出し・即時反映

4. **公開・非公開トグル（PUT）**
   - 状態切替ボタンからAPIでトグル、一覧リロードで即反映

---

### 現場でよくあるポイント

- **バックエンドAPIがInsomnia/Postmanで200 OKになるまで**をまずゴールにすることで、  
  フロントとAPIの責任範囲が明快になる
- フロントエンドでは「フォーム入力値＋画像」をFormDataで送信するパターンが定番
- 一覧系は「配列で返す」だけでなく、ページング情報付き（content配列）にすることで拡張しやすい
- 公開・非公開切り替え、削除など「ワンクリック反映UI」は管理者向けアプリで超重要

---

### おまけ：ここまでで実装できたこと

- **adminルートからのCRUD（作成・取得・更新・削除）＋状態切り替え**を  
  バックエンドAPIとフロントReact双方で一通り完成！
- 管理画面アプリとして実務レベルの操作性が実現できる状態

> あとは「ユーザー追加/削除」や「多段階権限」「よりリッチなUI」などもこの流れを応用すればOK！
>  
> お疲れ様でした！
`
},
];
module.exports = dummyProcedures;
