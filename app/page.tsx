"use client";

import { useState } from "react";
import {
  Menu,
  LayoutDashboard,
  PlusCircle,
  CheckCircle,
  Check,
  Loader2,
  Clock,
  AlertTriangle,
  RefreshCw,
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

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [finishingId, setFinishingId] = useState<string | null>(null);

  const { filas, isLoading, isError, mutate, createAtendimento, finishAtendimento } =
    useQueues();
  const { toast } = useToast();

  const handleFinish = async (id: string, subject: string) => {
    try {
      setFinishingId(id);
      await finishAtendimento(id);
      toast({
        title: "Atendimento finalizado",
        description: `O chamado "${subject}" foi concluído com sucesso.`,
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

  const filaAtivaList = filas?.filaAtiva ?? [];
  const filaEsperaList = filas?.filaEspera ?? [];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Backdrop para mobile quando a sidebar estiver aberta */}
      {isSidebarOpen && (
        <div
          aria-hidden="true"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
        />
      )}

      {/* Sidebar Expansível */}
      <aside
        aria-label="Navegação principal"
        className={`${
          isSidebarOpen ? "w-64" : "w-16"
        } transition-all duration-300 border-r bg-card flex flex-col shrink-0 z-30`}
      >
        <div className="p-4 flex items-center justify-between border-b h-16">
          {isSidebarOpen && (
            <span className="font-bold text-lg whitespace-nowrap tracking-tight">
              Menu Ubots
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={!isSidebarOpen ? "mx-auto" : ""}
            aria-label={isSidebarOpen ? "Recolher menu lateral" : "Expandir menu lateral"}
            title={isSidebarOpen ? "Recolher menu" : "Expandir menu"}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 p-2 space-y-2 overflow-hidden">
          <Button
            variant="secondary"
            className={`w-full justify-start ${!isSidebarOpen ? "px-2" : ""}`}
            title="Dashboard"
          >
            <LayoutDashboard className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="ml-3">Dashboard</span>}
          </Button>

          <Button
            variant="ghost"
            onClick={() => setIsDrawerOpen(true)}
            className={`w-full justify-start ${!isSidebarOpen ? "px-2" : ""}`}
            title="Abrir Chamado"
          >
            <PlusCircle className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="ml-3">Abrir Chamado</span>}
          </Button>

          <Button
            variant="ghost"
            className={`w-full justify-start ${!isSidebarOpen ? "px-2" : ""}`}
            title="Histórico / Fechados"
          >
            <CheckCircle className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="ml-3">Histórico / Fechados</span>}
          </Button>
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col w-full max-w-full overflow-hidden">
        {/* Cabeçalho */}
        <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              FlowPay MVP
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerenciamento de Filas em Tempo Real
            </p>
          </div>

          <div className="flex items-center gap-2">
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
              className="gap-1.5"
              aria-label="Criar novo atendimento"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Novo Chamado</span>
            </Button>
          </div>
        </header>

        {/* Alerta de erro de carregamento inicial */}
        {isError && (
          <div
            role="alert"
            className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-3"
          >
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Erro ao sincronizar filas:</span> Não foi
              possível conectar ao serviço. Tentando reconectar automaticamente...
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => mutate()}
              className="shrink-0"
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Container Principal de Tabelas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Lado Esquerdo: Fila Ativa */}
          <Card className="w-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <span>Fila Ativa (Processando)</span>
                  {!isLoading && (
                    <Badge variant="info" className="ml-1 text-xs">
                      {filaAtivaList.length}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Atendimentos atualmente em andamento com agentes
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto w-full">
                <Table className="w-full min-w-[340px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Protocolo</TableHead>
                      <TableHead>Assunto</TableHead>
                      <TableHead className="w-20">Tempo</TableHead>
                      <TableHead className="w-28 text-right pr-4">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      // Skeleton Loading para a Fila Ativa
                      Array.from({ length: 3 }).map((_, index) => (
                        <TableRow key={`skeleton-ativa-${index}`} aria-hidden="true">
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1.5">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            <Skeleton className="h-7 w-20 ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filaAtivaList.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-28 text-center text-muted-foreground"
                        >
                          Nenhum atendimento em andamento no momento.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filaAtivaList.map((atendimento) => {
                        const isFinishing = finishingId === atendimento.id;
                        return (
                          <TableRow key={atendimento.id} className="hover:bg-muted/40">
                            <TableCell className="font-mono text-xs font-medium text-muted-foreground">
                              {atendimento.ticketNumber || atendimento.chatRef}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-foreground">
                                {atendimento.subject}
                              </div>
                              <div className="text-[11px] text-muted-foreground font-mono">
                                Ref: {atendimento.chatRef}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTime(atendimento.createdAt)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right pr-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleFinish(atendimento.id, atendimento.subject)
                                }
                                disabled={isFinishing}
                                aria-label={`Finalizar atendimento ${
                                  atendimento.ticketNumber || atendimento.subject
                                }`}
                                className="h-7 px-2 text-xs border-emerald-600/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:border-emerald-500/40 dark:text-emerald-400"
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
          <Card className="w-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <span>Fila de Espera (Aguardando)</span>
                  {!isLoading && (
                    <Badge variant="warning" className="ml-1 text-xs">
                      {filaEsperaList.length}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Chamados pendentes aguardando operador disponível
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto w-full">
                <Table className="w-full min-w-[340px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Protocolo</TableHead>
                      <TableHead>Assunto</TableHead>
                      <TableHead className="w-20">Tempo</TableHead>
                      <TableHead className="w-24 text-right pr-4">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      // Skeleton Loading para a Fila de Espera
                      Array.from({ length: 3 }).map((_, index) => (
                        <TableRow key={`skeleton-espera-${index}`} aria-hidden="true">
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1.5">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            <Skeleton className="h-5 w-16 ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filaEsperaList.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-28 text-center text-muted-foreground"
                        >
                          Nenhum chamado na fila de espera.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filaEsperaList.map((atendimento) => (
                        <TableRow key={atendimento.id} className="hover:bg-muted/40">
                          <TableCell className="font-mono text-xs font-medium text-muted-foreground">
                            {atendimento.ticketNumber || atendimento.chatRef}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-foreground">
                              {atendimento.subject}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono">
                              Ref: {atendimento.chatRef}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(atendimento.createdAt)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            <Badge variant="secondary" className="text-[11px]">
                              Aguardando
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Slide-over (Gaveta) para Novo Chamado */}
      <NewTicketDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSubmitTicket={createAtendimento}
      />
    </div>
  );
}