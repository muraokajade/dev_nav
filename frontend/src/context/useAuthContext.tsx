import { User, onAuthStateChanged } from "firebase/auth";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { auth } from "../libs/firebase";

// 認証情報（ユーザー、認証状態、管理者か等）を保持する型を定義
interface AuthContextType {
  currentUser: User | null; // ログイン中のユーザー情報
  isAuthenticated: boolean; // 認証済みかどうか
  loading: boolean; // 認証情報の取得中かどうか
  idToken: string | null; // Firebase IDトークン
  isAdmin: boolean; // 管理者ユーザーかどうか
}

// AuthContextを作成し、初期値（未ログイン状態）を設定
const AuthContext = createContext<AuthContextType>({
  currentUser: null, // ユーザー未ログイン
  isAuthenticated: false, // 未認証
  loading: true, // 初期はローディング中
  idToken: null, // トークン未取得
  isAdmin: false, // 管理者権限なし
});
//useContext(AuthContext) をラップし、どこからでも認証状態を呼び出せるようにする。
export const useAuth = () => useContext(AuthContext);

// 「ログイン状態」や「ユーザー情報」をグローバルに使い回すためのProviderです。
// アプリ全体を <AuthProvider>〜</AuthProvider> で囲んで使うことで、
// どこでも認証情報が参照できるようになります。
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

  // Contextで管理する認証情報をまとめたオブジェクトを作成
  const value: AuthContextType = {
    currentUser, // 現在ログイン中のユーザー
    isAuthenticated: !!currentUser, // ユーザーがいればtrue
    loading, // 認証状態のロード中かどうか
    idToken, // Firebase認証トークン
    isAdmin, // 管理者権限フラグ
  };

  // Contextプロバイダでラップして、子コンポーネントに認証情報を渡す
  return (
    <AuthContext.Provider value={value}>
      {children} 
    </AuthContext.Provider>
  );
};
