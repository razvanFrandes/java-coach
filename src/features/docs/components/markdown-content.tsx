import type { ComponentProps } from 'react';
import Markdown from 'react-markdown';
import { Link } from 'react-router';
import remarkGfm from 'remark-gfm';
import { MermaidDiagram } from './mermaid-diagram';

interface MarkdownContentProps {
  markdown: string;
}

/** Markdown with two app-specific twists: mermaid diagrams and in-app links. */
export function MarkdownContent({ markdown }: MarkdownContentProps) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{ a: MarkdownLink, pre: PassThrough, code: MarkdownCode }}
    >
      {markdown}
    </Markdown>
  );
}

function MarkdownLink({ href = '', children }: ComponentProps<'a'>) {
  if (href.startsWith('/')) return <Link to={href}>{children}</Link>;
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

/** react-markdown wraps code blocks in <pre>; MarkdownCode adds its own wrapper instead. */
function PassThrough({ children }: ComponentProps<'pre'>) {
  return <>{children}</>;
}

/** ```mermaid blocks become diagrams, other blocks <pre><code>, `inline` code stays inline. */
function MarkdownCode({ className, children }: ComponentProps<'code'>) {
  const text = String(children);
  if (className === 'language-mermaid') return <MermaidDiagram source={text.trim()} />;

  const isBlock = Boolean(className) || text.includes('\n');
  if (!isBlock) return <code>{children}</code>;
  return (
    <pre>
      <code className={className}>{children}</code>
    </pre>
  );
}
