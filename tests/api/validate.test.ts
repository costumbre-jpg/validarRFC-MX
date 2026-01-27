/** @jest-environment node */

import { POST } from '@/app/api/validate/route'
import { NextRequest } from 'next/server'

// Mock Supabase admin client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => ({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
        },
        error: null,
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              subscription_status: 'free',
              rfc_queries_this_month: 0,
            },
          })),
        })),
      })),
      insert: jest.fn(() => ({
        data: null,
        error: null,
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    })),
  })),
}))

// Mock fetch for SAT API
global.fetch = jest.fn()

describe('API /api/validate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if user is not authenticated', async () => {
    const { createClient } = require('@supabase/supabase-js')
    createClient.mockReturnValueOnce({
      auth: {
        getUser: jest.fn(() => ({
          data: { user: null },
          error: { message: 'Not authenticated' },
        })),
      },
    })

    const request = new NextRequest('http://localhost:3000/api/validate', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-token',
      },
      body: JSON.stringify({ rfc: 'ABC9901011A2' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.message.toLowerCase()).toContain('no autenticado')
  })

  it('should return 400 if RFC is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/validate', {
      method: 'POST',
      headers: new Headers({
        authorization: 'Bearer test-token',
      }),
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toContain('RFC es requerido')
  })

  it('should return 400 if RFC format is invalid', async () => {
    const request = new NextRequest('http://localhost:3000/api/validate', {
      method: 'POST',
      headers: new Headers({
        authorization: 'Bearer test-token',
      }),
      body: JSON.stringify({ rfc: 'INVALID' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toContain('Formato de RFC inválido')
  })

  it('should return 403 if monthly limit is reached', async () => {
    const { createClient } = require('@supabase/supabase-js')
    createClient.mockReturnValueOnce({
      auth: {
        getUser: jest.fn(() => ({
          data: {
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
            },
          },
          error: null,
        })),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                subscription_status: 'free',
                rfc_queries_this_month: 10, // Limit reached for free plan
              },
            })),
          })),
        })),
      })),
    })

    const request = new NextRequest('http://localhost:3000/api/validate', {
      method: 'POST',
      headers: new Headers({
        authorization: 'Bearer test-token',
      }),
      body: JSON.stringify({ rfc: 'ABC9901011A2' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.success).toBe(false)
    expect(data.message).toContain('límite')
  })

  it('should validate RFC successfully', async () => {
    // Mock SAT API response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: jest.fn(() => Promise.resolve('Registro activo')),
    })

    const request = new NextRequest('http://localhost:3000/api/validate', {
      method: 'POST',
      headers: new Headers({
        authorization: 'Bearer test-token',
      }),
      body: JSON.stringify({ rfc: 'ABC9901011A2' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.rfc).toBe('ABC9901011A2')
    expect(typeof data.valid).toBe('boolean')
  })
})

