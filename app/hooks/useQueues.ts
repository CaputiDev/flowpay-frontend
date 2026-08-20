"use client";

import useSWR from "swr";
import {
  QueueStatusResponse,
  TicketResponse,
  ActiveTicketDto,
  WaitingTicketDto,
  TeamSummaryDto,
} from "@/app/types/atendimento";

const fetcher = async (url: string): Promise<QueueStatusResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Erro na requisição: ${res.status}`);
  }
  return res.json();
};

export interface CreateAtendimentoInput {
  subject: string;
  chatRef?: string;
}

export function useQueues() {
  const { data, error, isLoading, mutate } = useSWR<QueueStatusResponse>(
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
   * Cria um novo atendimento via BFF e revalida os dados da fila
   */
  const createAtendimento = async (
    input: CreateAtendimentoInput
  ): Promise<TicketResponse> => {
    const res = await fetch("/api/queues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Falha ao criar chamado (${res.status})`);
    }

    const novoTicket: TicketResponse = await res.json();

    // Revalida para sincronizar com o estado em tempo real retornado pelo backend
    await mutate();

    return novoTicket;
  };

  /**
   * Finaliza um atendimento ativo e revalida a fila
   */
  const finishAtendimento = async (
    id: string
  ): Promise<TicketResponse> => {
    const res = await fetch(`/api/queues/${encodeURIComponent(id)}/finish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Falha ao finalizar atendimento (${res.status})`);
    }

    const result: TicketResponse = await res.json();

    // Revalida as filas para refletir a nova carga do atendente e a transição FIFO
    await mutate();

    return result;
  };

  return {
    filas: data,
    activeQueue: data?.activeQueue ?? [],
    waitingQueue: data?.waitingQueue ?? [],
    teamSummaries: data?.teamSummaries ?? [],
    isLoading,
    isError: error,
    mutate,
    createAtendimento,
    finishAtendimento,
  };
}