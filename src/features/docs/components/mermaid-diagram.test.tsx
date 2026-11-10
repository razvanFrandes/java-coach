import { screen } from '@testing-library/react';
import mermaid from 'mermaid';
import { renderWithProviders } from '@/test/render';
import { MermaidDiagram } from './mermaid-diagram';

// Mermaid needs a real browser layout engine; jsdom has none. The library is replaced here.
vi.mock('mermaid', () => ({
  default: { initialize: vi.fn(), render: vi.fn() },
}));

describe('MermaidDiagram', () => {
  it('AC8: renders the diagram as a labelled figure', async () => {
    vi.mocked(mermaid.render).mockResolvedValue({
      svg: '<svg><text>UI to Domain</text></svg>',
      diagramType: 'flowchart',
    });

    renderWithProviders(<MermaidDiagram source="flowchart LR; UI --> Domain" />);

    const figure = await screen.findByRole('figure', { name: 'Diagram' });
    expect(await screen.findByText('UI to Domain')).toBeInTheDocument();
    expect(figure).toContainElement(screen.getByText('UI to Domain'));
  });

  it('AC8: shows the source when the diagram cannot be rendered', async () => {
    vi.mocked(mermaid.render).mockRejectedValue(new Error('Parse error'));

    renderWithProviders(<MermaidDiagram source="flowchart LR; broken -->" />);

    expect(await screen.findByText('flowchart LR; broken -->')).toBeInTheDocument();
  });
});
