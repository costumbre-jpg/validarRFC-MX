/** @jest-environment node */

import { POST } from "@/app/api/validate-cfdi/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("API /api/validate-cfdi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    const { createClient } = require("@/lib/supabase/server");
    createClient.mockResolvedValueOnce({
      auth: {
        getUser: jest.fn(() => ({
          data: { user: null },
          error: { message: "Not authenticated" },
        })),
      },
    });

    const request = new NextRequest("http://localhost:3000/api/validate-cfdi", {
      method: "POST",
      headers: new Headers({
        authorization: "Bearer test-token",
      }),
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.toLowerCase()).toContain("no autenticado");
  });

  it("should return 403 for non-business users", async () => {
    const { createClient } = require("@/lib/supabase/server");
    createClient.mockResolvedValueOnce({
      auth: {
        getUser: jest.fn(() => ({
          data: { user: { id: "user-id" } },
          error: null,
        })),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { subscription_status: "free" },
            })),
          })),
        })),
      })),
    });

    const request = new NextRequest("http://localhost:3000/api/validate-cfdi", {
      method: "POST",
      headers: new Headers({
        authorization: "Bearer test-token",
      }),
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error.toLowerCase()).toContain("business");
  });

  it("should return 501 for business users (not implemented)", async () => {
    const { createClient } = require("@/lib/supabase/server");
    createClient.mockResolvedValueOnce({
      auth: {
        getUser: jest.fn(() => ({
          data: { user: { id: "user-id" } },
          error: null,
        })),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { subscription_status: "business" },
            })),
          })),
        })),
      })),
    });

    const request = new NextRequest("http://localhost:3000/api/validate-cfdi", {
      method: "POST",
      headers: new Headers({
        authorization: "Bearer test-token",
      }),
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(501);
    expect(data.code).toBe("CFDI_NOT_IMPLEMENTED");
  });
});
