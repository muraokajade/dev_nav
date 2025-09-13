import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export function MarkdownWithPrism({ md }: { md: string }) {
  const components = {
    code({ className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      const codeString = String(children ?? "");
      return match ? (
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="pre"
          showLineNumbers
          wrapLongLines={false}
          customStyle={{
            margin: 0,
            borderRadius: 12,
            background: "transparent",
            whiteSpace: "pre",
            fontSize: 13,
            lineHeight: 1.7,
          }}
          codeTagProps={{
            style: {
              whiteSpace: "pre",
              wordBreak: "normal",
              overflowWrap: "normal",
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas",
              fontSize: 13,
              lineHeight: 1.7,
            },
          }}
          {...props}
        >
          {codeString.replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children }: any) => <>{children}</>, // 二重枠防止
  };

  return (
    <div
      className="rounded-2xl border border-white/10 bg-[#0b0f15]/80 p-4 backdrop-blur
                    [word-break:normal] [overflow-wrap:normal] overflow-x-auto"
    >
      <ReactMarkdown components={components}>{md}</ReactMarkdown>
    </div>
  );
}
