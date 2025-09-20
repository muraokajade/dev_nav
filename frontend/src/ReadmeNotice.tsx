import { useEffect, useState } from "react";

type Props = {
  storageKey?: string; // 識別子（複数バナー用）
  expireDays?: number; // 何日で再表示するか（デフォ 365）
  readmeHref?: string; // 「READMEを見る」リンク先
};

const SESSION_KEY_PREFIX = "session_"; // フォールバック用

export default function ReadmeNotice({
  storageKey = "readme_notice_dismissed_at",
  expireDays = 365,
  readmeHref = "/readme",
}: Props) {
  const [open, setOpen] = useState(false);

  // util
  const nowMs = () => Date.now();
  const toMs = (iso: string | null) => (iso ? new Date(iso).getTime() : NaN);
  const expMs = (dismissedAtMs: number) =>
    dismissedAtMs + expireDays * 24 * 60 * 60 * 1000;

  const readLocal = () => {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  };
  const writeLocal = (iso: string) => {
    try {
      localStorage.setItem(storageKey, iso);
      return true;
    } catch {
      return false;
    }
  };

  const readSession = () => {
    try {
      return sessionStorage.getItem(SESSION_KEY_PREFIX + storageKey);
    } catch {
      return null;
    }
  };
  const writeSession = (iso: string) => {
    try {
      sessionStorage.setItem(SESSION_KEY_PREFIX + storageKey, iso);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    // セッション記録があれば非表示（戻る/再訪でも出ない）
    const ses = readSession();
    if (ses) {
      setOpen(false);
      return;
    }

    // ローカル記録
    const raw = readLocal();
    if (!raw) {
      setOpen(true);
      return;
    }
    const dismissedAt = toMs(raw);
    if (!Number.isFinite(dismissedAt)) {
      setOpen(true);
      return;
    }
    const expired = nowMs() > expMs(dismissedAt);
    setOpen(expired); // 期限切れなら再表示
  }, [storageKey, expireDays]);

  const close = () => {
    const iso = new Date().toISOString();
    // local がダメなら session にフォールバック
    if (!writeLocal(iso)) {
      writeSession(iso);
    } else {
      // 同一セッション中は確実に出ないよう session にも書いておく
      writeSession(iso);
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div style={styles.wrap} role="dialog" aria-label="READMEのご案内">
      <div style={styles.title}>
        詳しいセットアップ / 環境については README をご覧ください
      </div>
      <p style={styles.text}>
        導入手順・開発環境・設計確認手順を短時間で確認できます。
      </p>
      <div style={styles.actions}>
        <a href={readmeHref} onClick={close} style={styles.linkBtn}>
          READMEを見る
        </a>
        <button onClick={close} style={styles.primaryBtn}>
          後で見る
        </button>
      </div>
    </div>
  );
}

// 最小限インラインCSS（Tailwindなしでも動きます）
const styles: Record<string, React.CSSProperties> = {
  wrap: {
    position: "fixed",
    right: 16,
    bottom: 16,
    zIndex: 50,
    width: "min(480px, 92vw)",
    background: "#fff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 25px rgba(0,0,0,.1)",
    borderRadius: 12,
    padding: 16,
  },
  title: { fontWeight: 600, marginBottom: 6 },
  text: { fontSize: 14, color: "#4b5563", margin: 0 },
  actions: {
    marginTop: 12,
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
  },
  linkBtn: {
    height: 36,
    padding: "0 12px",
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "#fff",
    textDecoration: "none",
    color: "inherit",
  },
  primaryBtn: {
    height: 36,
    padding: "0 12px",
    borderRadius: 8,
    border: "none",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
  },
};
