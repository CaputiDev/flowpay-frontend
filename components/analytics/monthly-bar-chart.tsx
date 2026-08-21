"use client";

import React, { useState } from "react";
import { MonthlyMetricDto } from "@/app/types/atendimento";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatMonthLabel } from "@/app/hooks/useAnalytics";
import { BarChart3 } from "lucide-react";

interface MonthlyBarChartProps {
  data: MonthlyMetricDto[];
  isLoading?: boolean;
}

export function MonthlyBarChart({ data, isLoading }: MonthlyBarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (isLoading) {
    return (
      <Card className="rounded-2xl p-6 bg-card/95 border shadow-xs h-[380px] flex items-center justify-center">
        <div className="text-xs text-muted-foreground animate-pulse">
          Carregando gráfico mensal...
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="rounded-2xl p-6 bg-card/95 border shadow-xs h-[380px] flex flex-col items-center justify-center text-center">
        <BarChart3 className="h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-sm font-semibold text-foreground">Sem dados mensais</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Conforme os atendimentos forem finalizados, o histórico mensal será montado aqui.
        </p>
      </Card>
    );
  }

  // Ordena cronologicamente os meses
  const sortedData = [...data].sort((a, b) => a.month.localeCompare(b.month));
  const maxVolume = Math.max(...sortedData.map((d) => d.totalTickets), 10);
  const chartHeight = 200;

  return (
    <Card className="rounded-2xl bg-card/95 border shadow-xs flex flex-col justify-between overflow-hidden">
      <CardHeader className="p-5 sm:p-6 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#015193]" />
              <span>Volume Histórico de Chamados</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Comparativo mês a mês de solicitações totais, resolvidas e recusadas
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

      <CardContent className="p-5 sm:p-6 pt-4">
        {/* Container do Gráfico SVG */}
        <div className="relative w-full pt-4">
          <div className="flex items-end justify-around gap-2 sm:gap-6 h-[220px] pb-8 border-b border-border/40">
            {sortedData.map((item, index) => {
              const totalHeight = Math.max((item.totalTickets / maxVolume) * chartHeight, 6);
              const resolvedHeight = Math.max((item.resolvedTickets / maxVolume) * chartHeight, 4);
              const rejectedHeight = item.rejectedTickets > 0
                ? Math.max((item.rejectedTickets / maxVolume) * chartHeight, 4)
                : 0;

              const isHovered = hoveredIdx === index;

              return (
                <div
                  key={item.month}
                  className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(index)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Tooltip flutuante */}
                  {isHovered && (
                    <div className="absolute -top-16 z-20 bg-popover text-popover-foreground border border-border shadow-lg rounded-xl px-3 py-2 text-xs min-w-[140px] pointer-events-none transition-all">
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

                  {/* Barras agrupadas */}
                  <div className="flex items-end gap-1 sm:gap-1.5 w-full max-w-[60px] justify-center">
                    {/* Barra Total */}
                    <div
                      className={`w-3 sm:w-4 rounded-t-md bg-[#015193] transition-all duration-300 ${
                        isHovered ? "opacity-100 scale-y-105" : "opacity-85 hover:opacity-100"
                      }`}
                      style={{ height: `${totalHeight}px` }}
                      title={`Total: ${item.totalTickets}`}
                    />

                    {/* Barra Resolvidos */}
                    <div
                      className={`w-3 sm:w-4 rounded-t-md bg-emerald-500 transition-all duration-300 ${
                        isHovered ? "opacity-100 scale-y-105" : "opacity-85 hover:opacity-100"
                      }`}
                      style={{ height: `${resolvedHeight}px` }}
                      title={`Resolvidos: ${item.resolvedTickets}`}
                    />

                    {/* Barra Recusados */}
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

                  {/* Rótulo do Mês no eixo X */}
                  <span className="absolute -bottom-6 text-[10px] sm:text-xs text-muted-foreground font-mono text-center truncate max-w-full">
                    {item.month.split("-")[1]}/{item.month.split("-")[0].slice(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
