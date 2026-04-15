import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchApi } from "../fetch";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe("fetchApi", () => {
  it("returns parsed JSON on success", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: "test" }),
    });

    const result = await fetchApi("/api/test");
    expect(result).toEqual({ data: "test" });
    expect(mockFetch).toHaveBeenCalledWith("/api/test", undefined);
  });

  it("passes options through to fetch", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "test" }),
    };

    await fetchApi("/api/test", options);
    expect(mockFetch).toHaveBeenCalledWith("/api/test", options);
  });

  it("throws with error message from response JSON", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Not found" }),
    });

    await expect(fetchApi("/api/test")).rejects.toThrow("Not found");
  });

  it("throws generic message when response JSON parsing fails", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.reject(new Error("parse error")),
    });

    await expect(fetchApi("/api/test")).rejects.toThrow("Request failed");
  });

  it("throws generic message when error field is empty", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });

    await expect(fetchApi("/api/test")).rejects.toThrow("Request failed");
  });
});
