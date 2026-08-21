"use client";

import React from "react";
import Link from "next/link";
import { Team, TeamMetricDto, TEAM_LABELS, TEAM_VARIANTS } from "@/app/types/atendimento";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/app/hooks/useAnalytics";
import { CreditCard, Landmark, HelpCircle, ArrowUpRight, CheckCircle2, XCircle, Clock, Timer } from "lucide-react";

interface TeamMetricCardProps {
  team: Team;
  metric?: TeamMetricDto;
  isLoading?: boolean;
}

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

export function TeamMetricCard({ team, metric, isLoading }: TeamMetricCardProps) {
  const label = TEAM_LABELS[team];
  const Icon = TEAM_ICONS[team];
  const theme = TEAM_THEMES[team];

  const total = metric?.totalTickets || 0;
  const resolved = metric?.resolvedTickets || 0;
  const rejected = metric?.rejectedTickets || 0;
  const successRate = total > 0 ? Math.round((resolved / total) * 100) : 100;

  const avgWaiting =
    metric?.avgWaitingTimeSeconds ??
    ((metric as unknown as Record<string, unknown>)?.waitingTimeSeconds as number) ??
    0;
  const avgService =
    metric?.avgServiceTimeSeconds ??
    ((metric as unknown as Record<string, unknown>)?.serviceTimeSeconds as number) ??
    0;

  return (
    <Link
      href={`/analytics/${team}`}
      className="block group focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-2xl transition-all"
    >
      <Card className="p-5 sm:p-6 bg-card/95 border shadow-xs group-hover:border-primary/50 group-hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer h-full rounded-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${theme.iconBg} ${theme.iconColor} group-hover:scale-105 transition-transform`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span className="font-semibold text-sm sm:text-base text-foreground truncate group-hover:text-primary transition-colors">
              {label}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Badge
              variant={TEAM_VARIANTS[team] || "secondary"}
              className="text-[10px] sm:text-xs px-2 py-0.5 font-medium"
            >
              {total} chamados
            </Badge>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>

        {/* Estatísticas de Eficiência */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40">
          <div>
            <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Resolvidos
            </div>
            <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              {isLoading ? "..." : resolved}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                ({successRate}%)
              </span>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1">
              <XCircle className="h-3 w-3 text-rose-500" /> Recusados
            </div>
            <div className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">
              {isLoading ? "..." : rejected}
            </div>
          </div>
        </div>

        {/* SLA Médios */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40 bg-muted/20 p-2.5 rounded-xl text-xs">
          <div>
            <span className="text-[10px] text-muted-foreground font-medium uppercase flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-500" /> Fila Média
            </span>
            <span className="font-mono font-bold text-foreground mt-0.5 block">
              {isLoading ? "..." : formatDuration(avgWaiting)}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground font-medium uppercase flex items-center gap-1">
              <Timer className="h-3 w-3 text-blue-500" /> Atendimento
            </span>
            <span className="font-mono font-bold text-foreground mt-0.5 block">
              {isLoading ? "..." : formatDuration(avgService)}
            </span>
          </div>
        </div>

        {/* Barra de taxa de sucesso */}
        <div className="space-y-1 pt-1">
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                successRate >= 90
                  ? "bg-emerald-500"
                  : successRate >= 70
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${Math.min(successRate, 100)}%` }}
            />
          </div>
        </div>
      </Card>
    </Link>
  );
}
