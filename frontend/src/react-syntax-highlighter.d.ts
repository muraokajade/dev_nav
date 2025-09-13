// src/types/react-syntax-highlighter.d.ts
declare module "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
// ========== ベース本体 ==========
declare module "react-syntax-highlighter" {
  import * as React from "react";

  export interface SyntaxHighlighterProps
    extends React.HTMLAttributes<HTMLElement> {
    language?: string;
    style?: any;
    showLineNumbers?: boolean;
    startingLineNumber?: number;
    wrapLongLines?: boolean;
    PreTag?: string | React.ComponentType<any>;
    CodeTag?: string | React.ComponentType<any>;
    lineNumberStyle?:
      | React.CSSProperties
      | ((lineNumber: number) => React.CSSProperties);
    customStyle?: React.CSSProperties;
    className?: string;
  }

  // 既定エクスポート（Prism/HLJS どちらでも使える最低限）
  const SyntaxHighlighter: React.ComponentType<SyntaxHighlighterProps>;
  export default SyntaxHighlighter;

  // Prism 系
  export const Prism: React.ComponentType<SyntaxHighlighterProps>;
  export const PrismAsync: React.ComponentType<SyntaxHighlighterProps>;

  // PrismLight（言語を動的登録する時に使う）
  export const PrismLight: React.ComponentType<SyntaxHighlighterProps> & {
    registerLanguage: (name: string, grammar: any) => void;
  };
}

// ========== スタイル（テーマ） ==========
declare module "react-syntax-highlighter/dist/esm/styles/prism" {
  // よく使う oneDark を個別に露出（型は any で十分）
  export const oneDark: any;
  const styles: any;
  export default styles;
}

declare module "react-syntax-highlighter/dist/esm/styles/hljs" {
  const styles: any;
  export default styles;
}

// ========== Prism 言語モジュール ==========
// ワイルドカードで一括宣言（tsx / typescript / javascript / jsx / java / bash / json / yaml / sql / python / css / markup など）
declare module "react-syntax-highlighter/dist/esm/languages/prism/*" {
  const grammar: any;
  export default grammar;
}
declare module "react-syntax-highlighter/dist/esm/prism-light";
// ==========（必要なら）CJS ビルドにも対応したい場合だけ有効化 ==========
/*
declare module "react-syntax-highlighter/dist/cjs/languages/prism/*" {
  const grammar: any;
  export default grammar;
}
declare module "react-syntax-highlighter/dist/cjs/styles/prism" {
  export const oneDark: any;
  const styles: any;
  export default styles;
}
*/
