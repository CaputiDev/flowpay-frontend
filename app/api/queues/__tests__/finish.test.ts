import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "../[id]/finish/route";
import { NextRequest } from "next/server";

describe("POST /api/queues/[id]/finish", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should finish attendance successfully (HTTP 200) via backend", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          success: true,
          id: "123",
          status: "FINISHED",
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const request = new NextRequest("http://localhost:3000/api/queues/123/finish", {
      method: "POST",
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });

    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.id).toBe("123");
    expect(json.status).toBe("FINISHED");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("should return error when backend returns non-ok status", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "Falha interna no servidor" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const request = new NextRequest("http://localhost:3000/api/queues/123/finish", {
      method: "POST",
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });

    expect(response.status).toBe(500);

    const json = await response.json();
    expect(json.error).toContain("Falha");
  });
});
