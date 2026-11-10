import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '@/test/render';
import { GapItem } from './gap-item';

describe('GapItem', () => {
  it('AC7: shows the area, severity and reason', () => {
    renderWithProviders(
      <ul>
        <GapItem
          gap={{ area: 'jvm', severity: 'missing', reason: 'Your CV does not mention the JVM.' }}
        />
      </ul>,
    );

    const item = screen.getByRole('listitem');
    expect(within(item).getByRole('heading', { name: 'JVM internals' })).toBeInTheDocument();
    expect(within(item).getByText('Missing')).toBeInTheDocument();
    expect(within(item).getByText('Your CV does not mention the JVM.')).toBeInTheDocument();
  });

  it('AC7: labels a weak gap', () => {
    renderWithProviders(
      <ul>
        <GapItem gap={{ area: 'testing', severity: 'weak', reason: 'Only JUnit.' }} />
      </ul>,
    );

    expect(screen.getByText('Weak')).toBeInTheDocument();
  });
});
