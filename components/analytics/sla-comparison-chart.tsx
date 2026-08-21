"use client";

import React from "react";
import Link from "next/link";
import { Team, TeamMetricDto, TEAM_LABELS } from "@/app/types/atendimento";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatDuration } from "@/app/hooks/useAnalytics";
import { Clock, Timer, ArrowUpRight } from "lucide-react";

interface SlaComparisonChartProps {
  byTeam: Record<string, TeamMetricDto>;
  isLoading?: boolean;
}

export function SlaComparisonChart({ byTeam, isLoading }: SlaComparisonChartProps) {
  if (isLoading) {
    return (
      <Card className="rounded-2xl p-6 bg-card/95 border shadow-xs h-[300px] flex items-center justify-center">
        <div className="text-xs text-muted-foreground animate-pulse">
          Carregando indicadores de SLA...
        </div>
      </Card>
    );
  }

  const teams: Team[] = ["CREDIT_CARDS", "LOANS", "OTHERS"];

  // Calcula o valor máximo de tempo para normalização das barras
  const maxTime = Math.max(
    ...teams.flatMap((t) => [
      byTeam?.[t]?.avgWaitingTimeSeconds || 0,
      byTeam?.[t]?.avgServiceTimeSeconds || 0,
    ]),
    30
  );

  return (
    <Card className="rounded-2xl bg-card/95 border shadow-xs flex flex-col justify-between overflow-hidden">
      <CardHeader className="p-5 sm:p-6 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Timer className="h-4 w-4 text-[#015193]" />
              <span>SLA e Tempos Médios por Equipe</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Comparativo de tempo médio em fila de espera e tempo de resolução por atendente
            </CardDescription>
          </div>

          {/* Legenda */}
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-amber-500" />
              <span className="text-muted-foreground">Espera em Fila</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-blue-500" />
              <span className="text-muted-foreground">Tempo de Atendimento</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 pt-4 space-y-6">
        {teams.map((team) => {
          const metric = byTeam?.[team];
          const waitingSecs = metric?.avgWaitingTimeSeconds || 0;
          const serviceSecs = metric?.avgServiceTimeSeconds || 0;

          const waitingPercent = Math.min((waitingSecs / maxTime) * 100, 100);
          const servicePercent = Math.min((serviceSecs / maxTime) * 100, 100);

          return (
            <Link
              key={team}
              href={`/analytics/${team}`}
              className="block space-y-2 group cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                  {TEAM_LABELS[team]}
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {formatDuration(waitingSecs)}
                  </span>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                    <Timer className="h-3 w-3" /> {formatDuration(serviceSecs)}
                  </span>
                </div>
              </div>

              {/* Duas barras de progresso horizontais */}
              <div className="space-y-1.5 bg-muted/20 p-2.5 rounded-xl border border-border/40 group-hover:border-primary/40 group-hover:bg-muted/40 transition-all">
                {/* Barra de Espera */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground w-16 truncate">
                    Fila
                  </span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(waitingPercent, 2)}%` }}
                    />
                  </div>
                </div>

                {/* Barra de Atendimento */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground w-16 truncate">
                    Serviço
                  </span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(servicePercent, 2)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
