import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app header brand', () => {
  render(<App />);
  const title = screen.getByText(/Simple Todo/i);
  expect(title).toBeInTheDocument();
});
