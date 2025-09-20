import { useEffect, useState } from "react";

type Props = {
  storageKey?: string; // 複数バナー用に識別したい時に変更
  expireDays?: number; // 何日後に再表示するか（デフォ: 365）
  readmeHref?: string; // 「READMEを見る」リンク先
};

export default function ReadmeNotice({
  storageKey = "readme_notice_dismissed_at",
  expireDays = 365,
  readmeHref = "/readme",
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setOpen(true);
        return;
      }
      const dismissedAt = new Date(raw).getTime();
      const expiresAt = dismissedAt + expireDays * 24 * 60 * 60 * 1000;
      if (Date.now() > expiresAt) setOpen(true);
    } catch {
      // localStorage が使えない環境でも落ちないように
      setOpen(true);
    }
  }, [storageKey, expireDays]);

  const close = () => {
    try {
      localStorage.setItem(storageKey, new Date().toISOString());
    } catch {}
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

// 最小限のインラインスタイル（Tailwind等が無くても動く）
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
