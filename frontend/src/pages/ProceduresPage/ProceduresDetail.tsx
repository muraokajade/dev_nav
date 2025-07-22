// src/pages/ProceduresDetail.tsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { dummyProcedures } from "./dummyProcedures";

export const ProceduresDetail = () => {
  const { idAndSlug } = useParams();
  // "1-01-setup-react-tailwind" → "1-01"
  const stepNumber = idAndSlug?.split("-").slice(0, 2).join("-");

  const procedure = dummyProcedures.find((p) => p.stepNumber === stepNumber);

  if (!procedure) {
    return <div className="text-white p-8">手順が見つかりません</div>;
  }

  return (
    <div className="text-white p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {procedure.stepNumber} {procedure.title}
      </h1>
      <div className="mb-2 text-gray-400 text-sm">
        著者: {procedure.author} ／ 日付: {procedure.createdAt}
      </div>
      <hr className="my-4 border-gray-700" />
      <div className="prose prose-invert">
        <ReactMarkdown
          children={procedure.content}
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return match ? (
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  className="not-prose"
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            pre: ({ children }) => <>{children}</>,
            img: ({ node, ...props }) => (
              <img
                {...props}
                style={{ maxWidth: "100%", display: "block", margin: "0 auto" }}
                alt={props.alt || ""}
              />
            ),
          }}
        />
      </div>
      <div className="mt-8">
        <Link to="/procedures" className="text-blue-400 underline">
          一覧に戻る
        </Link>
      </div>
    </div>
  );
};
