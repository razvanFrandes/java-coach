import { useEffect, useId, useState } from 'react';

interface MermaidDiagramProps {
  source: string;
}

/** Renders a ```mermaid block. Mermaid is large, so it is loaded only when a diagram appears. */
export function MermaidDiagram({ source }: MermaidDiagramProps) {
  const id = `mermaid-${useId().replace(/:/g, '')}`;
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import('mermaid')
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
        const result = await mermaid.render(id, source);
        if (!cancelled) setSvg(result.svg);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id, source]);

  return (
    <figure
      aria-label="Diagram"
      className="not-prose my-6 overflow-x-auto rounded-xl border bg-card p-4"
    >
      {svg && !failed ? (
        // The SVG comes from our own markdown files, rendered by mermaid; it is not user input.
        <div className="flex justify-center" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <pre className="text-xs text-muted-foreground">{source}</pre>
      )}
    </figure>
  );
}
