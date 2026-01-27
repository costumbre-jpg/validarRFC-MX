/** @jest-environment node */

import { POST } from '@/app/api/stripe/webhook/route'
import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'

// Mock Stripe
jest.mock('@/lib/stripe', () => {
  const stripe = {
    webhooks: {
      constructEvent: jest.fn(),
    },
    subscriptions: {
      retrieve: jest.fn(),
    },
    customers: {
      retrieve: jest.fn(),
    },
  }

  return {
    getStripe: () => stripe,
    stripe,
  }
})

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => {
    const chain = {
      select: jest.fn(() => chain),
      update: jest.fn(() => chain),
      insert: jest.fn(() => ({ data: null, error: null })),
      eq: jest.fn(() => chain),
      single: jest.fn(() => ({ data: null, error: null })),
    }

    return {
      from: jest.fn(() => chain),
    }
  }),
}))

describe('Stripe Webhooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret'
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    ;(console.error as jest.Mock).mockRestore()
    ;(console.log as jest.Mock).mockRestore()
  })

  it('should return 400 if signature is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      body: 'test body',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('signature')
  })

  it('should return 400 if signature verification fails', async () => {
    ;(stripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      body: 'test body',
      headers: {
        'stripe-signature': 'invalid-signature',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('signature')
  })

  it('should handle checkout.session.completed event', async () => {
    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'session_123',
          metadata: {
            user_id: 'test-user-id',
            plan: 'pro',
          },
          subscription: 'sub_123',
        },
      },
    }

    ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)
    ;(stripe.subscriptions.retrieve as jest.Mock).mockResolvedValue({
      id: 'sub_123',
      status: 'active',
      current_period_end: Math.floor(Date.now() / 1000) + 2592000, // 30 days
    })

    const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify(mockEvent),
      headers: {
        'stripe-signature': 'valid-signature',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
  })

  it('should handle customer.subscription.updated event', async () => {
    const mockEvent = {
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_123',
          status: 'active',
          metadata: {
            user_id: 'test-user-id',
            plan: 'pro',
          },
          customer: 'cus_123',
          current_period_end: Math.floor(Date.now() / 1000) + 2592000,
        },
      },
    }

    ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)

    const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify(mockEvent),
      headers: {
        'stripe-signature': 'valid-signature',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
  })

  it('should handle customer.subscription.deleted event', async () => {
    const mockEvent = {
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_123',
          metadata: {
            user_id: 'test-user-id',
          },
          customer: 'cus_123',
        },
      },
    }

    ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)

    const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify(mockEvent),
      headers: {
        'stripe-signature': 'valid-signature',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
  })
})

