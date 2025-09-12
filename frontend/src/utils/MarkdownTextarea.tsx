import React, { useRef } from "react";
import { MarkdownToolbar } from "./MarkdownToolbar";
import { insertMarkdownAtCursor } from "./insertMarkdownAtCursor";
import { getAutoNumberedListValue } from "./orderedListAutoInsert";

type Props = {
  value: string;
  onChange: (val: string) => void;
  rows?: number;
  placeholder?: string;
};

export const MarkdownTextarea: React.FC<Props> = ({
  value,
  onChange,
  rows = 8,
  placeholder = "",
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
    <div>
      <MarkdownToolbar onInsert={handleInsert} />
      <textarea
        ref={textareaRef}
        className="w-full bg-white text-black border p-2 rounded"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleTextareaKeyDown}
        rows={rows}
        placeholder={placeholder}
      />
    </div>
  );
};
