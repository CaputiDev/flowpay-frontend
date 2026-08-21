import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";
import { TeamAnalyticsResponse } from "@/app/types/atendimento";

const mockTeamAnalytics: TeamAnalyticsResponse = {
  team: "CREDIT_CARDS",
  teamName: "Cartões",
  summary: {
    totalTickets: 80,
    resolvedTickets: 75,
    rejectedTickets: 2,
    inProgressTickets: 2,
    pendingTickets: 1,
    avgWaitingTimeSeconds: 30.0,
    avgServiceTimeSeconds: 150.0,
    avgTotalTimeSeconds: 180.0,
    successRatePercent: 93.75,
  },
  monthlyHistory: [
    {
      month: "2026-08",
      totalTickets: 80,
      resolvedTickets: 75,
      rejectedTickets: 2,
      inProgressTickets: 2,
      pendingTickets: 1,
      avgWaitingTimeSeconds: 30.0,
      avgServiceTimeSeconds: 150.0,
      avgTotalTimeSeconds: 180.0,
      successRatePercent: 93.75,
    },
  ],
};

describe("GET /api/analytics/teams/[team]", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should return team analytics data with status 200 on success", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTeamAnalytics,
    });
    vi.stubGlobal("fetch", mockFetch);

    const req = new NextRequest("http://localhost:3000/api/analytics/teams/CREDIT_CARDS");
    const response = await GET(req, { params: Promise.resolve({ team: "CREDIT_CARDS" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.team).toBe("CREDIT_CARDS");
    expect(data.summary.totalTickets).toBe(80);
    expect(data.monthlyHistory).toHaveLength(1);
  });

  it("should return error response when backend responds with error", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: "Team not found" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const req = new NextRequest("http://localhost:3000/api/analytics/teams/UNKNOWN");
    const response = await GET(req, { params: Promise.resolve({ team: "UNKNOWN" }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Team not found");
  });

  it("should return 502 when fetch throws a network exception", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network failed"));
    vi.stubGlobal("fetch", mockFetch);

    const req = new NextRequest("http://localhost:3000/api/analytics/teams/CREDIT_CARDS");
    const response = await GET(req, { params: Promise.resolve({ team: "CREDIT_CARDS" }) });
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toContain("Erro de conexão");
  });
});
