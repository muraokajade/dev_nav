import React, { useRef } from "react";
import { MarkdownToolbar } from "./MarkdownToolbar";
import { insertMarkdownAtCursor } from "./insertMarkdownAtCursor";
import { getAutoNumberedListValue } from "./orderedListAutoInsert";

type Props = {
  value: string;
  onChange: (val: string) => void;
  rows?: number;
  placeholder?: string;
  /** 追加: 親から高さ制御や余白を渡すため */
  className?: string;
  /** 追加: ツールバーにクラス（sticky化などで使用） */
  toolbarClassName?: string;
};

export const MarkdownTextarea: React.FC<Props> = ({
  value,
  onChange,
  rows = 8,
  placeholder = "",
  className = "",
  toolbarClassName = "",
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Markdown挿入
  const handleInsert = (before: string, after = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const {
      text: newText,
      selectionStart,
      selectionEnd,
    } = insertMarkdownAtCursor(textarea, value, before, after);
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = selectionStart;
      textarea.selectionEnd = selectionEnd;
    }, 1);
  };

  // 番号付きリスト自動補完
  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter") {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const result = getAutoNumberedListValue(value, textarea.selectionStart);
      if (result) {
        e.preventDefault();
        onChange(result.newValue);
        setTimeout(() => {
          textarea.focus();
          textarea.selectionStart = textarea.selectionEnd = result.newCursor;
        }, 1);
      }
    }
  };

  return (
    <div className={`flex flex-col h-full min-h-0 ${className}`}>
      <div className={`pb-2 ${toolbarClassName}`}>
        <MarkdownToolbar onInsert={handleInsert} />
      </div>
      <div className="flex-1 min-h-0">
        <textarea
          ref={textareaRef}
          className="w-full z-10 h-full resize-none outline-none bg-white text-black border p-2 rounded"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleTextareaKeyDown}
          rows={rows} // 高さ100%指定時は実質無視
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};
