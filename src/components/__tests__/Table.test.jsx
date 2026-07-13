import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Table from '../Table';

describe('Table Component', () => {
  it('renders headers correctly', () => {
    const headers = ['Nombre', 'Edad', 'Raza'];
    render(
      <Table headers={headers}>
        <tr>
          <td>Fido</td>
          <td>3</td>
          <td>Labrador</td>
        </tr>
      </Table>
    );

    headers.forEach(header => {
      expect(screen.getByText(header)).toBeDefined();
    });
    expect(screen.getByText('Fido')).toBeDefined();
  });
});
