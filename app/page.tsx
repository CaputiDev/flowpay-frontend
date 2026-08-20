"use client";

import { useState } from "react";
import {
  PlusCircle,
  Check,
  Loader2,
  AlertTriangle,
  RefreshCw,
  User,
  Users,
  Layers,
  Inbox,
  Sparkles,
  BarChart3,
  Activity,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useQueues } from "@/app/hooks/useQueues";
import { NewTicketDrawer } from "@/components/new-ticket-drawer";
import { TEAM_LABELS, TEAM_VARIANTS } from "@/app/types/atendimento";

type MobileTab = "overview" | "active" | "waiting";

export default function Dashboard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [finishingId, setFinishingId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("overview");

  const {
    activeQueue,
    waitingQueue,
    teamSummaries,
    isLoading,
    isError,
    mutate,
    createAtendimento,
    finishAtendimento,
  } = useQueues();

  const { toast } = useToast();

  const handleFinish = async (id: string, subject: string, ticketNumber: number | string) => {
    try {
      setFinishingId(id);
      await finishAtendimento(id);
      toast({
        title: "Atendimento finalizado",
        description: `O chamado #${ticketNumber} ("${subject}") foi concluído com sucesso.`,
        variant: "default",
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Erro ao finalizar atendimento. O chamado permanece na fila.";
      toast({
        title: "Falha na finalização",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setFinishingId(null);
    }
  };

  // Métricas consolidadas para a Visão Geral
  const totalActive = activeQueue.length;
  const totalWaiting = waitingQueue.length;
  const totalCapacity = teamSummaries?.reduce((acc, t) => acc + t.totalCapacity, 0) || 0;
  const currentLoad = teamSummaries?.reduce((acc, t) => acc + t.currentLoad, 0) || 0;
  const totalAgents = teamSummaries?.reduce((acc, t) => acc + t.totalAgents, 0) || 0;
  const occupancyRate = totalCapacity > 0 ? Math.round((currentLoad / totalCapacity) * 100) : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col w-full overflow-x-hidden">
      {/* Top Header */}
      <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-20 w-full">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2 truncate">
                FlowPay MVP
                <Badge variant="outline" className="hidden md:inline-flex text-[10px] font-mono">
                  v1.0.0
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block truncate">
                Gerenciamento de Filas & Roteamento Automático
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => mutate()}
              disabled={isLoading}
              title="Atualizar dados da fila"
              aria-label="Atualizar dados da fila"
              className="gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>

            <Button
              onClick={() => setIsDrawerOpen(true)}
              size="sm"
              className="gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3 text-xs shadow-sm"
              aria-label="Criar novo atendimento"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Novo Chamado</span>
            </Button>
          </div>
        </div>

        {/* Barra de Navegação Mobile (Segmented Control) */}
        <div className="md:hidden border-t bg-muted/40 px-3 py-2">
          <div role="tablist" aria-label="Navegação móvel" className="grid grid-cols-3 gap-1 bg-muted p-1 rounded-lg text-xs font-medium">
            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === "overview"}
              onClick={() => setMobileTab("overview")}
              className={`py-1.5 px-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${mobileTab === "overview"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Visão Geral</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === "active"}
              onClick={() => setMobileTab("active")}
              className={`py-1.5 px-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${mobileTab === "active"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              <span>Ativas</span>
              {!isLoading && (
                <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono px-1.5 rounded-full">
                  {totalActive}
                </span>
              )}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === "waiting"}
              onClick={() => setMobileTab("waiting")}
              className={`py-1.5 px-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${mobileTab === "waiting"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Users className="h-3.5 w-3.5 text-amber-500" />
              <span>Espera</span>
              {!isLoading && (
                <span className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono px-1.5 rounded-full">
                  {totalWaiting}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 space-y-6">
        {/* Banner de Erro */}
        {isError && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/50 bg-destructive/10 p-3.5 sm:p-4 text-xs sm:text-sm text-destructive flex items-center gap-3"
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
              className="shrink-0 text-destructive border-destructive/30 hover:bg-destructive/10 h-7 sm:h-8 text-xs"
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {/* 1. SEÇÃO DE VISÃO GERAL (Sempre visível no Desktop; Visível no Mobile na aba "overview") */}
        <section
          className={`space-y-4 ${mobileTab === "overview" ? "block" : "hidden md:block"
            }`}
          aria-label="Visão Geral do Sistema"
        >
          {/* KPI Cards de Destaque */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <Card className="p-3.5 sm:p-4 bg-card/70 border shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground mb-1.5">
                <span className="text-xs font-medium">Em Atendimento</span>
                <Sparkles className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {isLoading ? <Skeleton className="h-7 w-12" /> : totalActive}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {occupancyRate}% da capacidade total
              </p>
            </Card>

            <Card className="p-3.5 sm:p-4 bg-card/70 border shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground mb-1.5">
                <span className="text-xs font-medium">Fila de Espera</span>
                <Users className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {isLoading ? <Skeleton className="h-7 w-12" /> : totalWaiting}
              </div>
            </Card>

            <Card className="p-3.5 sm:p-4 bg-card/70 border shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground mb-1.5">
                <span className="text-xs font-medium">Operadores</span>
                <Headphones className="h-4 w-4 text-primary" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {isLoading ? <Skeleton className="h-7 w-12" /> : `${totalAgents} ativos`}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Capacidade: {totalCapacity} simultâneos
              </p>
            </Card>

            <Card className="p-3.5 sm:p-4 bg-card/70 border shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground mb-1.5">
                <span className="text-xs font-medium">Status do Sistema</span>
                <Activity className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                {isLoading ? (
                  <Skeleton className="h-7 w-16" />
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Operando</span>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Cards Detalhados por Equipe */}
          {teamSummaries && teamSummaries.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {teamSummaries.map((teamSummary) => {
                const label = TEAM_LABELS[teamSummary.team] || teamSummary.team;
                const percent =
                  teamSummary.totalCapacity > 0
                    ? Math.round((teamSummary.currentLoad / teamSummary.totalCapacity) * 100)
                    : 0;
                const isFull = teamSummary.currentLoad >= teamSummary.totalCapacity;

                return (
                  <div
                    key={teamSummary.team}
                    className="rounded-lg border bg-card/90 p-3.5 flex flex-col justify-between space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <Badge
                          variant={TEAM_VARIANTS[teamSummary.team] || "secondary"}
                          className="text-[10px] px-2 py-0.5"
                        >
                          {label}
                        </Badge>
                      </div>
                      <div className="font-mono font-bold text-xs sm:text-sm text-foreground">
                        {teamSummary.currentLoad}/{teamSummary.totalCapacity}
                      </div>
                    </div>

                    {/* Barra de Progresso Visual */}
                    <div className="space-y-1">
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${isFull
                            ? "bg-amber-500"
                            : percent > 70
                              ? "bg-primary"
                              : "bg-emerald-500"
                            }`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{teamSummary.totalAgents} atendente(s)</span>
                        <span className={teamSummary.waitingCount > 0 ? "text-amber-600 dark:text-amber-400 font-medium" : ""}>
                          {teamSummary.waitingCount} na fila de espera
                        </span>
                      </div>
                    </div>

                    {/* Atendentes da Equipe */}
                    {teamSummary.agents && teamSummary.agents.length > 0 && (
                      <div className="pt-2 border-t border-border/60 flex flex-wrap gap-1.5">
                        {teamSummary.agents.map((agent) => (
                          <div
                            key={agent.id}
                            className="inline-flex items-center gap-1 bg-muted/60 text-[10px] px-1.5 py-0.5 rounded text-muted-foreground"
                          >
                            <User className="h-2.5 w-2.5" />
                            <span className="font-medium text-foreground">{agent.name}</span>
                            <span className="font-mono text-[9px]">({agent.currentLoad}/{agent.maxCapacity})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 2. GRID DE TABELAS (No Desktop: 2 colunas lado a lado sem scroll horizontal; No Mobile: controlado por abas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start w-full">
          {/* Lado Esquerdo / Aba 2: Fila Ativa */}
          <Card
            className={`w-full overflow-hidden shadow-sm border ${mobileTab === "active" ? "block" : "hidden md:block"
              }`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20 border-b px-4 py-3">
              <div>
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Fila Ativa (Processando)</span>
                  {!isLoading && (
                    <Badge variant="info" className="ml-1 text-xs px-1.5 py-0">
                      {activeQueue.length}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Atendimentos em andamento atribuídos a operadores
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="bg-muted/10 text-xs">
                      <TableHead className="py-2.5 px-3">Protocolo / Ref</TableHead>
                      <TableHead className="py-2.5 px-3">Assunto</TableHead>
                      <TableHead className="py-2.5 px-2">Time</TableHead>
                      <TableHead className="py-2.5 px-2">Atendente</TableHead>
                      <TableHead className="py-2.5 px-3 text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <TableRow key={`skeleton-ativa-${index}`} aria-hidden="true">
                          <TableCell className="py-3 px-3">
                            <Skeleton className="h-3.5 w-16 mb-1" />
                            <Skeleton className="h-3 w-12" />
                          </TableCell>
                          <TableCell className="py-3 px-3">
                            <Skeleton className="h-3.5 w-3/4" />
                          </TableCell>
                          <TableCell className="py-3 px-2">
                            <Skeleton className="h-4 w-12 rounded-full" />
                          </TableCell>
                          <TableCell className="py-3 px-2">
                            <Skeleton className="h-3.5 w-16" />
                          </TableCell>
                          <TableCell className="py-3 px-3 text-right">
                            <Skeleton className="h-6 w-14 ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : activeQueue.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-28 text-center text-muted-foreground"
                        >
                          <div className="flex flex-col items-center justify-center gap-1 text-xs">
                            <Inbox className="h-5 w-5 text-muted-foreground/40" />
                            <span>Nenhum atendimento em andamento no momento.</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      activeQueue.map((item) => {
                        const isFinishing = finishingId === item.id;
                        const teamLabel = TEAM_LABELS[item.team] || item.team;
                        const teamVariant = TEAM_VARIANTS[item.team] || "secondary";

                        return (
                          <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="py-2.5 px-3 align-middle">
                              <div className="font-mono text-xs font-semibold text-foreground whitespace-nowrap">
                                #{item.ticketNumber}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[100px]" title={item.chatRef}>
                                Ref: {item.chatRef}
                              </div>
                            </TableCell>
                            <TableCell className="py-2.5 px-3 align-middle">
                              <div className="font-medium text-foreground text-xs sm:text-sm line-clamp-2" title={item.subject}>
                                {item.subject}
                              </div>
                            </TableCell>
                            <TableCell className="py-2.5 px-2 align-middle">
                              <Badge variant={teamVariant} className="text-[9px] sm:text-[10px] px-1.5 py-0 font-medium whitespace-nowrap">
                                {teamLabel}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-2.5 px-2 align-middle">
                              <div className="flex items-center gap-1 text-xs text-foreground font-medium">
                                <User className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="truncate max-w-[85px] sm:max-w-[110px]" title={item.agentName}>
                                  {item.agentName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-2.5 px-3 align-middle text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleFinish(item.id, item.subject, item.ticketNumber)
                                }
                                disabled={isFinishing}
                                aria-label={`Finalizar atendimento #${item.ticketNumber}`}
                                className="h-6 sm:h-7 px-2 text-[11px] border-emerald-600/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:border-emerald-500/40 dark:text-emerald-400 shrink-0"
                              >
                                {isFinishing ? (
                                  <>
                                    <Loader2 className="h-2.5 w-2.5 animate-spin mr-1" />
                                    <span className="hidden sm:inline">Finalizando...</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-3 w-3 mr-0.5 sm:mr-1" />
                                    <span>Finalizar</span>
                                  </>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Lado Direito / Aba 3: Fila de Espera */}
          <Card
            className={`w-full overflow-hidden shadow-sm border ${mobileTab === "waiting" ? "block" : "hidden md:block"
              }`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20 border-b px-4 py-3">
              <div>
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Fila de Espera (Aguardando)</span>
                  {!isLoading && (
                    <Badge variant="warning" className="ml-1 text-xs px-1.5 py-0">
                      {waitingQueue.length}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Chamados pendentes na fila FIFO aguardando atendente
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="bg-muted/10 text-xs">
                      <TableHead className="w-12 py-2.5 px-3">Posição</TableHead>
                      <TableHead className="py-2.5 px-3">Protocolo / Ref</TableHead>
                      <TableHead className="py-2.5 px-3">Assunto</TableHead>
                      <TableHead className="py-2.5 px-3 text-right">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <TableRow key={`skeleton-espera-${index}`} aria-hidden="true">
                          <TableCell className="py-3 px-3">
                            <Skeleton className="h-4 w-6 rounded-md" />
                          </TableCell>
                          <TableCell className="py-3 px-3">
                            <Skeleton className="h-3.5 w-16 mb-1" />
                            <Skeleton className="h-3 w-12" />
                          </TableCell>
                          <TableCell className="py-3 px-3">
                            <Skeleton className="h-3.5 w-3/4" />
                          </TableCell>
                          <TableCell className="py-3 px-3 text-right">
                            <Skeleton className="h-4 w-12 ml-auto rounded-full" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : waitingQueue.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-28 text-center text-muted-foreground"
                        >
                          <div className="flex flex-col items-center justify-center gap-1 text-xs">
                            <Inbox className="h-5 w-5 text-muted-foreground/40" />
                            <span>Nenhum chamado na fila de espera.</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      waitingQueue.map((item) => {
                        const teamLabel = TEAM_LABELS[item.team] || item.team;
                        const teamVariant = TEAM_VARIANTS[item.team] || "secondary";

                        return (
                          <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="py-2.5 px-3 align-middle">
                              <Badge variant="outline" className="font-mono text-xs px-1.5 py-0 bg-background font-semibold">
                                #{item.position}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-2.5 px-3 align-middle">
                              <div className="font-mono text-xs font-semibold text-foreground whitespace-nowrap">
                                #{item.ticketNumber}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[100px]" title={item.chatRef}>
                                Ref: {item.chatRef}
                              </div>
                            </TableCell>
                            <TableCell className="py-2.5 px-3 align-middle">
                              <div className="font-medium text-foreground text-xs sm:text-sm line-clamp-2" title={item.subject}>
                                {item.subject}
                              </div>
                            </TableCell>
                            <TableCell className="py-2.5 px-3 align-middle text-right">
                              <Badge variant={teamVariant} className="text-[9px] sm:text-[10px] px-1.5 py-0 font-medium whitespace-nowrap">
                                {teamLabel}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Drawer para Novo Atendimento */}
      <NewTicketDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSubmitTicket={createAtendimento}
      />
    </div>
  );
}