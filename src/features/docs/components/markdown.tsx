import type { ComponentProps } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router';
import remarkGfm from 'remark-gfm';

interface MarkdownProps {
  content: string;
}

/** Renders a guide page. Styling comes from Tailwind's `prose` classes on the parent. */
export function Markdown({ content }: MarkdownProps) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: MarkdownLink }}>
      {content}
    </ReactMarkdown>
  );
}

/** Links inside the app (`/docs/...`) use the router; other links open in a new tab. */
function MarkdownLink({ href = '', children }: ComponentProps<'a'>) {
  if (href.startsWith('/')) return <Link to={href}>{children}</Link>;
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}
