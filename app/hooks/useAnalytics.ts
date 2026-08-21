"use client";

import useSWR from "swr";
import { MonthlyAnalyticsResponse, TeamAnalyticsResponse, Team } from "@/app/types/atendimento";

const fetcher = async (url: string): Promise<MonthlyAnalyticsResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Falha ao carregar métricas analíticas.");
  }
  return res.json();
};

const teamFetcher = async (url: string): Promise<TeamAnalyticsResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Falha ao carregar métricas da equipe.");
  }
  return res.json();
};

export function formatDuration(seconds: number | undefined | null): string {
  if (seconds == null || isNaN(seconds) || seconds === 0) {
    return "0s";
  }
  const rounded = Math.round(seconds);
  if (rounded < 60) {
    return `${rounded}s`;
  }
  const mins = Math.floor(rounded / 60);
  const remainingSecs = rounded % 60;
  if (mins < 60) {
    return remainingSecs > 0 ? `${mins}m ${remainingSecs}s` : `${mins}m`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

export function formatMonthLabel(monthStr: string): string {
  if (!monthStr || !monthStr.includes("-")) return monthStr;
  const [year, month] = monthStr.split("-");
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const monthIdx = parseInt(month, 10) - 1;
  const name = monthNames[monthIdx] || month;
  return `${name} ${year}`;
}

export function useAnalytics(refreshInterval = 10000) {
  const { data, error, isLoading, mutate } = useSWR<MonthlyAnalyticsResponse>(
    "/api/analytics/monthly",
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      dedupingInterval: 3000,
    }
  );

  return {
    analytics: data,
    overallSummary: data?.overallSummary,
    monthlyMetrics: data?.monthlyMetrics || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useTeamAnalytics(team: Team, refreshInterval = 10000) {
  const { data, error, isLoading, mutate } = useSWR<TeamAnalyticsResponse>(
    team ? `/api/analytics/teams/${team}` : null,
    teamFetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      dedupingInterval: 3000,
    }
  );

  return {
    teamAnalytics: data,
    summary: data?.summary,
    monthlyHistory: data?.monthlyHistory || [],
    isLoading,
    isError: error,
    mutate,
  };
}
