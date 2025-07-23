// utils/orderedListAutoInsert.ts

export function getAutoNumberedListValue(
  value: string,
  selectionStart: number
): { newValue: string; newCursor: number } | null {
  const before = value.slice(0, selectionStart);
  const after = value.slice(selectionStart);
  const lines = before.split('\n');
  const currentLine = lines[lines.length - 1];
  const match = currentLine.match(/^(\d+)\. (.*)/);

  if (match) {
    const currentNumber = parseInt(match[1], 10);
    const nextNumber = currentNumber + 1;
    const insertText = `\n${nextNumber}. `;
    const newValue = before + insertText + after;
    const newCursor = before.length + insertText.length;
    return { newValue, newCursor };
  }
  return null;
}
