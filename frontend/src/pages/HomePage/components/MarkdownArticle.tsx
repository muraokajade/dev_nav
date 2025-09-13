import React, { Suspense, useEffect, useMemo, useState } from "react";

// 記事ページに入るまで main に載せない
const ReactMarkdown = React.lazy(() => import("react-markdown"));

type PrismLightType = any; // 型は簡略化（版差異対策）

export default function MarkdownArticle({ md }: { md: string }) {
  const [PrismLight, setPrismLight] = useState<PrismLightType | null>(null);
  const [style, setStyle] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      let Light: any;

      // --- Prism Light を“ある方”から取得（版差異を吸収）
      try {
        // 新しめの版にあるパス
        const mod = await import(
          "react-syntax-highlighter/dist/esm/prism-light"
        );
        Light = mod.default;
      } catch {
        // ない版はパッケージ直下から PrismLight を取る
        const root = await import("react-syntax-highlighter");
        Light = (root as any).PrismLight ?? (root as any).Light;
      }

      // 必要な言語だけ登録（増やしたいときはここへ追加）
      const langs = await Promise.all([
        import("react-syntax-highlighter/dist/esm/languages/prism/javascript"),
        import("react-syntax-highlighter/dist/esm/languages/prism/typescript"),
        import("react-syntax-highlighter/dist/esm/languages/prism/tsx"),
        import("react-syntax-highlighter/dist/esm/languages/prism/jsx"),
        import("react-syntax-highlighter/dist/esm/languages/prism/java"),
        import("react-syntax-highlighter/dist/esm/languages/prism/json"),
        import("react-syntax-highlighter/dist/esm/languages/prism/bash"),
        import("react-syntax-highlighter/dist/esm/languages/prism/yaml"),
        import("react-syntax-highlighter/dist/esm/languages/prism/markdown"),
        import("react-syntax-highlighter/dist/esm/languages/prism/sql"),
      ]);
      const names = [
        "javascript",
        "typescript",
        "tsx",
        "jsx",
        "java",
        "json",
        "bash",
        "yaml",
        "markdown",
        "sql",
      ] as const;
      langs.forEach((m, i) =>
        Light.registerLanguage(names[i], (m as any).default)
      );

      if (mounted) setPrismLight(() => Light);
    })();

    // テーマも遅延読み込み
    (async () => {
      const { oneDark } = await import(
        "react-syntax-highlighter/dist/esm/styles/prism"
      );
      setStyle(oneDark);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const Code = useMemo(
    () =>
      function CodeBlock({
        className,
        children,
        ...props
      }: {
        className?: string;
        children?: React.ReactNode;
      }) {
        const match = /language-(\w+)/.exec(className || "");
        const codeString = String(children ?? "");

        if (match && PrismLight && style) {
          return (
            <PrismLight
              style={style}
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
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas",
                  fontSize: 13,
                  lineHeight: 1.7,
                },
              }}
              {...props}
            >
              {codeString.replace(/\n$/, "")}
            </PrismLight>
          );
        }
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
    [PrismLight, style]
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b0f15]/80 p-4 backdrop-blur overflow-x-auto">
      <Suspense fallback={<div>Loading…</div>}>
        <ReactMarkdown
          components={{
            code: Code,
            pre: ({ children }: any) => <>{children}</>,
          }}
        >
          {md}
        </ReactMarkdown>
      </Suspense>
    </div>
  );
}
