// components/MarkdownArticle.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export function MarkdownArticle({ md }: { md: string }) {
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
            style: { whiteSpace: "pre", fontSize: 13, lineHeight: 1.7 },
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
    pre: ({ children }: any) => <>{children}</>,
  };

  return (
    <div
      className="space-y-3 text-gray-200 text-[15px] leading-7
                    [&>h2]:text-lg [&>h2]:font-semibold
                    [&>h3]:text-base [&>h3]:font-semibold
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2"
    >
      <ReactMarkdown components={components}>{md}</ReactMarkdown>
    </div>
  );
}
