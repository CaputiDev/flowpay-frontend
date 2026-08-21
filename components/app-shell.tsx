"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  LayoutDashboard,
  CreditCard,
  Landmark,
  HelpCircle,
  PlusCircle,
  RefreshCw,
  Menu,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useQueues } from "@/app/hooks/useQueues";
import { NewTicketDrawer } from "@/components/new-ticket-drawer";
import { Team, TEAM_LABELS } from "@/app/types/atendimento";

interface AppShellProps {
  children: React.ReactNode;
}

const NAV_TEAMS: { team: Team; href: string; icon: typeof CreditCard; label: string; color: string }[] = [
  {
    team: "CREDIT_CARDS",
    href: "/analytics/CREDIT_CARDS",
    icon: CreditCard,
    label: TEAM_LABELS.CREDIT_CARDS,
    color: "text-blue-500 dark:text-blue-400",
  },
  {
    team: "LOANS",
    href: "/analytics/LOANS",
    icon: Landmark,
    label: TEAM_LABELS.LOANS,
    color: "text-amber-500 dark:text-amber-400",
  },
  {
    team: "OTHERS",
    href: "/analytics/OTHERS",
    icon: HelpCircle,
    label: TEAM_LABELS.OTHERS,
    color: "text-purple-500 dark:text-purple-400",
  },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const currentPath = pathname || "/";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { teamSummaries, isLoading, mutate, createAtendimento } = useQueues();

  const getTeamStats = (teamKey: Team) => {
    return teamSummaries?.find((t) => t.team === teamKey);
  };

  const renderBreadcrumb = () => {
    if (currentPath.startsWith("/analytics/")) {
      const teamSlug = currentPath.replace("/analytics/", "").toUpperCase() as Team;
      const teamLabel = TEAM_LABELS[teamSlug] || teamSlug;

      return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          <span className="text-foreground font-semibold">
            Analytics: {teamLabel}
          </span>
        </nav>
      );
    }

    return (
      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground">
        <span>Dashboard</span>
      </div>
    );
  };

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 shadow-xs">
          <Layers className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-foreground">FlowPay</span>
            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
              MVP
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            Roteamento & Filas
          </p>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Menu Principal
          </div>
          <nav className="space-y-1">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentPath === "/"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span className="flex-1">Dashboard Geral</span>
            </Link>
          </nav>
        </div>

        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase flex items-center justify-between">
            <span>Analytics por Equipe</span>
          </div>
          <nav className="space-y-1">
            {NAV_TEAMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;
              const stats = getTeamStats(item.team);

              return (
                <Link
                  key={item.team}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary-foreground" : item.color}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {stats && (
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : stats.waitingCount > 0
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {stats.currentLoad}/{stats.totalCapacity}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Quick Action Footer */}
      <div className="p-3 border-t bg-muted/20 space-y-2">
        <Button
          onClick={() => setIsDrawerOpen(true)}
          className="w-full gap-2 text-xs h-9 shadow-xs"
          aria-label="Criar novo atendimento"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Novo Chamado</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 border-r bg-card/80 backdrop-blur">
        {navContent}
      </aside>

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col md:pl-64 w-full min-w-0">
        {/* Top Header */}
        <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-20 w-full">
          <div className="w-full px-3 sm:px-4 h-16 flex items-center justify-between gap-3">
            {/* Mobile Hamburger & Dynamic Breadcrumb Location */}
            <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="md:hidden h-9 w-9 p-0 shrink-0"
                    aria-label="Abrir menu de navegação"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Menu de Navegação</SheetTitle>
                  </SheetHeader>
                  {navContent}
                </SheetContent>
              </Sheet>

              <div className="min-w-0 truncate">
                {renderBreadcrumb()}
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => mutate()}
                disabled={isLoading}
                title="Atualizar dados da fila"
                aria-label="Atualizar dados da fila"
                className="gap-1.5 h-9 px-3 text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>

              <Button
                onClick={() => setIsDrawerOpen(true)}
                size="sm"
                className="gap-1.5 h-9 px-3.5 text-xs shadow-sm font-medium"
                aria-label="Criar novo atendimento"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Novo Chamado</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Drawer para Novo Atendimento */}
      <NewTicketDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSubmitTicket={createAtendimento}
      />
    </div>
  );
}
