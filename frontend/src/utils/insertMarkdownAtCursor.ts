// utils/insertMarkdownAtCursor.ts

export type InsertResult = {
  text: string;
  selectionStart: number;
  selectionEnd: number;
};

/**
 * テキストエリアでMarkdown記法をカーソル位置や選択範囲に挿入する
 */
export function insertMarkdownAtCursor(
  textarea: HTMLTextAreaElement,
  value: string,
  before: string,
  after: string = ""
): InsertResult {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end);

  const text =
    value.slice(0, start) +
    before +
    selected +
    after +
    value.slice(end);

  // カーソル位置計算
  const selectionStart = start + before.length;
  const selectionEnd = selectionStart + selected.length;

  return { text, selectionStart, selectionEnd };
}
