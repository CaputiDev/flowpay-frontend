import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { SWRConfig } from "swr";
import { useQueues } from "../useQueues";

describe("useQueues hook", () => {
  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <SWRConfig
        value={{
          provider: () => new Map(),
          dedupingInterval: 0,
        }}
      >
        {children}
      </SWRConfig>
    );
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
          status: "EM_ATENDIMENTO",
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

  it("should return error state when fetch fails", async () => {
    const mockError = new Error("Network error");
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(mockError))
    );

    const { result } = renderHook(() => useQueues(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBeDefined());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.filas).toBeUndefined();
  });
});
