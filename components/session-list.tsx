"use client"

import { useState } from "react"
import type { Session, SessionFormData } from "@/lib/types"
import {
  Clock,
  ChevronRight,
  Trash2,
  Pencil,
  BarChart3,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SessionForm } from "@/components/session-form"
import { toast } from "sonner"

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
  const m = minutes % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T12:00:00")
  return date.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

interface SessionListProps {
  sessions: Session[]
  onDelete: (id: string) => void
  onEdit: (id: string, data: SessionFormData) => void
}

export function SessionList({ sessions, onDelete, onEdit }: SessionListProps) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
          <BarChart3 className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground leading-relaxed">
          No hay sesiones registradas.
          <br />
          Toca &quot;Nueva Sesion&quot; para empezar.
        </p>
      </div>
    )
  }

  // Group sessions by month
  const grouped = sessions.reduce<Record<string, Session[]>>((acc, session) => {
    const date = new Date(session.date + "T12:00:00")
    const key = date.toLocaleDateString("es-MX", {
      month: "long",
      year: "numeric",
    })
    if (!acc[key]) acc[key] = []
    acc[key].push(session)
    return acc
  }, {})

  return (
    <>
      <div className="flex flex-col gap-5 px-4 pb-24">
        {Object.entries(grouped).map(([month, monthSessions]) => {
          const monthProfit = monthSessions.reduce(
            (sum, s) => sum + (s.cashOut - s.buyIn),
            0
          )
          return (
            <div key={month} className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground capitalize">
                  {month}
                </h3>
                <span
                  className={`text-xs font-mono font-semibold ${
                    monthProfit >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {monthProfit >= 0 ? "+" : ""}
                  {formatCurrency(monthProfit)}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {monthSessions.map((session) => {
                  const profit = session.cashOut - session.buyIn
                  const isProfit = profit >= 0

                  return (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => setSelectedSession(session)}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:bg-secondary text-left w-full"
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold font-mono ${
                          isProfit
                            ? "bg-success/15 text-success"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {isProfit ? "W" : "L"}
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {session.casinoName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDate(session.date)}</span>
                          <span className="text-border">|</span>
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(session.timePlayedMinutes)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-sm font-bold font-mono ${
                            isProfit ? "text-success" : "text-destructive"
                          }`}
                        >
                          {isProfit ? "+" : ""}
                          {formatCurrency(profit)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Session Detail Dialog */}
      <Dialog
        open={!!selectedSession && !editingSession}
        onOpenChange={(open) => {
          if (!open) setSelectedSession(null)
        }}
      >
        <DialogContent className="sm:max-w-md bg-card border-border">
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  {selectedSession.casinoName}
                </DialogTitle>
                <DialogDescription>
                  {formatDate(selectedSession.date)}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                {/* Profit display */}
                <div
                  className={`rounded-xl p-4 text-center ${
                    selectedSession.cashOut - selectedSession.buyIn >= 0
                      ? "bg-success/10 border border-success/20"
                      : "bg-destructive/10 border border-destructive/20"
                  }`}
                >
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Resultado
                  </p>
                  <p
                    className={`mt-1 text-2xl font-bold font-mono ${
                      selectedSession.cashOut - selectedSession.buyIn >= 0
                        ? "text-success"
                        : "text-destructive"
                    }`}
                  >
                    {selectedSession.cashOut - selectedSession.buyIn >= 0
                      ? "+"
                      : ""}
                    {formatCurrency(
                      selectedSession.cashOut - selectedSession.buyIn
                    )}
                  </p>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3">
                  <DetailItem
                    label="Entrada"
                    value={formatCurrency(selectedSession.buyIn)}
                  />
                  <DetailItem
                    label="Salida"
                    value={formatCurrency(selectedSession.cashOut)}
                  />
                  <DetailItem
                    label="Tiempo"
                    value={formatTime(selectedSession.timePlayedMinutes)}
                  />
                  <DetailItem
                    label="ROI"
                    value={`${(
                      ((selectedSession.cashOut - selectedSession.buyIn) /
                        selectedSession.buyIn) *
                      100
                    ).toFixed(1)}%`}
                  />
                </div>

                {selectedSession.notes && (
                  <div className="rounded-xl bg-secondary p-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Notas
                    </p>
                    <p className="mt-1 text-sm text-foreground leading-relaxed">
                      {selectedSession.notes}
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingSession(selectedSession)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(selectedSession.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingSession}
        onOpenChange={(open) => {
          if (!open) setEditingSession(null)
        }}
      >
        <DialogContent className="sm:max-w-md bg-card border-border" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Sesion</DialogTitle>
            <DialogDescription>Modifica los datos de tu sesion</DialogDescription>
          </DialogHeader>
          {editingSession && (
            <SessionForm
              editSession={editingSession}
              onSubmit={(data) => {
                onEdit(editingSession.id, data)
                setEditingSession(null)
                setSelectedSession(null)
              }}
              onClose={() => setEditingSession(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null)
        }}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Eliminar Sesion</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara permanentemente esta
              sesion de tu historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-muted-foreground">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingId) {
                  onDelete(deletingId)
                  toast("Sesion eliminada")
                  setDeletingId(null)
                  setSelectedSession(null)
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-secondary p-3">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-bold font-mono text-foreground">{value}</p>
    </div>
  )
}
