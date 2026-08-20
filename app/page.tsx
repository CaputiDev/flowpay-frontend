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
import { TEAM_LABELS, TEAM_VARIANTS, Team } from "@/app/types/atendimento";

export default function Dashboard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [finishingId, setFinishingId] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                FlowPay MVP
                <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-mono">
                  v1.0.0
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Gerenciamento de Filas & Roteamento Automático
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => mutate()}
              disabled={isLoading}
              title="Atualizar dados da fila"
              aria-label="Atualizar dados da fila"
              className="gap-1.5"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>

            <Button
              onClick={() => setIsDrawerOpen(true)}
              size="sm"
              className="gap-1.5 shadow-sm"
              aria-label="Criar novo atendimento"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Novo Chamado</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner de Erro */}
        {isError && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-3"
          >
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Erro de sincronização:</span> Não foi
              possível conectar ao serviço backend. Tentando reconectar automaticamente...
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => mutate()}
              className="shrink-0 text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Resumo de Equipes / Visão Geral (quando disponível) */}
        {teamSummaries && teamSummaries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {teamSummaries.map((teamSummary) => {
              const label = TEAM_LABELS[teamSummary.team] || teamSummary.team;
              const isFull = teamSummary.currentLoad >= teamSummary.totalCapacity;
              return (
                <div
                  key={teamSummary.team}
                  className="rounded-lg border bg-card/60 p-3.5 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <Badge variant={TEAM_VARIANTS[teamSummary.team] || "secondary"} className="text-[10px] px-1.5 py-0">
                        {label}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      {teamSummary.totalAgents} atendente(s) • Capacidade: {teamSummary.totalCapacity}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-sm">
                      {teamSummary.currentLoad}/{teamSummary.totalCapacity}
                    </div>
                    <span className={`text-[10px] ${isFull ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
                      {teamSummary.waitingCount} na espera
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Grid de Tabelas das Filas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Lado Esquerdo: Fila Ativa */}
          <Card className="w-full overflow-hidden shadow-sm border">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20 border-b">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  <span>Fila Ativa (Processando)</span>
                  {!isLoading && (
                    <Badge variant="info" className="ml-1 text-xs">
                      {activeQueue.length}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  Atendimentos em andamento atribuídos a operadores
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto w-full">
                <Table className="w-full min-w-[420px]">
                  <TableHeader>
                    <TableRow className="bg-muted/10">
                      <TableHead className="w-28">Protocolo / Ref</TableHead>
                      <TableHead>Assunto</TableHead>
                      <TableHead className="w-24">Time</TableHead>
                      <TableHead className="w-28">Atendente</TableHead>
                      <TableHead className="w-24 text-right pr-4">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <TableRow key={`skeleton-ativa-${index}`} aria-hidden="true">
                          <TableCell>
                            <Skeleton className="h-4 w-20 mb-1" />
                            <Skeleton className="h-3 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-3/4" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-16 rounded-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            <Skeleton className="h-7 w-16 ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : activeQueue.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-32 text-center text-muted-foreground"
                        >
                          <div className="flex flex-col items-center justify-center gap-1.5 text-xs">
                            <Inbox className="h-6 w-6 text-muted-foreground/40" />
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
                            <TableCell className="align-top py-3">
                              <div className="font-mono text-xs font-semibold text-foreground">
                                #{item.ticketNumber}
                              </div>
                              <div className="text-[11px] text-muted-foreground font-mono">
                                Ref: {item.chatRef}
                              </div>
                            </TableCell>
                            <TableCell className="align-top py-3">
                              <div className="font-medium text-foreground text-sm leading-snug">
                                {item.subject}
                              </div>
                            </TableCell>
                            <TableCell className="align-top py-3">
                              <Badge variant={teamVariant} className="text-[10px] font-medium whitespace-nowrap">
                                {teamLabel}
                              </Badge>
                            </TableCell>
                            <TableCell className="align-top py-3">
                              <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate max-w-[100px]" title={item.agentName}>
                                  {item.agentName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="align-top py-3 text-right pr-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleFinish(item.id, item.subject, item.ticketNumber)
                                }
                                disabled={isFinishing}
                                aria-label={`Finalizar atendimento #${item.ticketNumber}`}
                                className="h-7 px-2.5 text-xs border-emerald-600/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:border-emerald-500/40 dark:text-emerald-400"
                              >
                                {isFinishing ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                    <span>Finalizando...</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
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

          {/* Lado Direito: Fila de Espera */}
          <Card className="w-full overflow-hidden shadow-sm border">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20 border-b">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-500" />
                  <span>Fila de Espera (Aguardando)</span>
                  {!isLoading && (
                    <Badge variant="warning" className="ml-1 text-xs">
                      {waitingQueue.length}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  Chamados pendentes na fila FIFO aguardando atendente
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto w-full">
                <Table className="w-full min-w-[360px]">
                  <TableHeader>
                    <TableRow className="bg-muted/10">
                      <TableHead className="w-16">Posição</TableHead>
                      <TableHead className="w-28">Protocolo / Ref</TableHead>
                      <TableHead>Assunto</TableHead>
                      <TableHead className="w-24 text-right pr-4">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <TableRow key={`skeleton-espera-${index}`} aria-hidden="true">
                          <TableCell>
                            <Skeleton className="h-5 w-8 rounded-md" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20 mb-1" />
                            <Skeleton className="h-3 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-3/4" />
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            <Skeleton className="h-5 w-16 ml-auto rounded-full" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : waitingQueue.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-32 text-center text-muted-foreground"
                        >
                          <div className="flex flex-col items-center justify-center gap-1.5 text-xs">
                            <Inbox className="h-6 w-6 text-muted-foreground/40" />
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
                            <TableCell className="align-top py-3">
                              <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 bg-background">
                                #{item.position}
                              </Badge>
                            </TableCell>
                            <TableCell className="align-top py-3">
                              <div className="font-mono text-xs font-semibold text-foreground">
                                #{item.ticketNumber}
                              </div>
                              <div className="text-[11px] text-muted-foreground font-mono">
                                Ref: {item.chatRef}
                              </div>
                            </TableCell>
                            <TableCell className="align-top py-3">
                              <div className="font-medium text-foreground text-sm leading-snug">
                                {item.subject}
                              </div>
                            </TableCell>
                            <TableCell className="align-top py-3 text-right pr-4">
                              <Badge variant={teamVariant} className="text-[10px] font-medium whitespace-nowrap">
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