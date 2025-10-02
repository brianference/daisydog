import { describe, test, expect, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ContactPage from '../../src/pages/ContactPage';

// Mock fetch
global.fetch = jest.fn();

const MockContactPage = () => (
  <BrowserRouter>
    <ContactPage />
  </BrowserRouter>
);

describe('Contact Form Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    delete window.location;
    window.location = { hostname: 'localhost' };
  });

  test('renders contact form with all fields', () => {
    render(<MockContactPage />);
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    render(<MockContactPage />);
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);
    
    // Form should not submit without required fields
    await waitFor(() => {
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  test('shows dev mode message on non-Netlify hostname', async () => {
    window.location.hostname = 'localhost';
    
    render(<MockContactPage />);
    
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } });
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);
    
    // Should NOT call fetch on localhost
    await waitFor(() => {
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  test('submits to Netlify Forms on production hostname', async () => {
    window.location.hostname = 'daisydog.netlify.app';
    fetch.mockResolvedValueOnce({ ok: true });
    
    render(<MockContactPage />);
    
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } });
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
      );
    });
  });

  test('shows success message after submission', async () => {
    window.location.hostname = 'daisydog.org';
    fetch.mockResolvedValueOnce({ ok: true });
    
    render(<MockContactPage />);
    
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test' } });
    
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
    });
  });
});
