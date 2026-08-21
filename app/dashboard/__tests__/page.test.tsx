import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardPage from "../page";
import * as useQueuesModule from "@/app/hooks/useQueues";
import { ActiveTicketDto, WaitingTicketDto, QueueStatusResponse } from "@/app/types/atendimento";

describe("Dashboard Page", () => {
  const mockActive: ActiveTicketDto[] = [
    {
      id: "ativa-1",
      ticketNumber: 991,
      chatRef: "chat-001",
      subject: "Dúvida sobre faturamento",
      status: "IN_PROGRESS",
      team: "CREDIT_CARDS",
      agentId: "agent-1",
      agentName: "Ana Silva",
      createdAt: "2026-08-18T15:15:33.094Z",
    },
  ];

  const mockWaiting: WaitingTicketDto[] = [
    {
      id: "espera-1",
      ticketNumber: 992,
      chatRef: "chat-002",
      subject: "Problema de acesso",
      status: "PENDING",
      team: "LOANS",
      queueId: "q-1",
      position: 1,
      createdAt: "2026-08-18T15:20:00.000Z",
    },
  ];

  const mockFilas: QueueStatusResponse = {
    activeQueue: mockActive,
    waitingQueue: mockWaiting,
    teamSummaries: [
      {
        team: "CREDIT_CARDS",
        queueId: "q-cards",
        maxQueueCapacity: 3,
        waitingCount: 0,
        totalAgents: 2,
        totalCapacity: 6,
        currentLoad: 1,
        agents: [
          {
            id: "agent-1",
            name: "Ana Silva",
            team: "CREDIT_CARDS",
            currentLoad: 1,
            maxCapacity: 3,
            availableCapacity: 2,
          },
        ],
      },
      {
        team: "LOANS",
        queueId: "q-loans",
        maxQueueCapacity: 3,
        waitingCount: 1,
        totalAgents: 1,
        totalCapacity: 3,
        currentLoad: 0,
        agents: [],
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render skeleton loaders when isLoading is true", () => {
    vi.spyOn(useQueuesModule, "useQueues").mockReturnValue({
      filas: undefined,
      activeQueue: [],
      waitingQueue: [],
      teamSummaries: [],
      isLoading: true,
      isError: undefined,
      mutate: vi.fn(),
      createAtendimento: vi.fn(),
      finishAtendimento: vi.fn(),
    });

    const { container } = render(<DashboardPage />);

    expect(screen.getAllByText("Visão Geral").length).toBeGreaterThan(0);
    expect(screen.getByText("Roteamento & Filas")).toBeInTheDocument();

    const skeletons = container.querySelectorAll("[data-slot='skeleton']");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should render top metric cards and team summaries when data is loaded", () => {
    vi.spyOn(useQueuesModule, "useQueues").mockReturnValue({
      filas: mockFilas,
      activeQueue: mockActive,
      waitingQueue: mockWaiting,
      teamSummaries: mockFilas.teamSummaries,
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
      createAtendimento: vi.fn(),
      finishAtendimento: vi.fn(),
    });

    render(<DashboardPage />);

    // Top Cards
    expect(screen.getByText("Em atendimento")).toBeInTheDocument();
    expect(screen.getAllByText("Fila de espera").length).toBeGreaterThan(0);
    expect(screen.getByText("Atendentes ativos")).toBeInTheDocument();

    // Teams
    expect(screen.getByText("Equipes de Atendimento")).toBeInTheDocument();
    expect(screen.getAllByText("Cartões").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Empréstimos").length).toBeGreaterThan(0);
  });

  it("should display error banner and allow retry via mutate", async () => {
    const user = userEvent.setup();
    const mutateMock = vi.fn();

    vi.spyOn(useQueuesModule, "useQueues").mockReturnValue({
      filas: undefined,
      activeQueue: [],
      waitingQueue: [],
      teamSummaries: [],
      isLoading: false,
      isError: new Error("Network error"),
      mutate: mutateMock,
      createAtendimento: vi.fn(),
      finishAtendimento: vi.fn(),
    });

    render(<DashboardPage />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/erro de sincronização/i)).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /tentar novamente/i });
    await user.click(retryBtn);

    expect(mutateMock).toHaveBeenCalled();
  });

  it("should open NewTicketDrawer when 'Novo Chamado' in sidebar is clicked", async () => {
    const user = userEvent.setup();
    vi.spyOn(useQueuesModule, "useQueues").mockReturnValue({
      filas: mockFilas,
      activeQueue: mockActive,
      waitingQueue: mockWaiting,
      teamSummaries: mockFilas.teamSummaries,
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
      createAtendimento: vi.fn(),
      finishAtendimento: vi.fn(),
    });

    render(<DashboardPage />);

    const novoChamadoBtn = screen.getByRole("button", { name: /criar novo atendimento/i });
    await user.click(novoChamadoBtn);

    expect(screen.getByRole("heading", { name: /novo chamado/i })).toBeInTheDocument();
  });

  it("should be navigable via keyboard Tab key", async () => {
    const user = userEvent.setup();
    vi.spyOn(useQueuesModule, "useQueues").mockReturnValue({
      filas: mockFilas,
      activeQueue: mockActive,
      waitingQueue: mockWaiting,
      teamSummaries: mockFilas.teamSummaries,
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
      createAtendimento: vi.fn(),
      finishAtendimento: vi.fn(),
    });

    render(<DashboardPage />);

    await user.tab();
    expect(screen.getByRole("button", { name: /criar novo atendimento/i })).toHaveFocus();
  });
});
