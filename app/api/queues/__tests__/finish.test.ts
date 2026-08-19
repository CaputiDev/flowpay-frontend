import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "../[id]/finish/route";
import { NextRequest } from "next/server";

describe("POST /api/queues/[id]/finish", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should finish attendance successfully (HTTP 200)", async () => {
    const request = new NextRequest("http://localhost:3000/api/queues/123/finish", {
      method: "POST",
    });

    const routePromise = POST(request, {
      params: Promise.resolve({ id: "123" }),
    });

    await vi.advanceTimersByTimeAsync(500);

    const response = await routePromise;
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.id).toBe("123");
    expect(json.status).toBe("FINISHED");
  });

  it("should return HTTP 500 when simulated error header is passed", async () => {
    const request = new NextRequest("http://localhost:3000/api/queues/123/finish", {
      method: "POST",
      headers: {
        "x-simulate-error": "true",
      },
    });

    const routePromise = POST(request, {
      params: Promise.resolve({ id: "123" }),
    });

    await vi.advanceTimersByTimeAsync(500);

    const response = await routePromise;
    expect(response.status).toBe(500);

    const json = await response.json();
    expect(json.error).toContain("Falha interna");
  });
});
