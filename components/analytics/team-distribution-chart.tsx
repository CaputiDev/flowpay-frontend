"use client";

import React from "react";
import Link from "next/link";
import { Team, TEAM_LABELS } from "@/app/types/atendimento";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PieChart, CreditCard, Landmark, HelpCircle, ArrowUpRight } from "lucide-react";

interface TeamShare {
  team: Team;
  totalTickets: number;
}

interface TeamDistributionChartProps {
  data: Record<string, { totalTickets: number }>;
  isLoading?: boolean;
}

const TEAM_CONFIG: Record<
  Team,
  {
    label: string;
    color: string;
    icon: typeof CreditCard;
  }
> = {
  CREDIT_CARDS: {
    label: TEAM_LABELS.CREDIT_CARDS,
    color: "#3b82f6", // blue-500
    icon: CreditCard,
  },
  LOANS: {
    label: TEAM_LABELS.LOANS,
    color: "#f59e0b", // amber-500
    icon: Landmark,
  },
  OTHERS: {
    label: TEAM_LABELS.OTHERS,
    color: "#a855f7", // purple-500
    icon: HelpCircle,
  },
};

export function TeamDistributionChart({ data, isLoading }: TeamDistributionChartProps) {
  if (isLoading) {
    return (
      <Card className="rounded-2xl p-6 bg-card/95 border shadow-xs h-[380px] flex items-center justify-center">
        <div className="text-xs text-muted-foreground animate-pulse">
          Carregando distribuição por time...
        </div>
      </Card>
    );
  }

  const teams: Team[] = ["CREDIT_CARDS", "LOANS", "OTHERS"];
  const teamShares: TeamShare[] = teams.map((team) => ({
    team,
    totalTickets: data?.[team]?.totalTickets || 0,
  }));

  const totalSum = teamShares.reduce((acc, curr) => acc + curr.totalTickets, 0);

  // SVG Donut calculation
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <Card className="rounded-2xl bg-card/95 border shadow-xs flex flex-col justify-between overflow-hidden">
      <CardHeader className="p-5 sm:p-6 pb-2">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <PieChart className="h-4 w-4 text-[#015193]" />
          <span>Distribuição por Equipe</span>
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-0.5">
          Proporção do volume de chamados recebidos por área de atendimento
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 pt-2">
        {totalSum === 0 ? (
          <div className="h-[220px] flex flex-col items-center justify-center text-center">
            <p className="text-xs text-muted-foreground">
              Ainda não há chamados registrados para o período selecionado.
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
            {/* SVG Donut Chart */}
            <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
                {/* Background Ring */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-muted/30"
                  strokeWidth="16"
                  fill="transparent"
                />

                {/* Slices */}
                {teamShares.map((item) => {
                  if (item.totalTickets === 0) return null;
                  const percent = item.totalTickets / totalSum;
                  const strokeDasharray = `${percent * circumference} ${circumference}`;
                  const strokeDashoffset = -accumulatedPercent * circumference;
                  accumulatedPercent += percent;

                  const config = TEAM_CONFIG[item.team];

                  return (
                    <circle
                      key={item.team}
                      cx="70"
                      cy="70"
                      r={radius}
                      stroke={config.color}
                      strokeWidth="16"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      fill="transparent"
                      className="transition-all duration-500 hover:stroke-[18]"
                    />
                  );
                })}
              </svg>

              {/* Centro com Total */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold font-mono text-foreground leading-none">
                  {totalSum}
                </span>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mt-1">
                  Chamados
                </span>
              </div>
            </div>

            {/* Legenda com Números, Percentuais e Links */}
            <div className="flex-1 w-full space-y-3">
              {teamShares.map((item) => {
                const config = TEAM_CONFIG[item.team];
                const Icon = config.icon;
                const percent = totalSum > 0 ? Math.round((item.totalTickets / totalSum) * 100) : 0;

                return (
                  <Link
                    key={item.team}
                    href={`/analytics/${item.team}`}
                    className="p-2.5 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-between gap-3 hover:bg-muted/40 hover:border-primary/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: config.color }}
                      />
                      <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {config.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                      <span className="text-muted-foreground">{item.totalTickets}</span>
                      <span className="font-bold text-foreground bg-background px-1.5 py-0.5 rounded-md border border-border/60 text-[11px]">
                        {percent}%
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
