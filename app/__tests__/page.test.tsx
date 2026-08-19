import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from "../page";
import * as useQueuesModule from "@/app/hooks/useQueues";

describe("Dashboard Page", () => {
  const mockFilas = {
    filaAtiva: [
      {
        id: "ativa-1",
        ticketNumber: "TCK-991",
        chatRef: "chat-001",
        subject: "Dúvida sobre faturamento",
        status: "IN_PROGRESS",
        errorMsg: null,
        createdAt: "2026-08-18T15:15:33.094Z",
        finishedAt: null,
        queueId: "q1",
        agentId: "a1",
      },
    ],
    filaEspera: [
      {
        id: "espera-1",
        ticketNumber: "TCK-992",
        chatRef: "chat-002",
        subject: "Problema de acesso",
        status: "WAITING",
        errorMsg: null,
        createdAt: "2026-08-18T15:20:00.000Z",
        finishedAt: null,
        queueId: "q1",
        agentId: "a1",
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render skeleton loaders when isLoading is true", () => {
    vi.spyOn(useQueuesModule, "useQueues").mockReturnValue({
      filas: undefined,
      isLoading: true,
      isError: undefined,
      mutate: vi.fn(),
      createAtendimento: vi.fn(),
      finishAtendimento: vi.fn(),
    });

    const { container } = render(<Dashboard />);

    expect(screen.getByRole("heading", { name: "FlowPay MVP", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Gerenciamento de Filas em Tempo Real")).toBeInTheDocument();

    const skeletons = container.querySelectorAll("[data-slot='skeleton']");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should render queues and tickets when data is loaded", () => {
    vi.spyOn(useQueuesModule, "useQueues").mockReturnValue({
      filas: mockFilas,
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
      createAtendimento: vi.fn(),
      finishAtendimento: vi.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByText("Fila Ativa (Processando)")).toBeInTheDocument();
    expect(screen.getByText("Fila de Espera (Aguardando)")).toBeInTheDocument();

    expect(screen.getByText("TCK-991")).toBeInTheDocument();
    expect(screen.getByText("Dúvida sobre faturamento")).toBeInTheDocument();

    expect(screen.getByText("TCK-992")).toBeInTheDocument();
    expect(screen.getByText("Problema de acesso")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /finalizar atendimento tck-991/i })).toBeInTheDocument();
  });

  it("should render empty state messages when both queues are empty", () => {
    vi.spyOn(useQueuesModule, "useQueues").mockReturnValue({
      filas: { filaAtiva: [], filaEspera: [] },
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
      isLoading: false,
      isError: new Error("Network error"),
      mutate: mutateMock,
      createAtendimento: vi.fn(),
      finishAtendimento: vi.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/erro ao sincronizar filas/i)).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /tentar novamente/i });
    await user.click(retryBtn);

    expect(mutateMock).toHaveBeenCalled();
  });

  it("should trigger refresh when update button is clicked", async () => {
    const user = userEvent.setup();
    const mutateMock = vi.fn();

    vi.spyOn(useQueuesModule, "useQueues").mockReturnValue({
      filas: mockFilas,
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

  it("should toggle sidebar expansion and support backdrop close", async () => {
    const user = userEvent.setup();
    vi.spyOn(useQueuesModule, "useQueues").mockReturnValue({
      filas: mockFilas,
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
      createAtendimento: vi.fn(),
      finishAtendimento: vi.fn(),
    });

    const { container } = render(<Dashboard />);

    const aside = container.querySelector("aside");
    expect(aside).toHaveClass("w-16");
    expect(screen.queryByText("Menu Ubots")).not.toBeInTheDocument();

    const menuButton = screen.getByRole("button", { name: /expandir menu lateral/i });
    await user.click(menuButton);

    expect(aside).toHaveClass("w-64");
    expect(screen.getByText("Menu Ubots")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Abrir Chamado")).toBeInTheDocument();
    expect(screen.getByText("Histórico / Fechados")).toBeInTheDocument();

    // Clica no backdrop mobile para fechar
    const backdrop = container.querySelector(".fixed.inset-0.z-20");
    expect(backdrop).toBeInTheDocument();
    if (backdrop) {
      await user.click(backdrop);
      expect(aside).toHaveClass("w-16");
    }
  });

  it("should open NewTicketDrawer when 'Abrir Chamado' in sidebar is clicked", async () => {
    const user = userEvent.setup();
    vi.spyOn(useQueuesModule, "useQueues").mockReturnValue({
      filas: mockFilas,
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
      createAtendimento: vi.fn(),
      finishAtendimento: vi.fn(),
    });

    render(<Dashboard />);

    const abrirChamadoBtn = screen.getByTitle("Abrir Chamado");
    await user.click(abrirChamadoBtn);

    expect(screen.getByRole("heading", { name: /novo atendimento/i })).toBeInTheDocument();
  });

  it("should execute finish action on active item with pessimistic UI", async () => {
    const user = userEvent.setup();
    let resolveFinish: () => void = () => {};
    const finishPromise = new Promise<{ success: boolean; id: string }>((resolve) => {
      resolveFinish = () => resolve({ success: true, id: "ativa-1" });
    });

    const finishMock = vi.fn().mockImplementation(() => finishPromise);

    vi.spyOn(useQueuesModule, "useQueues").mockReturnValue({
      filas: mockFilas,
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
      createAtendimento: vi.fn(),
      finishAtendimento: finishMock,
    });

    render(<Dashboard />);

    const finishBtn = screen.getByRole("button", { name: /finalizar atendimento tck-991/i });
    await user.click(finishBtn);

    // Pessimistic state: button disabled with spinner while waiting
    expect(finishBtn).toBeDisabled();
    expect(screen.getByText("Finalizando...")).toBeInTheDocument();

    resolveFinish();
    await waitFor(() => expect(finishMock).toHaveBeenCalledWith("ativa-1"));
  });

  it("should handle error gracefully and alert manager if HTTP 500 occurs", async () => {
    const user = userEvent.setup();
    const finishMock = vi.fn().mockRejectedValue(new Error("Falha interna no servidor legado (500)"));

    vi.spyOn(useQueuesModule, "useQueues").mockReturnValue({
      filas: mockFilas,
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
      createAtendimento: vi.fn(),
      finishAtendimento: finishMock,
    });

    render(<Dashboard />);

    const finishBtn = screen.getByRole("button", { name: /finalizar atendimento tck-991/i });
    await user.click(finishBtn);

    await waitFor(() => {
      expect(finishMock).toHaveBeenCalledWith("ativa-1");
      // Button re-enabled and line preserved
      expect(finishBtn).not.toBeDisabled();
      expect(screen.getByText("Dúvida sobre faturamento")).toBeInTheDocument();
    });
  });

  it("should be fully navigable via keyboard Tab key", async () => {
    const user = userEvent.setup();
    vi.spyOn(useQueuesModule, "useQueues").mockReturnValue({
      filas: mockFilas,
      isLoading: false,
      isError: undefined,
      mutate: vi.fn(),
      createAtendimento: vi.fn(),
      finishAtendimento: vi.fn(),
    });

    render(<Dashboard />);

    await user.tab();
    expect(screen.getByRole("button", { name: /expandir menu lateral/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByTitle("Dashboard")).toHaveFocus();

    await user.tab();
    expect(screen.getByTitle("Abrir Chamado")).toHaveFocus();

    await user.tab();
    expect(screen.getByTitle("Histórico / Fechados")).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: /atualizar dados da fila/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: /criar novo atendimento/i })).toHaveFocus();
  });
});
