import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST, PATCH } from "../[id]/finish/route";
import { NextRequest } from "next/server";

describe("POST /api/queues/[id]/finish", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should finish attendance successfully calling PATCH on backend", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          id: "123",
          ticketNumber: 1,
          chatRef: "chat-01",
          subject: "Teste",
          status: "RESOLVED",
          createdAt: "2026-08-20T10:00:00Z",
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const request = new NextRequest("http://localhost:3000/api/queues/123/finish", {
      method: "PATCH",
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "123" }),
    });

    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.status).toBe("RESOLVED");
    expect(json.id).toBe("123");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].method).toBe("PATCH");
  });

  it("should return error when backend returns non-ok status", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: "Solicitação não encontrada", message: "Solicitação não encontrada" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const request = new NextRequest("http://localhost:3000/api/queues/123/finish", {
      method: "POST",
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });

    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toContain("Solicitação não encontrada");
  });
});
