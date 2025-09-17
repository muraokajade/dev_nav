// src/components/MarkdownRenderer.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export const MarkdownRenderer: React.FC<{ md: string }> = ({ md }) => {
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
          }}
          codeTagProps={{
            style: {
              whiteSpace: "pre",
              wordBreak: "normal",
              overflowWrap: "normal",
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas",
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
    pre: ({ children }: any) => <>{children}</>,
  };
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {md}
    </ReactMarkdown>
  );
};
export default MarkdownRenderer;
