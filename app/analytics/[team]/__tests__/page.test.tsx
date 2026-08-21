import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TeamAnalyticsPage from "../page";
import * as useAnalyticsModule from "@/app/hooks/useAnalytics";
import { MonthlyAnalyticsResponse } from "@/app/types/atendimento";

vi.mock("next/navigation", () => ({
  useParams: () => ({ team: "CREDIT_CARDS" }),
  usePathname: () => "/analytics/CREDIT_CARDS",
}));

describe("TeamAnalyticsPage", () => {
  const mockAnalyticsData: MonthlyAnalyticsResponse = {
    overallSummary: {
      totalTickets: 150,
      totalResolved: 135,
      totalRejected: 5,
      totalInProgress: 6,
      totalPending: 4,
      avgWaitingTimeSeconds: 42.5,
      avgServiceTimeSeconds: 165.0,
      avgTotalTimeSeconds: 207.5,
    },
    monthlyMetrics: [
      {
        month: "2026-08",
        totalTickets: 100,
        resolvedTickets: 90,
        rejectedTickets: 2,
        inProgressTickets: 5,
        pendingTickets: 3,
        avgWaitingTimeSeconds: 38.0,
        avgServiceTimeSeconds: 160.0,
        avgTotalTimeSeconds: 198.0,
        byTeam: {
          CREDIT_CARDS: {
            team: "CREDIT_CARDS",
            totalTickets: 60,
            resolvedTickets: 55,
            rejectedTickets: 1,
            avgWaitingTimeSeconds: 25.0,
            avgServiceTimeSeconds: 140.0,
          },
          LOANS: {
            team: "LOANS",
            totalTickets: 40,
            resolvedTickets: 35,
            rejectedTickets: 1,
            avgWaitingTimeSeconds: 45.0,
            avgServiceTimeSeconds: 180.0,
          },
        },
      },
      {
        month: "2026-07",
        totalTickets: 50,
        resolvedTickets: 45,
        rejectedTickets: 3,
        inProgressTickets: 1,
        pendingTickets: 1,
        avgWaitingTimeSeconds: 50.0,
        avgServiceTimeSeconds: 175.0,
        avgTotalTimeSeconds: 225.0,
        byTeam: {
          CREDIT_CARDS: {
            team: "CREDIT_CARDS",
            totalTickets: 30,
            resolvedTickets: 28,
            rejectedTickets: 1,
            avgWaitingTimeSeconds: 35.0,
            avgServiceTimeSeconds: 160.0,
          },
        },
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render team analytics header, KPIs and charts for CREDIT_CARDS", () => {
    vi.spyOn(useAnalyticsModule, "useAnalytics").mockReturnValue({
      analytics: mockAnalyticsData,
      overallSummary: mockAnalyticsData.overallSummary,
      monthlyMetrics: mockAnalyticsData.monthlyMetrics,
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
    });

    render(<TeamAnalyticsPage />);

    expect(screen.getByRole("heading", { name: /analytics: cartões/i })).toBeInTheDocument();
    expect(screen.getByText("Chamados Atribuídos")).toBeInTheDocument();
    // Consolidated total for credit cards (60 + 30 = 90)
    expect(screen.getAllByText("90").length).toBeGreaterThan(0);
    expect(screen.getByText("Taxa de Resolução")).toBeInTheDocument();
    expect(screen.getByText("Recusados (Fila Cheia)")).toBeInTheDocument();
    expect(screen.getByText("Tempo Médio em Fila")).toBeInTheDocument();
    expect(screen.getByText("Histórico Mensal de Cartões")).toBeInTheDocument();
  });

  it("should allow filtering by specific month", async () => {
    const user = userEvent.setup();

    vi.spyOn(useAnalyticsModule, "useAnalytics").mockReturnValue({
      analytics: mockAnalyticsData,
      overallSummary: mockAnalyticsData.overallSummary,
      monthlyMetrics: mockAnalyticsData.monthlyMetrics,
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
    });

    render(<TeamAnalyticsPage />);

    const select = screen.getByRole("combobox", { name: /filtrar período do time/i });
    expect(select).toHaveValue("ALL");

    await user.selectOptions(select, "2026-08");
    expect(select).toHaveValue("2026-08");

    // August credit cards total is 60
    expect(screen.getAllByText("60").length).toBeGreaterThan(0);
  });

  it("should display error banner and allow retry", async () => {
    const user = userEvent.setup();
    const mutateMock = vi.fn();

    vi.spyOn(useAnalyticsModule, "useAnalytics").mockReturnValue({
      analytics: undefined,
      overallSummary: undefined,
      monthlyMetrics: [],
      isLoading: false,
      isError: new Error("Network error"),
      mutate: mutateMock,
    });

    render(<TeamAnalyticsPage />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/erro ao carregar métricas/i)).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /tentar novamente/i });
    await user.click(retryBtn);

    expect(mutateMock).toHaveBeenCalled();
  });
});
