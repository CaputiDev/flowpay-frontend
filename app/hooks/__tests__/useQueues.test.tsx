import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { SWRConfig } from "swr";
import { useQueues } from "../useQueues";
import { QueueStatusResponse, TicketResponse } from "@/app/types/atendimento";

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
                  json: () =>
                    Promise.resolve<QueueStatusResponse>({
                      activeQueue: [],
                      waitingQueue: [],
                      teamSummaries: [],
                    }),
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
    const mockResponse: QueueStatusResponse = {
      activeQueue: [
        {
          id: "1",
          ticketNumber: 1,
          chatRef: "CHAT-001",
          subject: "Dúvida",
          status: "IN_PROGRESS",
          team: "CREDIT_CARDS",
          agentId: "a1",
          agentName: "Carlos",
          createdAt: "2026-08-18T10:00:00Z",
        },
      ],
      waitingQueue: [],
      teamSummaries: [],
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
    expect(result.current.activeQueue).toEqual(mockResponse.activeQueue);
    expect(result.current.waitingQueue).toEqual(mockResponse.waitingQueue);
    expect(result.current.isError).toBeUndefined();
  });

  it("should create new attendance and revalidate SWR cache", async () => {
    const initialData: QueueStatusResponse = {
      activeQueue: [],
      waitingQueue: [],
      teamSummaries: [],
    };

    const createdItem: TicketResponse = {
      id: "new-1",
      ticketNumber: 555,
      chatRef: "chat-555",
      subject: "Novo Chamado",
      status: "PENDING",
      createdAt: "2026-08-18T12:00:00Z",
    };

    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (init?.method === "POST") {
        return Promise.resolve({
          ok: true,
          status: 202,
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

    let created: TicketResponse | undefined;
    await act(async () => {
      created = await result.current.createAtendimento({
        subject: "Novo Chamado",
      });
    });

    expect(created).toEqual(createdItem);
    expect(fetchMock).toHaveBeenCalled();
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
        json: () => Promise.resolve({ activeQueue: [], waitingQueue: [], teamSummaries: [] }),
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

  it("should finish attendance successfully", async () => {
    const initialData: QueueStatusResponse = {
      activeQueue: [
        {
          id: "item-to-finish",
          ticketNumber: 1,
          chatRef: "CHAT-001",
          subject: "Atendimento Ativo",
          status: "IN_PROGRESS",
          team: "CREDIT_CARDS",
          agentId: "a1",
          agentName: "Carlos",
          createdAt: "2026-08-18T10:00:00Z",
        },
      ],
      waitingQueue: [],
      teamSummaries: [],
    };

    const finishResponse: TicketResponse = {
      id: "item-to-finish",
      ticketNumber: 1,
      chatRef: "CHAT-001",
      subject: "Atendimento Ativo",
      status: "RESOLVED",
      createdAt: "2026-08-18T10:00:00Z",
    };

    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (init?.method === "PATCH") {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(finishResponse),
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

    await waitFor(() => expect(result.current.activeQueue).toHaveLength(1));

    let res: TicketResponse | undefined;
    await act(async () => {
      res = await result.current.finishAtendimento("item-to-finish");
    });

    expect(res?.status).toBe("RESOLVED");
  });

  it("should throw error when finishAtendimento fails", async () => {
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (init?.method === "PATCH") {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: "Erro interno no servidor" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ activeQueue: [], waitingQueue: [], teamSummaries: [] }),
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useQueues(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(
      result.current.finishAtendimento("item-1")
    ).rejects.toThrow("Erro interno no servidor");
  });

  it("should return error state when fetch fails or returns not ok", async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Server error" }),
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
