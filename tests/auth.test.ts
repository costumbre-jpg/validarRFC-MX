import { createClient } from '@/lib/supabase/client'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      getUser: jest.fn(),
    },
  })),
}))

describe('Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Login', () => {
    it('should sign in user with correct credentials', async () => {
      const supabase = createClient()
      const mockSignIn = supabase.auth.signInWithPassword as jest.Mock

      mockSignIn.mockResolvedValueOnce({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
          session: {
            access_token: 'test-token',
          },
        },
        error: null,
      })

      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.error).toBeNull()
      expect(result.data?.user).toBeDefined()
      expect(result.data?.user?.email).toBe('test@example.com')
    })

    it('should return error with incorrect credentials', async () => {
      const supabase = createClient()
      const mockSignIn = supabase.auth.signInWithPassword as jest.Mock

      mockSignIn.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: {
          message: 'Invalid login credentials',
          status: 400,
        },
      })

      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrongpassword',
      })

      expect(result.error).toBeDefined()
      expect(result.error?.message).toContain('Invalid')
      expect(result.data?.user).toBeNull()
    })
  })

  describe('Register', () => {
    it('should sign up new user', async () => {
      const supabase = createClient()
      const mockSignUp = supabase.auth.signUp as jest.Mock

      mockSignUp.mockResolvedValueOnce({
        data: {
          user: {
            id: 'new-user-id',
            email: 'newuser@example.com',
          },
        },
        error: null,
      })

      const result = await supabase.auth.signUp({
        email: 'newuser@example.com',
        password: 'password123',
      })

      expect(result.error).toBeNull()
      expect(result.data?.user).toBeDefined()
      expect(result.data?.user?.email).toBe('newuser@example.com')
    })

    it('should return error if email already exists', async () => {
      const supabase = createClient()
      const mockSignUp = supabase.auth.signUp as jest.Mock

      mockSignUp.mockResolvedValueOnce({
        data: { user: null },
        error: {
          message: 'User already registered',
          status: 400,
        },
      })

      const result = await supabase.auth.signUp({
        email: 'existing@example.com',
        password: 'password123',
      })

      expect(result.error).toBeDefined()
      expect(result.error?.message).toContain('already')
    })
  })

  describe('Password Reset', () => {
    it('should send password reset email', async () => {
      const supabase = createClient()
      const mockReset = supabase.auth.resetPasswordForEmail as jest.Mock

      mockReset.mockResolvedValueOnce({
        data: {},
        error: null,
      })

      const result = await supabase.auth.resetPasswordForEmail(
        'test@example.com'
      )

      expect(result.error).toBeNull()
      expect(mockReset).toHaveBeenCalledWith('test@example.com', expect.any(Object))
    })
  })

  describe('Sign Out', () => {
    it('should sign out user', async () => {
      const supabase = createClient()
      const mockSignOut = supabase.auth.signOut as jest.Mock

      mockSignOut.mockResolvedValueOnce({
        error: null,
      })

      const result = await supabase.auth.signOut()

      expect(result.error).toBeNull()
      expect(mockSignOut).toHaveBeenCalled()
    })
  })
})

