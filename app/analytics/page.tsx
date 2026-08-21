"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAnalytics, formatDuration, formatMonthLabel } from "@/app/hooks/useAnalytics";
import { KpiCard } from "@/components/analytics/kpi-card";
import { MonthlyBarChart } from "@/components/analytics/monthly-bar-chart";
import { TeamDistributionChart } from "@/components/analytics/team-distribution-chart";
import { SlaComparisonChart } from "@/components/analytics/sla-comparison-chart";
import { TeamMetricCard } from "@/components/analytics/team-metric-card";
import { Button } from "@/components/ui/button";
import { Team, TeamMetricDto } from "@/app/types/atendimento";
import {
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  Timer,
  Calendar,
  AlertTriangle,
  Layers,
} from "lucide-react";

export default function AnalyticsPage() {
  const { overallSummary, monthlyMetrics, isLoading, isError, mutate } = useAnalytics();
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");

  // Dados do período selecionado (Geral ou Mês específico)
  const isAll = selectedMonth === "ALL";
  const currentMonthly = monthlyMetrics.find((m) => m.month === selectedMonth);

  const activeTotal = isAll ? overallSummary?.totalTickets : currentMonthly?.totalTickets;
  const activeResolved = isAll ? overallSummary?.totalResolved : currentMonthly?.resolvedTickets;
  const activeRejected = isAll ? overallSummary?.totalRejected : currentMonthly?.rejectedTickets;
  const activeAvgWaiting = isAll ? overallSummary?.avgWaitingTimeSeconds : currentMonthly?.avgWaitingTimeSeconds;
  const activeAvgService = isAll ? overallSummary?.avgServiceTimeSeconds : currentMonthly?.avgServiceTimeSeconds;
  const activeAvgTotal = isAll ? overallSummary?.avgTotalTimeSeconds : currentMonthly?.avgTotalTimeSeconds;

  const totalNum = activeTotal || 0;
  const resolvedNum = activeResolved || 0;
  const rejectedNum = activeRejected || 0;
  const successRate = totalNum > 0 ? Math.round((resolvedNum / totalNum) * 100) : 100;

  // Monta o mapa byTeam para os gráficos de time
  const activeByTeam: Record<string, TeamMetricDto> = {};
  if (!isAll && currentMonthly?.byTeam) {
    const teams: Team[] = ["CREDIT_CARDS", "LOANS", "OTHERS"];
    teams.forEach((t) => {
      const tm = currentMonthly.byTeam[t];
      if (tm) {
        activeByTeam[t] = {
          ...tm,
          avgServiceTimeSeconds:
            tm.avgServiceTimeSeconds ??
            ((tm as unknown as Record<string, unknown>)?.serviceTimeSeconds as number) ??
            0,
        };
      }
    });
  } else if (monthlyMetrics.length > 0) {
    // Consolida todos os meses por time
    const teams: Team[] = ["CREDIT_CARDS", "LOANS", "OTHERS"];
    teams.forEach((t) => {
      let teamTotal = 0;
      let teamResolved = 0;
      let teamRejected = 0;
      let waitingSum = 0;
      let serviceSum = 0;
      let waitingCount = 0;
      let serviceCount = 0;

      monthlyMetrics.forEach((m) => {
        const tm = m.byTeam?.[t];
        if (tm) {
          teamTotal += tm.totalTickets || 0;
          teamResolved += tm.resolvedTickets || 0;
          teamRejected += tm.rejectedTickets || 0;

          const waitTime = tm.avgWaitingTimeSeconds ?? 0;
          const servTime =
            tm.avgServiceTimeSeconds ??
            ((tm as unknown as Record<string, unknown>)?.serviceTimeSeconds as number) ??
            0;

          if (waitTime > 0) {
            waitingSum += waitTime;
            waitingCount++;
          }
          if (servTime > 0) {
            serviceSum += servTime;
            serviceCount++;
          }
        }
      });

      activeByTeam[t] = {
        team: t,
        totalTickets: teamTotal,
        resolvedTickets: teamResolved,
        rejectedTickets: teamRejected,
        avgWaitingTimeSeconds: waitingCount > 0 ? waitingSum / waitingCount : 0,
        avgServiceTimeSeconds: serviceCount > 0 ? serviceSum / serviceCount : 0,
      };
    });
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto w-full space-y-8 py-2 md:py-4">
        {/* Header da Página com Filtro de Mês */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-[#015193]" />
              <span>Painel de Analytics & Métricas</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Consolidação de volume, SLA de atendimento, taxas de resolução e histórico mensal.
            </p>
          </div>

          {/* Seletor de Período */}
          <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-xl border border-border/60 shrink-0">
            <Calendar className="h-4 w-4 text-muted-foreground ml-2" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-semibold text-foreground focus:outline-none pr-2 py-1 cursor-pointer"
              aria-label="Filtrar por período"
            >
              <option value="ALL">Todo o Histórico (Geral)</option>
              {monthlyMetrics.map((m) => (
                <option key={m.month} value={m.month}>
                  {formatMonthLabel(m.month)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Banner de Erro */}
        {isError && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive flex items-center gap-3 shadow-xs"
          >
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Erro ao carregar métricas:</span> Não foi possível
              sincronizar os dados de analytics com o servidor.
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => mutate()}
              className="shrink-0 text-destructive border-destructive/30 hover:bg-destructive/10 h-8 text-xs font-medium"
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {/* 1. CARDS DE KPIS CONSOLIDADOS */}
        <section aria-label="Indicadores Chave de Desempenho">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {/* Card 1: Total de Chamados */}
            <KpiCard
              title="Total de Chamados"
              value={totalNum}
              subtitle={`${resolvedNum} finalizados com sucesso`}
              icon={Layers}
              variant="blue"
              isLoading={isLoading}
            />

            {/* Card 2: Taxa de Resolução */}
            <KpiCard
              title="Taxa de Resolução"
              value={`${successRate}%`}
              subtitle={`${resolvedNum} de ${totalNum} solicitações`}
              icon={CheckCircle2}
              variant="emerald"
              isLoading={isLoading}
            />

            {/* Card 3: Chamados Recusados (Overflow de Fila) */}
            <KpiCard
              title="Chamados Recusados"
              value={rejectedNum}
              subtitle={rejectedNum > 0 ? "Excederam o limite da fila" : "Nenhum transbordo recusado"}
              icon={XCircle}
              variant={rejectedNum > 0 ? "rose" : "default"}
              isLoading={isLoading}
            />

            {/* Card 4: Tempo Médio de Espera */}
            <KpiCard
              title="Espera Média em Fila"
              value={formatDuration(activeAvgWaiting)}
              subtitle="Tempo decorrido até atribuição"
              icon={Clock}
              variant="amber"
              isLoading={isLoading}
            />

            {/* Card 5: Tempo Médio de Atendimento */}
            <KpiCard
              title="Tempo Médio de Atendimento"
              value={formatDuration(activeAvgService)}
              subtitle="Duração ativa com o operador"
              icon={Timer}
              variant="blue"
              isLoading={isLoading}
            />

            {/* Card 6: Tempo Médio Total */}
            <KpiCard
              title="Tempo Médio Total"
              value={formatDuration(activeAvgTotal)}
              subtitle="Espera + Atendimento do chamado"
              icon={BarChart3}
              variant="purple"
              isLoading={isLoading}
            />
          </div>
        </section>

        {/* 2. GRÁFICO HISTÓRICO MENSAL (OCUPA 2 ESPAÇOS NO DESKTOP - EXIBIDO APENAS NO HISTÓRICO GERAL) */}
        {isAll && (
          <section aria-label="Histórico Mensal Geral">
            <MonthlyBarChart data={monthlyMetrics} isLoading={isLoading} />
          </section>
        )}

        {/* 3. DISTRIBUIÇÃO POR EQUIPE (OCUPA 2 ESPAÇOS NO DESKTOP) */}
        <section aria-label="Distribuição por Equipe">
          <TeamDistributionChart data={activeByTeam} isLoading={isLoading} />
        </section>

        {/* 4. SLA E TEMPOS MÉDIOS POR TIME */}
        <section aria-label="SLA por Equipe">
          <SlaComparisonChart byTeam={activeByTeam} isLoading={isLoading} />
        </section>

        {/* 5. CARDS DETALHADOS POR EQUIPE */}
        <section aria-label="Desempenho por Equipe" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
              Detalhamento por Equipe
            </h2>
            <span className="text-xs text-muted-foreground">
              Clique no card para acessar a visão analítica detalhada da equipe
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {(["CREDIT_CARDS", "LOANS", "OTHERS"] as Team[]).map((team) => (
              <TeamMetricCard
                key={team}
                team={team}
                metric={activeByTeam[team]}
                isLoading={isLoading}
              />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
