import katex from 'katex';
import 'katex/dist/katex.min.css';

const TOKEN = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?<!\\)\$[^$\n]+\$)/g;

function renderMath(source: string, displayMode: boolean): string {
  try {
    return katex.renderToString(source.trim(), { displayMode, throwOnError: false, strict: 'ignore' });
  } catch {
    return source;
  }
}

export function MathText({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  const parts = text.split(TOKEN);
  return (
    <span className={className} style={style}>
      {parts.map((part, index) => {
        if (!part) return null;
        const display = part.startsWith('$$') || part.startsWith('\\[');
        const math = part.startsWith('$$') ? part.slice(2, -2) : part.startsWith('\\[') ? part.slice(2, -2) : part.startsWith('\\(') ? part.slice(2, -2) : part.startsWith('$') ? part.slice(1, -1) : null;
        if (math === null) return <span key={index}>{part}</span>;
        return <span key={index} dangerouslySetInnerHTML={{ __html: renderMath(math, display) }} />;
      })}
    </span>
  );
}
