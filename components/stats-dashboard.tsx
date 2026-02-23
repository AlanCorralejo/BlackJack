"use client"

import type { Stats } from "@/lib/types"
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  DollarSign,
  Trophy,
  BarChart3,
  Zap,
} from "lucide-react"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function StatsDashboard({ stats }: { stats: Stats }) {
  const isProfit = stats.netProfit >= 0

  if (stats.totalSessions === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
          <BarChart3 className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground leading-relaxed">
          Agrega tu primera sesion para ver tus estadisticas
        </p>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      {/* Main profit card */}
      <div
        className={`relative overflow-hidden rounded-2xl p-5 ${
          isProfit
            ? "bg-success/10 border border-success/20"
            : "bg-destructive/10 border border-destructive/20"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Balance Total
            </p>
            <p
              className={`mt-1 text-3xl font-bold font-mono tracking-tight ${
                isProfit ? "text-success" : "text-destructive"
              }`}
            >
              {isProfit ? "+" : ""}
              {formatCurrency(stats.netProfit)}
            </p>
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              isProfit ? "bg-success/20" : "bg-destructive/20"
            }`}
          >
            {isProfit ? (
              <TrendingUp className="h-6 w-6 text-success" />
            ) : (
              <TrendingDown className="h-6 w-6 text-destructive" />
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span>Invertido: {formatCurrency(stats.totalBuyIn)}</span>
          <span className="text-border">|</span>
          <span>Retirado: {formatCurrency(stats.totalCashOut)}</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Target className="h-4 w-4" />}
          label="Sesiones"
          value={stats.totalSessions.toString()}
          accent={false}
        />
        <StatCard
          icon={<Zap className="h-4 w-4" />}
          label="Win Rate"
          value={`${stats.winRate.toFixed(0)}%`}
          accent={stats.winRate >= 50}
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Tiempo Prom."
          value={formatTime(stats.avgSessionTime)}
          accent={false}
        />
        <StatCard
          icon={<DollarSign className="h-4 w-4" />}
          label="Ganancia Prom."
          value={`${stats.avgProfit >= 0 ? "+" : ""}${formatCurrency(stats.avgProfit)}`}
          accent={stats.avgProfit >= 0}
        />
        <StatCard
          icon={<Trophy className="h-4 w-4" />}
          label="Mejor Sesion"
          value={`+${formatCurrency(stats.bestSession)}`}
          accent
        />
        <StatCard
          icon={<TrendingDown className="h-4 w-4" />}
          label="Peor Sesion"
          value={stats.worstSession  > 0 ? `+${formatCurrency(stats.worstSession)}` : formatCurrency(stats.worstSession)}
          accent={false}
          negative
        />
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  accent,
  negative,
}: {
  icon: React.ReactNode
  label: string
  value: string
  accent: boolean
  negative?: boolean
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3.5">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p
        className={`text-lg font-bold font-mono tracking-tight ${
          negative
            ? "text-destructive"
            : accent
              ? "text-primary"
              : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  )
}
