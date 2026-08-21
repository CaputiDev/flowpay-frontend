import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TeamPage from "../page";
import * as useQueuesModule from "@/app/hooks/useQueues";
import { ActiveTicketDto, WaitingTicketDto, QueueStatusResponse } from "@/app/types/atendimento";

vi.mock("next/navigation", () => ({
  useParams: () => ({ team: "CREDIT_CARDS" }),
  usePathname: () => "/CREDIT_CARDS",
}));

describe("TeamPage", () => {
  const mockActive: ActiveTicketDto[] = [
    {
      id: "ativa-cards-1",
      ticketNumber: 101,
      chatRef: "chat-cards-1",
      subject: "Aumento de limite de cartão",
      status: "IN_PROGRESS",
      team: "CREDIT_CARDS",
      agentId: "agent-1",
      agentName: "Ana Silva",
      createdAt: "2026-08-18T15:15:33.094Z",
    },
    {
      id: "ativa-loans-1",
      ticketNumber: 102,
      chatRef: "chat-loans-1",
      subject: "Simulação de consignado",
      status: "IN_PROGRESS",
      team: "LOANS",
      agentId: "agent-2",
      agentName: "Carlos Pereira",
      createdAt: "2026-08-18T15:16:33.094Z",
    },
  ];

  const mockWaiting: WaitingTicketDto[] = [
    {
      id: "espera-cards-1",
      ticketNumber: 103,
      chatRef: "chat-cards-2",
      subject: "Fatura em atraso",
      status: "PENDING",
      team: "CREDIT_CARDS",
      queueId: "q-cards",
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
        waitingCount: 1,
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
        waitingCount: 0,
        totalAgents: 1,
        totalCapacity: 3,
        currentLoad: 1,
        agents: [],
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render team header, metrics and operators", () => {
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

    render(<TeamPage />);

    expect(screen.getByRole("heading", { name: /Equipe de Cartões/i })).toBeInTheDocument();
    expect(screen.getByText("Atendimentos Ativos")).toBeInTheDocument();
    expect(screen.getByText("Operadores Alocados (1)")).toBeInTheDocument();
    expect(screen.getAllByText("Ana Silva").length).toBeGreaterThan(0);
    expect(screen.getByText("Aumento de limite de cartão")).toBeInTheDocument();
    expect(screen.getByText("Fatura em atraso")).toBeInTheDocument();

    // Verify loans item is filtered out
    expect(screen.queryByText("Simulação de consignado")).not.toBeInTheDocument();
  });

  it("should handle finishing ticket inside team view", async () => {
    const user = userEvent.setup();
    const finishMock = vi.fn().mockResolvedValue({
      id: "ativa-cards-1",
      ticketNumber: 101,
      chatRef: "chat-cards-1",
      subject: "Aumento de limite de cartão",
      status: "RESOLVED",
      createdAt: "2026-08-18T15:15:33.094Z",
    });

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

    render(<TeamPage />);

    const finishBtn = screen.getByRole("button", { name: /finalizar atendimento #101/i });
    await user.click(finishBtn);

    await waitFor(() => {
      expect(finishMock).toHaveBeenCalledWith("ativa-cards-1");
    });
  });

  it("should allow searching operators by name and collapsing section", async () => {
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

    render(<TeamPage />);

    const searchInput = screen.getByRole("textbox", { name: /pesquisar operador pelo nome/i });
    await user.type(searchInput, "Inexistente");
    expect(screen.getByText(/nenhum operador encontrado/i)).toBeInTheDocument();

    await user.clear(searchInput);
    expect(screen.getAllByText("Ana Silva").length).toBeGreaterThan(0);

    const toggleBtn = screen.getByRole("button", { name: /expandir ou recolher operadores alocados/i });
    await user.click(toggleBtn);
    expect(screen.queryByRole("textbox", { name: /pesquisar operador pelo nome/i })).not.toBeInTheDocument();
  });

  it("should allow searching active queue and waiting queue", async () => {
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

    render(<TeamPage />);

    // Active search
    const activeSearchInput = screen.getByRole("textbox", { name: /pesquisar chamados em atendimento/i });
    await user.type(activeSearchInput, "limite");
    expect(screen.getByText("Aumento de limite de cartão")).toBeInTheDocument();

    await user.clear(activeSearchInput);
    await user.type(activeSearchInput, "nada-aqui");
    expect(screen.getByText(/nenhum atendimento encontrado/i)).toBeInTheDocument();

    // Waiting search
    const waitingSearchInput = screen.getByRole("textbox", { name: /pesquisar chamados na fila de espera/i });
    await user.type(waitingSearchInput, "atraso");
    expect(screen.getByText("Fatura em atraso")).toBeInTheDocument();
  });
});
