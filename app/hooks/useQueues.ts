"use client";

import useSWR from "swr";

// O Fetcher: A função base que ensina o SWR a ler um JSON puro
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useQueues() {
    const { data, error, isLoading } = useSWR("/api/queues", fetcher, {
        // Polling automático a cada intervalo de ms
        refreshInterval: 5000,

        // Atualiza imediatamente se o gerente mudar de aba e voltar para o sistema
        revalidateOnFocus: true,
        // Atualiza imediatamente se a internet do gerente cair e voltar
        revalidateOnReconnect: true,
        // Não mantém os dados velhos na tela enquanto busca os novos se a chave mudar
        keepPreviousData: false,
    });

    return {
        filas: data,
        isLoading,
        isError: error,
    };
}