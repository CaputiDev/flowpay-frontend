import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TeamAnalyticsPage from "../page";
import * as useAnalyticsModule from "@/app/hooks/useAnalytics";
import { TeamAnalyticsResponse } from "@/app/types/atendimento";

vi.mock("next/navigation", () => ({
  useParams: () => ({ team: "CREDIT_CARDS" }),
  usePathname: () => "/analytics/CREDIT_CARDS",
}));

describe("TeamAnalyticsPage", () => {
  const mockTeamAnalyticsData: TeamAnalyticsResponse = {
    team: "CREDIT_CARDS",
    teamName: "Cartões",
    summary: {
      totalTickets: 90,
      resolvedTickets: 83,
      rejectedTickets: 2,
      inProgressTickets: 3,
      pendingTickets: 2,
      avgWaitingTimeSeconds: 28.0,
      avgServiceTimeSeconds: 145.0,
      avgTotalTimeSeconds: 173.0,
      successRatePercent: 92.2,
    },
    monthlyHistory: [
      {
        month: "2026-08",
        totalTickets: 60,
        resolvedTickets: 55,
        rejectedTickets: 1,
        inProgressTickets: 2,
        pendingTickets: 2,
        avgWaitingTimeSeconds: 25.0,
        avgServiceTimeSeconds: 140.0,
        avgTotalTimeSeconds: 165.0,
        successRatePercent: 91.6,
      },
      {
        month: "2026-07",
        totalTickets: 30,
        resolvedTickets: 28,
        rejectedTickets: 1,
        inProgressTickets: 1,
        pendingTickets: 0,
        avgWaitingTimeSeconds: 35.0,
        avgServiceTimeSeconds: 160.0,
        avgTotalTimeSeconds: 195.0,
        successRatePercent: 93.3,
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render team analytics header, KPIs and charts for CREDIT_CARDS", () => {
    vi.spyOn(useAnalyticsModule, "useTeamAnalytics").mockReturnValue({
      teamAnalytics: mockTeamAnalyticsData,
      summary: mockTeamAnalyticsData.summary,
      monthlyHistory: mockTeamAnalyticsData.monthlyHistory,
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
    });

    render(<TeamAnalyticsPage />);

    expect(screen.getByRole("heading", { name: /analytics: cartões/i })).toBeInTheDocument();
    expect(screen.getByText("Chamados Atribuídos")).toBeInTheDocument();
    expect(screen.getAllByText("90").length).toBeGreaterThan(0);
    expect(screen.getByText("Taxa de Resolução")).toBeInTheDocument();
    expect(screen.getByText("Recusados (Fila Cheia)")).toBeInTheDocument();
    expect(screen.getByText("Tempo Médio em Fila de Espera")).toBeInTheDocument();
    expect(screen.getByText("Tempo Médio de Atendimento")).toBeInTheDocument();
    expect(screen.getByText("Histórico Mensal de Cartões")).toBeInTheDocument();
  });

  it("should allow filtering by specific month", async () => {
    const user = userEvent.setup();

    vi.spyOn(useAnalyticsModule, "useTeamAnalytics").mockReturnValue({
      teamAnalytics: mockTeamAnalyticsData,
      summary: mockTeamAnalyticsData.summary,
      monthlyHistory: mockTeamAnalyticsData.monthlyHistory,
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
    // Historical monthly chart should be hidden when filtering by specific month
    expect(screen.queryByText("Histórico Mensal de Cartões")).not.toBeInTheDocument();
  });

  it("should display error banner and allow retry", async () => {
    const user = userEvent.setup();
    const mutateMock = vi.fn();

    vi.spyOn(useAnalyticsModule, "useTeamAnalytics").mockReturnValue({
      teamAnalytics: undefined,
      summary: undefined,
      monthlyHistory: [],
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
