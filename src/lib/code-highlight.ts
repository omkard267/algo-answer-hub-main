
import Prism from "prismjs";

// Import language components
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";

// Import theme CSS - we'll load this in a different way to avoid CSS import issues
// import "prismjs/themes/prism-tomorrow.css";

// Initialize Prism
export const highlightCode = (code: string, language = "typescript"): string => {
  if (!code) return "";
  
  try {
    // Use the specified language or default to typescript
    const lang = Prism.languages[language] ? language : "typescript";
    return Prism.highlight(code, Prism.languages[lang], lang);
  } catch (error) {
    console.error("Error highlighting code:", error);
    return code;
  }
};

export const getLanguageFromFilename = (filename: string): string => {
  if (!filename) return 'typescript';
  
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'js':
      return 'javascript';
    case 'ts':
      return 'typescript';
    case 'jsx':
      return 'jsx';
    case 'tsx':
      return 'tsx';
    case 'py':
      return 'python';
    case 'java':
      return 'java';
    case 'c':
      return 'c';
    case 'cpp':
    case 'cc':
      return 'cpp';
    case 'cs':
      return 'csharp';
    case 'go':
      return 'go';
    case 'rs':
      return 'rust';
    case 'sh':
    case 'bash':
      return 'bash';
    case 'json':
      return 'json';
    case 'css':
      return 'css';
    default:
      return 'typescript'; // Default
  }
};

// Add a function to inject the required CSS for prism themes
export const injectPrismTheme = (): void => {
  // Create a style element if it doesn't exist
  const id = 'prism-theme';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    
    // Add the prism-tomorrow theme CSS inline
    style.innerHTML = `
      code[class*="language-"],
      pre[class*="language-"] {
        color: #ccc;
        background: none;
        font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
        font-size: 1em;
        text-align: left;
        white-space: pre;
        word-spacing: normal;
        word-break: normal;
        word-wrap: normal;
        line-height: 1.5;
        -moz-tab-size: 4;
        -o-tab-size: 4;
        tab-size: 4;
        -webkit-hyphens: none;
        -moz-hyphens: none;
        -ms-hyphens: none;
        hyphens: none;
      }
      
      /* Code blocks */
      pre[class*="language-"] {
        padding: 1em;
        margin: .5em 0;
        overflow: auto;
      }
      
      :not(pre) > code[class*="language-"],
      pre[class*="language-"] {
        background: #2d2d2d;
      }
      
      /* Inline code */
      :not(pre) > code[class*="language-"] {
        padding: .1em;
        border-radius: .3em;
        white-space: normal;
      }
      
      .token.comment,
      .token.block-comment,
      .token.prolog,
      .token.doctype,
      .token.cdata {
        color: #999;
      }
      
      .token.punctuation {
        color: #ccc;
      }
      
      .token.tag,
      .token.attr-name,
      .token.namespace,
      .token.deleted {
        color: #e2777a;
      }
      
      .token.function-name {
        color: #6196cc;
      }
      
      .token.boolean,
      .token.number,
      .token.function {
        color: #f08d49;
      }
      
      .token.property,
      .token.class-name,
      .token.constant,
      .token.symbol {
        color: #f8c555;
      }
      
      .token.selector,
      .token.important,
      .token.atrule,
      .token.keyword,
      .token.builtin {
        color: #cc99cd;
      }
      
      .token.string,
      .token.char,
      .token.attr-value,
      .token.regex,
      .token.variable {
        color: #7ec699;
      }
      
      .token.operator,
      .token.entity,
      .token.url {
        color: #67cdcc;
      }
      
      .token.important,
      .token.bold {
        font-weight: bold;
      }
      
      .token.italic {
        font-style: italic;
      }
      
      .token.entity {
        cursor: help;
      }
      
      .token.inserted {
        color: green;
      }
      
      /* Line highlighting */
      pre[data-line] {
        position: relative;
        padding: 1em 0 1em 3em;
      }
      
      .line-highlight {
        position: absolute;
        left: 0;
        right: 0;
        padding: inherit 0;
        margin-top: 1em;
        background: rgba(153,122,102,0.08);
        background: linear-gradient(to right, rgba(153,122,102,0.1) 70%, rgba(153,122,102,0));
        pointer-events: none;
        line-height: inherit;
        white-space: pre;
      }
      
      .line-number {
        display: inline-block;
        margin-right: 1em;
        opacity: 0.5;
        min-width: 2em;
        text-align: right;
      }
    `;
    
    document.head.appendChild(style);
  }
};
