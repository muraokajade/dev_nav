// components/LoginCTA.tsx
import { Link } from "react-router-dom";
export const LoginCTA: React.FC<{ text: string }> = ({ text }) => (
  <div className="mt-3 text-zinc-300">
    <p className="mb-2">{text}</p>
    <Link to="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded">
      ログイン / 新規登録へ
    </Link>
  </div>
);
