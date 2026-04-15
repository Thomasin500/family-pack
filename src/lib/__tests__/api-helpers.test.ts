import { describe, it, expect, vi } from "vitest";

// Mock the modules that pull in Next.js runtime before importing api-helpers
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/db", () => ({ db: { query: { users: { findFirst: vi.fn() } } } }));
vi.mock("@/db/schema", () => ({ users: {} }));
vi.mock("drizzle-orm", () => ({ eq: vi.fn() }));

const { ApiError, handleApiError } = await import("../api-helpers");

describe("ApiError", () => {
  it("stores status and message", () => {
    const err = new ApiError(404, "Not found");
    expect(err.status).toBe(404);
    expect(err.message).toBe("Not found");
  });

  it("is an instance of Error", () => {
    const err = new ApiError(500, "Server error");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("handleApiError", () => {
  it("returns status and message for ApiError", async () => {
    const err = new ApiError(403, "Forbidden");
    const response = handleApiError(err);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("Forbidden");
  });

  it("returns 500 for unknown errors", async () => {
    const err = new Error("something broke");
    const response = handleApiError(err);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Internal server error");
  });

  it("returns 500 for non-Error values", async () => {
    const response = handleApiError("string error");
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Internal server error");
  });
});
