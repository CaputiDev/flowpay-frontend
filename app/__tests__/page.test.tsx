import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from "../page";
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

    const { container } = render(<Dashboard />);

    expect(screen.getByRole("heading", { name: /FlowPay MVP/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Gerenciamento de Filas & Roteamento Automático")).toBeInTheDocument();

    const skeletons = container.querySelectorAll("[data-slot='skeleton']");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should render queues, tickets, team, and agent when data is loaded", () => {
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

    render(<Dashboard />);

    expect(screen.getByText("Fila Ativa (Processando)")).toBeInTheDocument();
    expect(screen.getByText("Fila de Espera (Aguardando)")).toBeInTheDocument();

    // Protocolos e referências
    expect(screen.getByText("#991")).toBeInTheDocument();
    expect(screen.getByText("Ref: chat-001")).toBeInTheDocument();
    expect(screen.getByText("Dúvida sobre faturamento")).toBeInTheDocument();
    expect(screen.getByText("Ana Silva")).toBeInTheDocument();
    expect(screen.getAllByText("Cartões").length).toBeGreaterThan(0);

    expect(screen.getByText("#992")).toBeInTheDocument();
    expect(screen.getByText("Ref: chat-002")).toBeInTheDocument();
    expect(screen.getByText("Problema de acesso")).toBeInTheDocument();
    expect(screen.getByText("Empréstimos")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /finalizar atendimento #991/i })).toBeInTheDocument();
  });

  it("should render empty state messages when both queues are empty", () => {
    vi.spyOn(useQueuesModule, "useQueues").mockReturnValue({
      filas: { activeQueue: [], waitingQueue: [], teamSummaries: [] },
      activeQueue: [],
      waitingQueue: [],
      teamSummaries: [],
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
      createAtendimento: vi.fn(),
      finishAtendimento: vi.fn(),
    });

    render(<Dashboard />);

    expect(
      screen.getByText("Nenhum atendimento em andamento no momento.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Nenhum chamado na fila de espera.")
    ).toBeInTheDocument();
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

    render(<Dashboard />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/erro de sincronização/i)).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /tentar novamente/i });
    await user.click(retryBtn);

    expect(mutateMock).toHaveBeenCalled();
  });

  it("should trigger refresh when update button is clicked", async () => {
    const user = userEvent.setup();
    const mutateMock = vi.fn();

    vi.spyOn(useQueuesModule, "useQueues").mockReturnValue({
      filas: mockFilas,
      activeQueue: mockActive,
      waitingQueue: mockWaiting,
      teamSummaries: mockFilas.teamSummaries,
      isLoading: false,
      isError: undefined,
      mutate: mutateMock,
      createAtendimento: vi.fn(),
      finishAtendimento: vi.fn(),
    });

    render(<Dashboard />);

    const refreshBtn = screen.getByRole("button", { name: /atualizar dados da fila/i });
    await user.click(refreshBtn);

    expect(mutateMock).toHaveBeenCalled();
  });

  it("should open NewTicketDrawer when 'Novo Chamado' in header is clicked", async () => {
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

    render(<Dashboard />);

    const novoChamadoBtn = screen.getByRole("button", { name: /criar novo atendimento/i });
    await user.click(novoChamadoBtn);

    expect(screen.getByRole("heading", { name: /novo atendimento/i })).toBeInTheDocument();
  });

  it("should execute finish action on active item with pessimistic UI", async () => {
    const user = userEvent.setup();
    let resolveFinish: () => void = () => {};
    const finishPromise = new Promise<{ id: string; ticketNumber: number; chatRef: string; subject: string; status: "RESOLVED"; createdAt: string }>((resolve) => {
      resolveFinish = () =>
        resolve({
          id: "ativa-1",
          ticketNumber: 991,
          chatRef: "chat-001",
          subject: "Dúvida sobre faturamento",
          status: "RESOLVED",
          createdAt: "2026-08-18T15:15:33.094Z",
        });
    });

    const finishMock = vi.fn().mockImplementation(() => finishPromise);

    vi.spyOn(useQueuesModule, "useQueues").mockReturnValue({
      filas: mockFilas,
      activeQueue: mockActive,
      waitingQueue: mockWaiting,
      teamSummaries: mockFilas.teamSummaries,
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
      createAtendimento: vi.fn(),
      finishAtendimento: finishMock,
    });

    render(<Dashboard />);

    const finishBtn = screen.getByRole("button", { name: /finalizar atendimento #991/i });
    await user.click(finishBtn);

    // Pessimistic state: button disabled with spinner while waiting
    expect(finishBtn).toBeDisabled();
    expect(screen.getByText("Finalizando...")).toBeInTheDocument();

    resolveFinish();
    await waitFor(() => expect(finishMock).toHaveBeenCalledWith("ativa-1"));
  });

  it("should handle error gracefully and notify when finish fails", async () => {
    const user = userEvent.setup();
    const finishMock = vi.fn().mockRejectedValue(new Error("Falha interna no servidor legado (500)"));

    vi.spyOn(useQueuesModule, "useQueues").mockReturnValue({
      filas: mockFilas,
      activeQueue: mockActive,
      waitingQueue: mockWaiting,
      teamSummaries: mockFilas.teamSummaries,
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
      createAtendimento: vi.fn(),
      finishAtendimento: finishMock,
    });

    render(<Dashboard />);

    const finishBtn = screen.getByRole("button", { name: /finalizar atendimento #991/i });
    await user.click(finishBtn);

    await waitFor(() => {
      expect(finishMock).toHaveBeenCalledWith("ativa-1");
      expect(finishBtn).not.toBeDisabled();
      expect(screen.getByText("Dúvida sobre faturamento")).toBeInTheDocument();
    });
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

    render(<Dashboard />);

    await user.tab();
    expect(screen.getByRole("button", { name: /atualizar dados da fila/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: /criar novo atendimento/i })).toHaveFocus();
  });
});
