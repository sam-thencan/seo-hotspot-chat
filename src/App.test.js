import { render, screen } from '@testing-library/react';
import App from './App';

test('renders api key input prompt when not configured', () => {
  render(<App />);
  const headingElement = screen.getByText(/Local SEO Chat - SEO Hotspot Edition/i);
  expect(headingElement).toBeInTheDocument();

  const apiKeyLabel = screen.getByLabelText(/Gemini API Key/i);
  expect(apiKeyLabel).toBeInTheDocument();
});
