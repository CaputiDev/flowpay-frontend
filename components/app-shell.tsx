"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Landmark,
  HelpCircle,
  PlusCircle,
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

const NAV_TEAMS: { team: Team; href: string; icon: typeof CreditCard; label: string }[] = [
  {
    team: "CREDIT_CARDS",
    href: "/CREDIT_CARDS",
    icon: CreditCard,
    label: TEAM_LABELS.CREDIT_CARDS,
  },
  {
    team: "LOANS",
    href: "/LOANS",
    icon: Landmark,
    label: TEAM_LABELS.LOANS,
  },
  {
    team: "OTHERS",
    href: "/OTHERS",
    icon: HelpCircle,
    label: TEAM_LABELS.OTHERS,
  },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const currentPath = pathname || "/";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { teamSummaries, createAtendimento } = useQueues();

  const getTeamStats = (teamKey: Team) => {
    return teamSummaries?.find((t) => t.team === teamKey);
  };

  const isDashboardActive = currentPath === "/dashboard" || currentPath === "/";

  const renderBreadcrumb = () => {
    const teamSlug = currentPath.replace("/", "").toUpperCase() as Team;

    if (teamSlug in TEAM_LABELS) {
      const teamLabel = TEAM_LABELS[teamSlug];

      return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Visão Geral
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          <span className="text-foreground font-semibold">
            {teamLabel}
          </span>
        </nav>
      );
    }

    return (
      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground">
        <span>Visão Geral</span>
      </div>
    );
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#015193] text-white">
      {/* Brand Header */}
      <div className="p-4 border-b border-white/15 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center p-1.5 border border-white/20 shrink-0 shadow-xs">
          <Image
            src="/ubots-icon.png"
            alt="Ubots FlowPay"
            width={24}
            height={24}
            className="object-contain"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-white">FlowPay</span>
            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 border-white/30 text-white bg-white/10">
              MVP
            </Badge>
          </div>
          <p className="text-[11px] text-blue-100/75 truncate">
            Roteamento & Filas
          </p>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 bg-[#015193] text-white">
        {/* Botão Novo Chamado no início da sidebar */}
        <Button
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsDrawerOpen(true);
          }}
          className="w-full gap-2 text-xs h-9.5 font-semibold bg-white text-[#015193] hover:bg-white/90 shadow-sm transition-all"
          aria-label="Criar novo atendimento"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Novo Chamado</span>
        </Button>

        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-blue-100/70 uppercase">
            Dashboard
          </div>
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isDashboardActive
                  ? "bg-[#02223d] text-white shadow-xs font-semibold ring-1 ring-white/15"
                  : "text-blue-100/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span className="flex-1">Visão Geral</span>
            </Link>

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
                      ? "bg-[#02223d] text-white shadow-xs font-semibold ring-1 ring-white/15"
                      : "text-blue-100/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="h-4 w-4 shrink-0 text-white" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {stats && (
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                        isActive
                          ? "bg-white/20 text-white font-semibold"
                          : stats.waitingCount > 0
                          ? "bg-amber-400 text-slate-900 font-bold"
                          : "bg-white/10 text-blue-100"
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
    </div>
  );

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 border-r border-[#015193]/20 bg-[#015193] shadow-md">
        {navContent}
      </aside>

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col md:pl-64 w-full min-w-0">
        {/* Top Header */}
        <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-20 w-full">
          <div className="w-full px-3 sm:px-4 h-16 flex items-center gap-3">
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
                <SheetContent side="left" className="p-0 w-72 border-r border-[#015193]/20 bg-[#015193]">
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
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Modal Dialog para Novo Atendimento */}
      <NewTicketDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSubmitTicket={createAtendimento}
      />
    </div>
  );
}
