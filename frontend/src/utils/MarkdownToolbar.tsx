import React, { useState } from "react";

type Props = {
  onInsert: (before: string, after?: string) => void;
};

const LANGUAGES = [
  { label: "言語を選択", value: "" }, // 追加: デフォルト
  { label: "JavaScript", value: "js" },
  { label: "TypeScript", value: "ts" },
  { label: "TSX", value: "tsx" },
  { label: "Java", value: "java" },
  { label: "Bash", value: "bash" },
  { label: "SQL", value: "sql" },
  { label: "Python", value: "python" },
  { label: "JSON", value: "json" },
  { label: "Shell", value: "shell" },
  { label: "YAML", value: "yaml" },
  // ... 必要に応じて追加
];

export const MarkdownToolbar: React.FC<Props> = ({ onInsert }) => {
  const [lang, setLang] = useState("");

  return (
    <div className="mb-2 flex gap-2 items-center">
      <button type="button" className="px-2 py-1 bg-gray-700 text-white rounded" title="見出し1" onClick={() => onInsert("# ")}>H1</button>
      <button type="button" className="px-2 py-1 bg-gray-700 text-white rounded" title="見出し2" onClick={() => onInsert("## ")}>H2</button>
      <button type="button" className="px-2 py-1 bg-gray-700 text-white rounded" title="番号なしリスト" onClick={() => onInsert("- ")}>ul</button>
      <button type="button" className="px-2 py-1 bg-gray-700 text-white rounded" title="番号付きリスト" onClick={() => onInsert("1. ")}>ol</button>

      <select
        className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1"
        value={lang}
        onChange={e => setLang(e.target.value)}
        title="コードブロックの言語"
      >
        {LANGUAGES.map((l) => (
          <option key={l.value} value={l.value}>{l.label}</option>
        ))}
      </select>
      <button
        type="button"
        className="px-2 py-1 bg-gray-700 text-white rounded"
        title="選択した言語でコードブロックを挿入"
        onClick={() =>
          onInsert(
            `\n\`\`\`${lang ? lang : ""}\n`,
            "\n```" + "\n"
          )
        }
      >
        {"</>"}
      </button>
    </div>
  );
};
