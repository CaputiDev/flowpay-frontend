import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "../route";
import mockData from "../mock.json";

describe("GET /api/queues", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return mock data after simulated delay", async () => {
    const routePromise = GET();

    // Avança o timer artificial de 2000ms
    vi.advanceTimersByTime(2000);

    const response = await routePromise;
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json).toEqual(mockData);
    expect(json).toHaveProperty("filaAtiva");
    expect(json).toHaveProperty("filaEspera");
    expect(Array.isArray(json.filaAtiva)).toBe(true);
    expect(Array.isArray(json.filaEspera)).toBe(true);
  });
});
