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

  test('posts the message as JSON to the contact-form function on any host', async () => {
    window.location.hostname = 'daisydog.pages.dev';
    fetch.mockResolvedValueOnce({ ok: true });

    render(<MockContactPage />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/.netlify/functions/contact-form',
        expect.objectContaining({ method: 'POST', headers: { 'Content-Type': 'application/json' } })
      );
    });
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body).toMatchObject({ name: 'Test User', email: 'test@example.com', subject: 'Test Subject', message: 'Test message' });
  });

  test('does not claim success when the function fails', async () => {
    window.location.hostname = 'daisydog.pages.dev';
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    window.alert = jest.fn();

    render(<MockContactPage />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => expect(window.alert).toHaveBeenCalled());
    expect(screen.queryByText(/message sent successfully/i)).not.toBeInTheDocument();
  });
  test('shows success message after submission', async () => {
    window.location.hostname = 'daisydog.pages.dev';
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
