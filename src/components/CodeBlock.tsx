
import React, { useEffect, useRef } from "react";
import { highlightCode, injectPrismTheme } from "@/lib/code-highlight";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

const CodeBlock = ({ code, language = "typescript", showLineNumbers = true }: CodeBlockProps) => {
  const codeRef = useRef<HTMLPreElement>(null);
  const { toast } = useToast();

  // Inject Prism theme styles once when the component is first mounted
  useEffect(() => {
    injectPrismTheme();
  }, []);

  useEffect(() => {
    if (codeRef.current) {
      const html = highlightCode(code, language);
      
      if (showLineNumbers) {
        const lines = html.split("\n");
        const numberedLines = lines.map((line, i) => {
          return `<span class="line-number">${i + 1}</span>${line}`;
        });
        codeRef.current.innerHTML = numberedLines.join("\n");
      } else {
        codeRef.current.innerHTML = html;
      }
    }
  }, [code, language, showLineNumbers]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
      duration: 2000,
    });
  };

  return (
    <div className="relative group">
      <pre
        ref={codeRef}
        className="rounded-md p-4 bg-code text-code-foreground overflow-x-auto font-code"
      >
        {code}
      </pre>
      <Button
        variant="ghost"
        size="sm"
        onClick={copyToClipboard}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        Copy
      </Button>
    </div>
  );
};

export default CodeBlock;
