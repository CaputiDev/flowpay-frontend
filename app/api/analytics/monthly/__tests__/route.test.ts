import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "../route";
import { MonthlyAnalyticsResponse } from "@/app/types/atendimento";

const mockAnalytics: MonthlyAnalyticsResponse = {
  overallSummary: {
    totalTickets: 120,
    totalResolved: 100,
    totalRejected: 5,
    totalInProgress: 10,
    totalPending: 5,
    avgWaitingTimeSeconds: 45.2,
    avgServiceTimeSeconds: 180.5,
    avgTotalTimeSeconds: 225.7,
  },
  monthlyMetrics: [
    {
      month: "2026-08",
      totalTickets: 80,
      resolvedTickets: 70,
      rejectedTickets: 2,
      inProgressTickets: 5,
      pendingTickets: 3,
      avgWaitingTimeSeconds: 40.0,
      avgServiceTimeSeconds: 175.0,
      avgTotalTimeSeconds: 215.0,
      byTeam: {
        CREDIT_CARDS: {
          team: "CREDIT_CARDS",
          totalTickets: 40,
          resolvedTickets: 35,
          rejectedTickets: 1,
          avgWaitingTimeSeconds: 30.0,
          avgServiceTimeSeconds: 150.0,
        },
      },
    },
  ],
};

describe("GET /api/analytics/monthly", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should return monthly analytics data with status 200 on success", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockAnalytics,
    });
    vi.stubGlobal("fetch", mockFetch);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.overallSummary.totalTickets).toBe(120);
    expect(data.monthlyMetrics).toHaveLength(1);
  });

  it("should return error response when backend responds with error", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "Internal server error" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });

  it("should return 502 when fetch throws a network exception", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network failed"));
    vi.stubGlobal("fetch", mockFetch);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toContain("Erro de conexão");
  });
});
