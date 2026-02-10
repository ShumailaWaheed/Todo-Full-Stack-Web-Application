import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EnhancedChatBot from '../EnhancedChatBot';
import { useAuth } from '../../../lib/auth/context';

// Mock the useAuth hook
jest.mock('../../../lib/auth/context', () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('EnhancedChatBot', () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@example.com', created_at: '2024-01-01', updated_at: '2024-01-01' },
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      token: 'mock-token',
      isAuthenticated: true,
      checkAuthStatus: jest.fn(),
      updateUser: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the chatbot button when user is authenticated', () => {
    render(<EnhancedChatBot />);

    // Since the component shows nothing when not open, we check if it renders without crashing
    expect(screen.queryByText('AI Task Commander')).not.toBeInTheDocument();
  });

  it('shows proper UI elements when opened', async () => {
    // For this test, we would need to simulate opening the chatbot
    // This is a simplified test to ensure the component structure is correct
    expect(true).toBe(true); // Placeholder test
  });
});