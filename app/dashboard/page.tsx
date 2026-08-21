"use client";

import Link from "next/link";
import {
  Activity,
  UserCheck,
  Clock,
  CreditCard,
  Landmark,
  HelpCircle,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueues } from "@/app/hooks/useQueues";
import { AppShell } from "@/components/app-shell";
import { TEAM_LABELS, TEAM_VARIANTS, Team } from "@/app/types/atendimento";

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

export default function DashboardPage() {
  const {
    activeQueue,
    waitingQueue,
    teamSummaries,
    isLoading,
    isError,
    mutate,
  } = useQueues();

  // Métricas consolidadas
  const totalActive = activeQueue.length;
  const totalWaiting = waitingQueue.length;
  const totalCapacity = teamSummaries?.reduce((acc, t) => acc + t.totalCapacity, 0) || 0;
  const currentLoad = teamSummaries?.reduce((acc, t) => acc + t.currentLoad, 0) || 0;
  const totalAgents = teamSummaries?.reduce((acc, t) => acc + t.totalAgents, 0) || 0;
  const occupancyRate = totalCapacity > 0 ? Math.round((currentLoad / totalCapacity) * 100) : 0;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto w-full space-y-8 py-2 md:py-4">
        {/* Banner de Erro */}
        {isError && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive flex items-center gap-3 shadow-xs"
          >
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Erro de sincronização:</span> Não foi
              possível conectar ao serviço backend. Tentando reconectar automaticamente...
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

        {/* 1. TRÊS CARDS SUPERIORES: Em atendimento, Fila de espera, e Atendentes ativos */}
        <section aria-label="Métricas Principais">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {/* Card 1: Em atendimento */}
            <Card className="p-5 sm:p-6 bg-card/95 border shadow-xs hover:shadow-md transition-all rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                    Em atendimento
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Activity className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <div className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                    {isLoading ? <Skeleton className="h-9 w-16" /> : totalActive}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    chamados ativos
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>{occupancyRate}% da capacidade total ({currentLoad}/{totalCapacity})</span>
              </div>
            </Card>

            {/* Card 2: Fila de espera */}
            <Card className="p-5 sm:p-6 bg-card/95 border shadow-xs hover:shadow-md transition-all rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                    Fila de espera
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <div className={`text-3xl sm:text-4xl font-bold tracking-tight ${
                    totalWaiting > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"
                  }`}>
                    {isLoading ? <Skeleton className="h-9 w-16" /> : totalWaiting}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    em aguardo
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${totalWaiting > 0 ? "bg-amber-500" : "bg-muted-foreground/40"}`} />
                <span>{totalWaiting > 0 ? "Atendimentos na fila" : "Nenhum chamado aguardando"}</span>
              </div>
            </Card>

            {/* Card 3: Atendentes ativos */}
            <Card className="p-5 sm:p-6 bg-card/95 border shadow-xs hover:shadow-md transition-all rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                    Atendentes ativos
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <UserCheck className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <div className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                    {isLoading ? <Skeleton className="h-9 w-16" /> : totalAgents}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    operadores alocados
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <span>Capacidade máxima: {totalCapacity} atendimentos</span>
              </div>
            </Card>
          </div>
        </section>

        {/* 2. CARTÕES POR EQUIPE (CLICÁVEIS -> ANALYTICS) */}
        <section aria-label="Equipes de Atendimento" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
              Equipes de Atendimento
            </h2>
            <span className="text-xs text-muted-foreground">
              Clique no card para abrir o painel analítico detalhado da equipe
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={`skeleton-team-${index}`} className="p-5 sm:p-6 bg-card/90 border shadow-xs space-y-4 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </Card>
              ))}
            </div>
          ) : teamSummaries && teamSummaries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
              {teamSummaries.map((teamSummary) => {
                const label = TEAM_LABELS[teamSummary.team] || teamSummary.team;
                const Icon = TEAM_ICONS[teamSummary.team] || HelpCircle;
                const theme = TEAM_THEMES[teamSummary.team] || TEAM_THEMES.OTHERS;
                const percent =
                  teamSummary.totalCapacity > 0
                    ? Math.round((teamSummary.currentLoad / teamSummary.totalCapacity) * 100)
                    : 0;
                const isFull = teamSummary.currentLoad >= teamSummary.totalCapacity;

                return (
                  <Link
                    key={teamSummary.team}
                    href={`/${teamSummary.team}`}
                    className="block group focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-2xl transition-all"
                  >
                    <Card className="p-5 sm:p-6 bg-card/95 border shadow-xs group-hover:border-primary/50 group-hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer h-full rounded-2xl">
                      {/* Top: Ícone, Nome da Equipe e Link Indicator */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${theme.iconBg} ${theme.iconColor} group-hover:scale-105 transition-transform`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="font-semibold text-sm sm:text-base text-foreground truncate group-hover:text-primary transition-colors">
                            {label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge
                            variant={TEAM_VARIANTS[teamSummary.team] || "secondary"}
                            className="text-[10px] sm:text-xs px-2 py-0.5 font-medium"
                          >
                            {isFull ? "Lotado" : `${percent}% ocupado`}
                          </Badge>
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>

                      {/* Métricas: Atendimentos/Capacidade Máxima e Fila de Espera */}
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40">
                        <div>
                          <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                            Atendimentos
                          </div>
                          <div className="text-lg font-bold font-mono text-foreground mt-0.5">
                            {teamSummary.currentLoad}
                            <span className="text-xs font-normal text-muted-foreground">
                              /{teamSummary.totalCapacity}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                            Fila de espera
                          </div>
                          <div className={`text-lg font-bold font-mono mt-0.5 ${
                            teamSummary.waitingCount > 0
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-foreground"
                          }`}>
                            {teamSummary.waitingCount}
                            <span className="text-xs font-normal text-muted-foreground">
                              /{teamSummary.maxQueueCapacity}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Barra de Progresso Minimalista */}
                      <div className="space-y-1 pt-1">
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isFull
                                ? "bg-amber-500"
                                : percent > 70
                                ? "bg-primary"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
