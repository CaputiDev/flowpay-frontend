import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AnalyticsPage from "../page";
import * as useAnalyticsModule from "@/app/hooks/useAnalytics";
import { MonthlyAnalyticsResponse } from "@/app/types/atendimento";

vi.mock("next/navigation", () => ({
  usePathname: () => "/analytics",
  useParams: () => ({}),
}));

describe("AnalyticsPage", () => {
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
            totalTickets: 50,
            resolvedTickets: 46,
            rejectedTickets: 1,
            avgWaitingTimeSeconds: 30.0,
            avgServiceTimeSeconds: 150.0,
          },
          LOANS: {
            team: "LOANS",
            totalTickets: 30,
            resolvedTickets: 28,
            rejectedTickets: 0,
            avgWaitingTimeSeconds: 45.0,
            avgServiceTimeSeconds: 180.0,
          },
          OTHERS: {
            team: "OTHERS",
            totalTickets: 20,
            resolvedTickets: 16,
            rejectedTickets: 1,
            avgWaitingTimeSeconds: 40.0,
            avgServiceTimeSeconds: 150.0,
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
            totalTickets: 25,
            resolvedTickets: 23,
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

  it("should render header, KPI cards and charts with loaded data", () => {
    vi.spyOn(useAnalyticsModule, "useAnalytics").mockReturnValue({
      analytics: mockAnalyticsData,
      overallSummary: mockAnalyticsData.overallSummary,
      monthlyMetrics: mockAnalyticsData.monthlyMetrics,
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
    });

    render(<AnalyticsPage />);

    expect(screen.getByRole("heading", { name: /painel de analytics & métricas/i })).toBeInTheDocument();
    expect(screen.getByText("Total de Chamados")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("Taxa de Resolução")).toBeInTheDocument();
    expect(screen.getByText("90%")).toBeInTheDocument();
    expect(screen.getByText("Chamados Recusados")).toBeInTheDocument();

    // Charts
    expect(screen.getByText("Volume Histórico de Chamados")).toBeInTheDocument();
    expect(screen.getByText("Distribuição por Equipe")).toBeInTheDocument();
    expect(screen.getByText("SLA e Tempos Médios por Equipe")).toBeInTheDocument();
    expect(screen.getByText("Detalhamento por Equipe")).toBeInTheDocument();
  });

  it("should allow changing selected month filter", async () => {
    const user = userEvent.setup();

    vi.spyOn(useAnalyticsModule, "useAnalytics").mockReturnValue({
      analytics: mockAnalyticsData,
      overallSummary: mockAnalyticsData.overallSummary,
      monthlyMetrics: mockAnalyticsData.monthlyMetrics,
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
    });

    render(<AnalyticsPage />);

    const select = screen.getByRole("combobox", { name: /filtrar por período/i });
    expect(select).toHaveValue("ALL");

    await user.selectOptions(select, "2026-08");
    expect(select).toHaveValue("2026-08");

    // Total should now reflect August (100)
    expect(screen.getAllByText("100").length).toBeGreaterThan(0);
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

    render(<AnalyticsPage />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/erro ao carregar métricas/i)).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /tentar novamente/i });
    await user.click(retryBtn);

    expect(mutateMock).toHaveBeenCalled();
  });
});
