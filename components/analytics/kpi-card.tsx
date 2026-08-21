"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number | React.ReactNode;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "emerald" | "amber" | "blue" | "purple" | "rose";
  isLoading?: boolean;
}

const VARIANT_STYLES = {
  default: {
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    border: "border-border/60",
    glow: "",
  },
  emerald: {
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    glow: "hover:border-emerald-500/40",
  },
  amber: {
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    glow: "hover:border-amber-500/40",
  },
  blue: {
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    glow: "hover:border-blue-500/40",
  },
  purple: {
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/20",
    glow: "hover:border-purple-500/40",
  },
  rose: {
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
    glow: "hover:border-rose-500/40",
  },
};

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  isLoading = false,
}: KpiCardProps) {
  const style = VARIANT_STYLES[variant];

  return (
    <Card
      className={`p-5 sm:p-6 bg-card/95 border ${style.border} ${style.glow} shadow-xs hover:shadow-md transition-all rounded-2xl flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
            {title}
          </span>
          <div
            className={`h-9 w-9 rounded-xl ${style.iconBg} ${style.iconColor} flex items-center justify-center border border-border/40`}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          {isLoading ? (
            <Skeleton className="h-9 w-20" />
          ) : (
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {value}
            </div>
          )}
        </div>
      </div>

      {subtitle && (
        <div className="mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground flex items-center gap-2">
          {isLoading ? <Skeleton className="h-3.5 w-32" /> : <span>{subtitle}</span>}
        </div>
      )}
    </Card>
  );
}
