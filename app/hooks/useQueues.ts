"use client";

import useSWR from "swr";
import { FilaResponse, Atendimento } from "@/app/types/atendimento";

const fetcher = async (url: string): Promise<FilaResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Erro na requisição: ${res.status}`);
  }
  return res.json();
};

export interface CreateAtendimentoInput {
  subject: string;
  ticketNumber?: string;
  chatRef?: string;
  queueId?: string;
  agentId?: string;
}

export function useQueues() {
  const { data, error, isLoading, mutate } = useSWR<FilaResponse>(
    "/api/queues",
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      keepPreviousData: false,
    }
  );

  /**
   * Cria um novo atendimento via BFF e injeta no cache SWR em memória
   */
  const createAtendimento = async (input: CreateAtendimentoInput): Promise<Atendimento> => {
    const res = await fetch("/api/queues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Falha ao criar chamado (${res.status})`);
    }

    const novoAtendimento: Atendimento = await res.json();

    // Atualiza o cache do SWR localmente sem reescrever o arquivo no servidor
    await mutate(
      (currentData) => {
        if (!currentData) {
          return { filaAtiva: [], filaEspera: [novoAtendimento] };
        }
        return {
          ...currentData,
          filaEspera: [novoAtendimento, ...currentData.filaEspera],
        };
      },
      false
    );

    return novoAtendimento;
  };

  /**
   * Finaliza um atendimento na fila ativa (Pessimistic UI)
   */
  const finishAtendimento = async (
    id: string,
    options?: { simulateError?: boolean }
  ): Promise<{ success: boolean; id: string }> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (options?.simulateError) {
      headers["x-simulate-error"] = "true";
    }

    const res = await fetch(`/api/queues/${encodeURIComponent(id)}/finish`, {
      method: "POST",
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Falha ao finalizar atendimento (${res.status})`);
    }

    const result = await res.json();

    // Remove do cache apenas após confirmação HTTP 200
    await mutate(
      (currentData) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          filaAtiva: currentData.filaAtiva.filter((item) => item.id !== id),
        };
      },
      false
    );

    return result;
  };

  return {
    filas: data,
    isLoading,
    isError: error,
    mutate,
    createAtendimento,
    finishAtendimento,
  };
}