"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useMemo } from "react";
import {
  CreditCard,
  Landmark,
  HelpCircle,
  ArrowLeft,
  Activity,
  Clock,
  UserCheck,
  User,
  Check,
  Loader2,
  Inbox,
  Search,
  ChevronDown,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useQueues } from "@/app/hooks/useQueues";
import { AppShell } from "@/components/app-shell";
import { Team, TEAM_LABELS, TEAM_VARIANTS } from "@/app/types/atendimento";

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
    borderAccent: string;
    description: string;
  }
> = {
  CREDIT_CARDS: {
    iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderAccent: "border-blue-500/30",
    description: "Fila especializada em emissão, limites, bloqueios e faturas de cartão.",
  },
  LOANS: {
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderAccent: "border-amber-500/30",
    description: "Fila especializada em simulações, contratações e renegociações de crédito.",
  },
  OTHERS: {
    iconBg: "bg-purple-500/10 dark:bg-purple-500/20",
    iconColor: "text-purple-600 dark:text-purple-400",
    borderAccent: "border-purple-500/30",
    description: "Fila de triagem e suporte para assuntos gerais e dúvidas diversas.",
  },
};

export default function TeamPage() {
  const params = useParams();
  const rawTeam = (params?.team as string)?.toUpperCase() as Team;
  const team: Team = rawTeam in TEAM_LABELS ? rawTeam : "CREDIT_CARDS";

  const [finishingId, setFinishingId] = useState<string | null>(null);

  // Estados de recolhimento/expansão com persistência no localStorage
  const [isOperatorsExpanded, setIsOperatorsExpanded] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const saved = localStorage.getItem("flowpay:team:operators:expanded");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  const [isActiveExpanded, setIsActiveExpanded] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const saved = localStorage.getItem("flowpay:team:active:expanded");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  const [isWaitingExpanded, setIsWaitingExpanded] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const saved = localStorage.getItem("flowpay:team:waiting:expanded");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  // Estados de busca/filtro
  const [operatorSearch, setOperatorSearch] = useState<string>("");
  const [activeSearch, setActiveSearch] = useState<string>("");
  const [waitingSearch, setWaitingSearch] = useState<string>("");

  const toggleOperators = () => {
    setIsOperatorsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("flowpay:team:operators:expanded", String(next));
      } catch { }
      return next;
    });
  };

  const toggleActive = () => {
    setIsActiveExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("flowpay:team:active:expanded", String(next));
      } catch { }
      return next;
    });
  };

  const toggleWaiting = () => {
    setIsWaitingExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("flowpay:team:waiting:expanded", String(next));
      } catch { }
      return next;
    });
  };

  const {
    activeQueue,
    waitingQueue,
    teamSummaries,
    isLoading,
    finishAtendimento,
  } = useQueues();

  const { toast } = useToast();

  const teamSummary = teamSummaries?.find((t) => t.team === team);
  const teamActiveQueue = activeQueue.filter((item) => item.team === team);
  const teamWaitingQueue = waitingQueue.filter((item) => item.team === team);
  const teamAgents = teamSummary?.agents;

  // Operadores filtrados por nome
  const filteredAgents = useMemo(() => {
    if (!teamAgents) return [];
    if (!operatorSearch.trim()) return teamAgents;
    const query = operatorSearch.trim().toLowerCase();
    return teamAgents.filter((a) => a.name.toLowerCase().includes(query));
  }, [teamAgents, operatorSearch]);

  // Fila ativa filtrada por protocolo, assunto, atendente ou referência
  const filteredActiveQueue = useMemo(() => {
    if (!activeSearch.trim()) return teamActiveQueue;
    const query = activeSearch.trim().toLowerCase();
    return teamActiveQueue.filter(
      (item) =>
        item.ticketNumber.toString().includes(query) ||
        item.subject.toLowerCase().includes(query) ||
        item.agentName.toLowerCase().includes(query) ||
        item.chatRef.toLowerCase().includes(query)
    );
  }, [teamActiveQueue, activeSearch]);

  // Fila de espera filtrada por protocolo, assunto ou referência
  const filteredWaitingQueue = useMemo(() => {
    if (!waitingSearch.trim()) return teamWaitingQueue;
    const query = waitingSearch.trim().toLowerCase();
    return teamWaitingQueue.filter(
      (item) =>
        item.ticketNumber.toString().includes(query) ||
        item.subject.toLowerCase().includes(query) ||
        item.position.toString().includes(query) ||
        item.chatRef.toLowerCase().includes(query)
    );
  }, [teamWaitingQueue, waitingSearch]);

  const label = TEAM_LABELS[team] || team;
  const Icon = TEAM_ICONS[team] || HelpCircle;
  const theme = TEAM_THEMES[team] || TEAM_THEMES.OTHERS;

  const currentLoad = teamSummary?.currentLoad ?? teamActiveQueue.length;
  const totalCapacity = teamSummary?.totalCapacity ?? 0;
  const waitingCount = teamSummary?.waitingCount ?? teamWaitingQueue.length;
  const maxQueueCapacity = teamSummary?.maxQueueCapacity ?? 3;
  const totalAgents = teamSummary?.totalAgents ?? 0;
  const occupancyPercent = totalCapacity > 0 ? Math.round((currentLoad / totalCapacity) * 100) : 0;
  const isFull = currentLoad >= totalCapacity && totalCapacity > 0;

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
    <AppShell>
      <div className="space-y-6">
        {/* Botão Voltar */}
        <div className="flex items-center justify-end">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 h-8 text-xs">
            <Link href="/dashboard">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voltar ao Dashboard</span>
            </Link>
          </Button>
        </div>

        {/* Header da Equipe */}
        <Card className="p-4 sm:p-6 bg-card/90 border shadow-xs rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${theme.iconBg} ${theme.iconColor} shadow-xs`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Equipe de {label}
                  </h1>
                  <Badge variant={TEAM_VARIANTS[team] || "secondary"} className="text-xs">
                    {isFull ? "Capacidade Máxima" : "Operando"}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {theme.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Taxa de Ocupação</div>
                <div className="text-lg sm:text-xl font-bold font-mono text-foreground">
                  {occupancyPercent}%
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 3 KPIs Principais da Equipe */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* KPI 1: Atendimentos em Andamento */}
          <Card className="p-4 sm:p-5 bg-card/90 border shadow-xs rounded-2xl">
            <div className="flex items-center justify-between text-muted-foreground mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider">Atendimentos Ativos</span>
              <Activity className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-8 w-14" /> : `${currentLoad}/${totalCapacity}`}
            </div>
            <div className="mt-2 w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${isFull ? "bg-amber-500" : occupancyPercent > 70 ? "bg-primary" : "bg-emerald-500"
                  }`}
                style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              {totalCapacity - currentLoad} vagas disponíveis no time
            </p>
          </Card>

          {/* KPI 2: Fila de Espera */}
          <Card className="p-4 sm:p-5 bg-card/90 border shadow-xs rounded-2xl">
            <div className="flex items-center justify-between text-muted-foreground mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider">Fila de Espera</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className={`text-2xl sm:text-3xl font-bold ${waitingCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"
              }`}>
              {isLoading ? <Skeleton className="h-8 w-14" /> : `${waitingCount}/${maxQueueCapacity}`}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Limite de tolerância da fila (máx {maxQueueCapacity})
            </p>
          </Card>

          {/* KPI 3: Operadores */}
          <Card className="p-4 sm:p-5 bg-card/90 border shadow-xs rounded-2xl">
            <div className="flex items-center justify-between text-muted-foreground mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider">Operadores Ativos</span>
              <UserCheck className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-8 w-14" /> : totalAgents}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Até 3 atendimentos simultâneos por atendente
            </p>
          </Card>
        </div>

        {/* Seção de Operadores da Equipe */}
        {teamSummary?.agents && teamSummary.agents.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={toggleOperators}
                aria-expanded={isOperatorsExpanded}
                aria-label="Expandir ou recolher operadores alocados"
                className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
              >
                <span>Operadores Alocados ({teamSummary.agents.length})</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 text-muted-foreground group-hover:text-foreground ${isOperatorsExpanded ? "rotate-0" : "-rotate-90"
                    }`}
                />
              </button>

              {isOperatorsExpanded && (
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Pesquisar por operador..."
                    value={operatorSearch}
                    onChange={(e) => setOperatorSearch(e.target.value)}
                    className="h-8 pl-8 pr-8 text-xs bg-background rounded-lg"
                    aria-label="Pesquisar operador pelo nome"
                  />
                  {operatorSearch && (
                    <button
                      type="button"
                      onClick={() => setOperatorSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      aria-label="Limpar pesquisa de operador"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {isOperatorsExpanded && (
              filteredAgents.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground bg-card/50 border rounded-2xl">
                  Nenhum operador encontrado com o nome &quot;{operatorSearch}&quot;.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredAgents.map((agent) => {
                    const agentPercent =
                      agent.maxCapacity > 0
                        ? Math.round((agent.currentLoad / agent.maxCapacity) * 100)
                        : 0;
                    const isAgentFull = agent.currentLoad >= agent.maxCapacity;

                    return (
                      <Card key={agent.id} className="p-3.5 bg-card/80 border shadow-xs space-y-2.5 rounded-2xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <User className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-semibold text-xs text-foreground truncate">
                              {agent.name}
                            </span>
                          </div>
                          <Badge
                            variant={isAgentFull ? "warning" : "secondary"}
                            className="text-[10px] px-1.5 py-0 font-medium"
                          >
                            {isAgentFull ? "Lotado" : `${agent.availableCapacity} livre(s)`}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Carga atual</span>
                            <span className="font-mono font-semibold text-foreground">
                              {agent.currentLoad}/{agent.maxCapacity}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${isAgentFull ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                              style={{ width: `${Math.min(agentPercent, 100)}%` }}
                            />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )
            )}
          </div>
        )}

        {/* Tabelas de Fila Ativa e Fila de Espera desta Equipe */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Fila Ativa */}
          <Card className="w-full overflow-hidden shadow-xs border rounded-2xl">
            <CardHeader className="flex flex-col gap-2.5 pb-3 bg-muted/20 border-b px-4 py-3.5">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={toggleActive}
                  aria-expanded={isActiveExpanded}
                  aria-label="Expandir ou recolher chamados em atendimento"
                  className="flex items-center gap-2 text-left group cursor-pointer"
                >
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Em Atendimento ({teamActiveQueue.length})</span>
                  </CardTitle>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 text-muted-foreground group-hover:text-foreground ${isActiveExpanded ? "rotate-0" : "-rotate-90"
                      }`}
                  />
                </button>
              </div>

              {isActiveExpanded && (
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Pesquisar por protocolo, assunto ou atendente..."
                    value={activeSearch}
                    onChange={(e) => setActiveSearch(e.target.value)}
                    className="h-8 pl-8 pr-8 text-xs bg-background rounded-lg"
                    aria-label="Pesquisar chamados em atendimento"
                  />
                  {activeSearch && (
                    <button
                      type="button"
                      onClick={() => setActiveSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      aria-label="Limpar pesquisa de atendimentos"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </CardHeader>

            {isActiveExpanded && (
              <CardContent className="p-0">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="bg-muted/10 text-xs">
                      <TableHead className="py-2.5 px-3">Protocolo / Ref</TableHead>
                      <TableHead className="py-2.5 px-3">Assunto</TableHead>
                      <TableHead className="py-2.5 px-2">Atendente</TableHead>
                      <TableHead className="py-2.5 px-3 text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 2 }).map((_, index) => (
                        <TableRow key={`skeleton-ativa-${index}`} aria-hidden="true">
                          <TableCell className="py-3 px-3"><Skeleton className="h-3.5 w-16" /></TableCell>
                          <TableCell className="py-3 px-3"><Skeleton className="h-3.5 w-3/4" /></TableCell>
                          <TableCell className="py-3 px-2"><Skeleton className="h-3.5 w-16" /></TableCell>
                          <TableCell className="py-3 px-3 text-right"><Skeleton className="h-6 w-14 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredActiveQueue.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-28 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-1.5 text-xs py-3">
                            <Inbox className="h-5 w-5 text-muted-foreground/40" />
                            <span>
                              {activeSearch
                                ? `Nenhum atendimento encontrado para "${activeSearch}".`
                                : "Nenhum atendimento em andamento nesta equipe."}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredActiveQueue.map((item) => {
                        const isFinishing = finishingId === item.id;
                        return (
                          <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="py-2.5 px-3 align-middle">
                              <div className="font-mono text-xs font-semibold text-foreground whitespace-nowrap">
                                #{item.ticketNumber}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[90px]" title={item.chatRef}>
                                Ref: {item.chatRef}
                              </div>
                            </TableCell>
                            <TableCell className="py-2.5 px-3 align-middle">
                              <div className="font-medium text-foreground text-xs line-clamp-2" title={item.subject}>
                                {item.subject}
                              </div>
                            </TableCell>
                            <TableCell className="py-2.5 px-2 align-middle">
                              <div className="flex items-center gap-1 text-xs text-foreground font-medium">
                                <User className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="truncate max-w-[85px]" title={item.agentName}>
                                  {item.agentName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-2.5 px-3 align-middle text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFinish(item.id, item.subject, item.ticketNumber)}
                                disabled={isFinishing}
                                aria-label={`Finalizar atendimento #${item.ticketNumber}`}
                                className="h-6 sm:h-7 px-2 text-[11px] border-emerald-600/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:border-emerald-500/40 dark:text-emerald-400 shrink-0"
                              >
                                {isFinishing ? (
                                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
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
              </CardContent>
            )}
          </Card>

          {/* Fila de Espera */}
          <Card className="w-full overflow-hidden shadow-xs border rounded-2xl">
            <CardHeader className="flex flex-col gap-2.5 pb-3 bg-muted/20 border-b px-4 py-3.5">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={toggleWaiting}
                  aria-expanded={isWaitingExpanded}
                  aria-label="Expandir ou recolher fila de espera"
                  className="flex items-center gap-2 text-left group cursor-pointer"
                >
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Fila de Espera ({teamWaitingQueue.length})</span>
                  </CardTitle>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 text-muted-foreground group-hover:text-foreground ${isWaitingExpanded ? "rotate-0" : "-rotate-90"
                      }`}
                  />
                </button>
              </div>

              {isWaitingExpanded && (
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Pesquisar por protocolo ou assunto..."
                    value={waitingSearch}
                    onChange={(e) => setWaitingSearch(e.target.value)}
                    className="h-8 pl-8 pr-8 text-xs bg-background rounded-lg"
                    aria-label="Pesquisar chamados na fila de espera"
                  />
                  {waitingSearch && (
                    <button
                      type="button"
                      onClick={() => setWaitingSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      aria-label="Limpar pesquisa de fila de espera"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </CardHeader>

            {isWaitingExpanded && (
              <CardContent className="p-0">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="bg-muted/10 text-xs">
                      <TableHead className="py-2.5 px-3">Protocolo / Ref</TableHead>
                      <TableHead className="py-2.5 px-3">Assunto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 2 }).map((_, index) => (
                        <TableRow key={`skeleton-espera-${index}`} aria-hidden="true">
                          <TableCell className="py-3 px-3"><Skeleton className="h-4 w-6 rounded-md" /></TableCell>
                          <TableCell className="py-3 px-3"><Skeleton className="h-3.5 w-16" /></TableCell>
                          <TableCell className="py-3 px-3"><Skeleton className="h-3.5 w-3/4" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredWaitingQueue.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-28 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-1.5 text-xs py-3">
                            <Inbox className="h-5 w-5 text-muted-foreground/40" />
                            <span>
                              {waitingSearch
                                ? `Nenhum chamado encontrado para "${waitingSearch}".`
                                : "Nenhum chamado na fila de espera desta equipe."}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredWaitingQueue.map((item) => (
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
                            <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[90px]" title={item.chatRef}>
                              Ref: {item.chatRef}
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 px-3 align-middle">
                            <div className="font-medium text-foreground text-xs line-clamp-2" title={item.subject}>
                              {item.subject}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
