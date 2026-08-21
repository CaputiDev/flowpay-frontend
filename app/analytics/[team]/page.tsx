"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { useTeamAnalytics, formatDuration, formatMonthLabel } from "@/app/hooks/useAnalytics";
import { KpiCard } from "@/components/analytics/kpi-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Team, TEAM_LABELS, TEAM_VARIANTS } from "@/app/types/atendimento";
import {
  CreditCard,
  Landmark,
  HelpCircle,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  Timer,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  Layers,
} from "lucide-react";

const TEAM_ICONS: Record<Team, typeof CreditCard> = {
  CREDIT_CARDS: CreditCard,
  LOANS: Landmark,
  OTHERS: HelpCircle,
};

const TEAM_THEMES: Record<
  Team,
  {
    iconBg: string;
    iconColor: string;
  }
> = {
  CREDIT_CARDS: {
    iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  LOANS: {
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  OTHERS: {
    iconBg: "bg-purple-500/10 dark:bg-purple-500/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
};

export default function TeamAnalyticsPage() {
  const params = useParams();
  const rawTeam = (params?.team as string) || "CREDIT_CARDS";
  const currentTeam = (rawTeam.toUpperCase() in TEAM_LABELS
    ? rawTeam.toUpperCase()
    : "CREDIT_CARDS") as Team;

  const { summary, monthlyHistory, isLoading, isError, mutate } = useTeamAnalytics(currentTeam);
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Inicia a rolagem sempre pelo lado direito (data mais atual)
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [monthlyHistory.length]);

  const label = TEAM_LABELS[currentTeam];
  const Icon = TEAM_ICONS[currentTeam] || HelpCircle;
  const theme = TEAM_THEMES[currentTeam] || TEAM_THEMES.OTHERS;

  // Métricas do período selecionado
  const isAll = selectedMonth === "ALL";
  const selectedMonthlyData = !isAll ? monthlyHistory.find((h) => h.month === selectedMonth) : null;

  const activeMetric = selectedMonthlyData || summary || {
    totalTickets: 0,
    resolvedTickets: 0,
    rejectedTickets: 0,
    inProgressTickets: 0,
    pendingTickets: 0,
    avgWaitingTimeSeconds: 0,
    avgServiceTimeSeconds: 0,
    avgTotalTimeSeconds: 0,
    successRatePercent: 100,
  };

  const successRate =
    activeMetric.successRatePercent != null
      ? Math.round(activeMetric.successRatePercent)
      : activeMetric.totalTickets > 0
      ? Math.round((activeMetric.resolvedTickets / activeMetric.totalTickets) * 100)
      : 100;

  const maxHistoryVolume = Math.max(...monthlyHistory.map((h) => h.totalTickets), 1);
  const chartHeight = 180;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto w-full space-y-8 py-2 md:py-4">
        {/* Barra superior de navegação e atalhos */}
        <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-4">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 h-8 text-xs">
            <Link href="/analytics">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voltar ao Analytics Geral</span>
            </Link>
          </Button>
        </div>

        {/* Header da Equipe */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border border-border/40 shadow-xs ${theme.iconBg} ${theme.iconColor}`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Analytics: {label}
                </h1>
                <Badge variant={TEAM_VARIANTS[currentTeam] || "secondary"} className="text-xs">
                  {label}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Métricas históricas de atendimento, taxas de conclusão e SLA da equipe.
              </p>
            </div>
          </div>

          {/* Seletor de Mês */}
          <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-xl border border-border/60 shrink-0">
            <Calendar className="h-4 w-4 text-muted-foreground ml-2" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-semibold text-foreground focus:outline-none pr-2 py-1 cursor-pointer"
              aria-label="Filtrar período do time"
            >
              <option value="ALL">Todo o Histórico (Geral)</option>
              {monthlyHistory.map((m) => (
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
              sincronizar os dados analíticos desta equipe.
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

        {/* 1. CARDS DE KPIS DO TIME */}
        <section aria-label="KPIs da Equipe">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6">
            {/* Card 1: Total de Chamados */}
            <KpiCard
              title="Chamados Atribuídos"
              value={activeMetric.totalTickets}
              subtitle={`${activeMetric.resolvedTickets} finalizados com sucesso`}
              icon={Layers}
              variant="blue"
              isLoading={isLoading}
            />

            {/* Card 2: Taxa de Resolução */}
            <KpiCard
              title="Taxa de Resolução"
              value={`${successRate}%`}
              subtitle={`${activeMetric.resolvedTickets} de ${activeMetric.totalTickets} concluídos`}
              icon={CheckCircle2}
              variant="emerald"
              isLoading={isLoading}
            />

            {/* Card 3: Chamados Recusados */}
            <KpiCard
              title="Recusados (Fila Cheia)"
              value={activeMetric.rejectedTickets}
              subtitle={
                activeMetric.rejectedTickets > 0
                  ? "Capacidade máxima de fila excedida"
                  : "Nenhum transbordo recusado"
              }
              icon={XCircle}
              variant={activeMetric.rejectedTickets > 0 ? "rose" : "default"}
              isLoading={isLoading}
            />
          </div>
        </section>

        {/* 2. GRÁFICO MENSAL EXCLUSIVO DA EQUIPE (EXIBIDO APENAS NO HISTÓRICO GERAL) */}
        {isAll && (
          <section aria-label="Histórico Mensal da Equipe">
            <Card className="rounded-2xl bg-card/95 border shadow-xs overflow-hidden">
              <CardHeader className="p-5 sm:p-6 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-[#015193]" />
                      <span>Histórico Mensal de {label}</span>
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      Evolução do volume de chamados recebidos, finalizados e recusados pela equipe
                    </CardDescription>
                  </div>

                  {/* Legenda */}
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-xs bg-[#015193]" />
                      <span className="text-muted-foreground">Total</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" />
                      <span className="text-muted-foreground">Resolvidos</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-xs bg-rose-500" />
                      <span className="text-muted-foreground">Recusados</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 pt-0">
                {monthlyHistory.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground">
                    Sem dados históricos suficientes para exibir o gráfico mensal.
                  </div>
                ) : (
                  <div
                    ref={scrollContainerRef}
                    className="relative w-full pt-16 overflow-x-auto pb-4 scrollbar-thin scroll-smooth"
                  >
                    <div className="flex items-end justify-around gap-2 sm:gap-6 h-[220px] pb-8 border-b border-border/40 min-w-full w-max mx-auto px-4">
                      {monthlyHistory.map((item, index) => {
                        const totalHeight = Math.max(
                          (item.totalTickets / maxHistoryVolume) * chartHeight,
                          6
                        );
                        const resolvedHeight = Math.max(
                          (item.resolvedTickets / maxHistoryVolume) * chartHeight,
                          4
                        );
                        const rejectedHeight =
                          item.rejectedTickets > 0
                            ? Math.max((item.rejectedTickets / maxHistoryVolume) * chartHeight, 4)
                            : 0;

                        const isHovered = hoveredIdx === index;

                        return (
                          <div
                            key={item.month}
                            className="flex-1 min-w-[64px] sm:min-w-[80px] flex flex-col items-center justify-end h-full relative group"
                          >
                            {/* Tooltip flutuante na camada mais superior */}
                            {isHovered && (
                              <div className="absolute -top-14 z-50 bg-popover text-popover-foreground border border-border shadow-xl rounded-xl px-3 py-2 text-xs min-w-[140px] pointer-events-none transition-all">
                                <div className="font-bold text-[11px] mb-1">{formatMonthLabel(item.month)}</div>
                                <div className="flex justify-between gap-2 text-[10px]">
                                  <span>Total:</span>
                                  <span className="font-mono font-bold">{item.totalTickets}</span>
                                </div>
                                <div className="flex justify-between gap-2 text-[10px] text-emerald-600 dark:text-emerald-400">
                                  <span>Resolvidos:</span>
                                  <span className="font-mono font-bold">{item.resolvedTickets}</span>
                                </div>
                                {item.rejectedTickets > 0 && (
                                  <div className="flex justify-between gap-2 text-[10px] text-rose-600 dark:text-rose-400">
                                    <span>Recusados:</span>
                                    <span className="font-mono font-bold">{item.rejectedTickets}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            <div
                              className="flex items-end gap-1 sm:gap-1.5 w-full max-w-[60px] justify-center cursor-pointer p-0.5 rounded-t-md hover:bg-muted/20 transition-colors"
                              onMouseEnter={() => setHoveredIdx(index)}
                              onMouseLeave={() => setHoveredIdx(null)}
                            >
                              <div
                                className={`w-3 sm:w-4 rounded-t-md bg-[#015193] transition-all duration-300 ${
                                  isHovered ? "opacity-100 scale-y-105" : "opacity-85 hover:opacity-100"
                                }`}
                                style={{ height: `${totalHeight}px` }}
                                title={`Total: ${item.totalTickets}`}
                              />
                              <div
                                className={`w-3 sm:w-4 rounded-t-md bg-emerald-500 transition-all duration-300 ${
                                  isHovered ? "opacity-100 scale-y-105" : "opacity-85 hover:opacity-100"
                                }`}
                                style={{ height: `${resolvedHeight}px` }}
                                title={`Resolvidos: ${item.resolvedTickets}`}
                              />
                              {rejectedHeight > 0 && (
                                <div
                                  className={`w-2.5 sm:w-3.5 rounded-t-md bg-rose-500 transition-all duration-300 ${
                                    isHovered ? "opacity-100 scale-y-105" : "opacity-85 hover:opacity-100"
                                  }`}
                                  style={{ height: `${rejectedHeight}px` }}
                                  title={`Recusados: ${item.rejectedTickets}`}
                                />
                              )}
                            </div>

                            <span
                              className={`absolute -bottom-6 text-[10px] sm:text-xs font-mono text-center truncate max-w-full cursor-pointer transition-colors ${
                                isHovered ? "text-foreground font-semibold" : "text-muted-foreground"
                              }`}
                              onMouseEnter={() => setHoveredIdx(index)}
                              onMouseLeave={() => setHoveredIdx(null)}
                            >
                              {item.month.split("-")[1]}/{item.month.split("-")[0].slice(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* 3. SLA E TEMPO DE ATENDIMENTO DA EQUIPE */}
        <section aria-label="Indicadores de SLA da Equipe">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
            {/* Card Tempo em Fila */}
            <Card className="p-5 sm:p-6 bg-card/95 border shadow-xs rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                    Tempo Médio em Fila de Espera
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <div className="text-3xl font-bold font-mono text-foreground">
                    {formatDuration(activeMetric.avgWaitingTimeSeconds)}
                  </div>
                </div>
              </div>
              <p className="mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground">
                Tempo que os clientes da fila de {label} aguardam até o início do atendimento.
              </p>
            </Card>

            {/* Card Tempo de Atendimento */}
            <Card className="p-5 sm:p-6 bg-card/95 border shadow-xs rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                    Tempo Médio de Atendimento
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <Timer className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <div className="text-3xl font-bold font-mono text-foreground">
                    {formatDuration(activeMetric.avgServiceTimeSeconds)}
                  </div>
                </div>
              </div>
              <p className="mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground">
                Duração média que os atendentes de {label} levam para resolver a solicitação.
              </p>
            </Card>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
