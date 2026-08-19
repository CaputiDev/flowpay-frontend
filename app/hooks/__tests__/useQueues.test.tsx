import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { SWRConfig } from "swr";
import { useQueues } from "../useQueues";

describe("useQueues hook", () => {
  const createWrapper = () => {
    function SWRTestWrapper({ children }: { children: React.ReactNode }) {
      return (
        <SWRConfig
          value={{
            provider: () => new Map(),
            dedupingInterval: 0,
          }}
        >
          {children}
        </SWRConfig>
      );
    }
    SWRTestWrapper.displayName = "SWRTestWrapper";
    return SWRTestWrapper;
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should return loading state initially", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({ filaAtiva: [], filaEspera: [] }),
                }),
              100
            )
          )
      )
    );

    const { result } = renderHook(() => useQueues(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.filas).toBeUndefined();
    expect(result.current.isError).toBeUndefined();
  });

  it("should return queues data on successful fetch", async () => {
    const mockResponse = {
      filaAtiva: [
        {
          id: "1",
          ticketNumber: "TCK-001",
          chatRef: "CHAT-001",
          subject: "Dúvida",
          status: "IN_PROGRESS",
          errorMsg: null,
          createdAt: "2026-08-18T10:00:00Z",
          finishedAt: null,
          queueId: "q1",
          agentId: "a1",
        },
      ],
      filaEspera: [],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      )
    );

    const { result } = renderHook(() => useQueues(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.filas).toEqual(mockResponse);
    expect(result.current.isError).toBeUndefined();
  });

  it("should create new attendance and mutate local cache without mutating mock file", async () => {
    const initialData = {
      filaAtiva: [],
      filaEspera: [],
    };

    const createdItem = {
      id: "new-1",
      ticketNumber: "TCK-555",
      chatRef: "chat-555",
      subject: "Novo Chamado",
      status: "WAITING",
      errorMsg: null,
      createdAt: "2026-08-18T12:00:00Z",
      finishedAt: null,
      queueId: "q1",
      agentId: "a1",
    };

    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (init?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(createdItem),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(initialData),
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useQueues(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.createAtendimento({
        subject: "Novo Chamado",
      });
    });

    expect(result.current.filas?.filaEspera).toHaveLength(1);
    expect(result.current.filas?.filaEspera[0].subject).toBe("Novo Chamado");
  });

  it("should throw error when createAtendimento fails", async () => {
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (init?.method === "POST") {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: "Assunto inválido" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ filaAtiva: [], filaEspera: [] }),
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useQueues(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(
      result.current.createAtendimento({ subject: "Curto" })
    ).rejects.toThrow("Assunto inválido");
  });

  it("should finish attendance and remove from active list in cache upon HTTP 200", async () => {
    const initialData = {
      filaAtiva: [
        {
          id: "item-to-finish",
          ticketNumber: "TCK-001",
          chatRef: "CHAT-001",
          subject: "Atendimento Ativo",
          status: "IN_PROGRESS",
          errorMsg: null,
          createdAt: "2026-08-18T10:00:00Z",
          finishedAt: null,
          queueId: "q1",
          agentId: "a1",
        },
      ],
      filaEspera: [],
    };

    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (init?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, id: "item-to-finish" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(initialData),
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useQueues(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.filas?.filaAtiva).toHaveLength(1));

    await act(async () => {
      await result.current.finishAtendimento("item-to-finish");
    });

    expect(result.current.filas?.filaAtiva).toHaveLength(0);
  });

  it("should throw error when finishAtendimento fails", async () => {
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (init?.method === "POST") {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: "Erro interno no servidor" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ filaAtiva: [], filaEspera: [] }),
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useQueues(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(
      result.current.finishAtendimento("item-1", { simulateError: true })
    ).rejects.toThrow("Erro interno no servidor");
  });

  it("should return error state when fetch fails or returns not ok", async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useQueues(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBeDefined());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.filas).toBeUndefined();
  });
});
