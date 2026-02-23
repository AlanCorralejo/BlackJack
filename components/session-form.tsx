"use client"

import { useState } from "react"
import type { Session, SessionFormData } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Plus, Save } from "lucide-react"
import { toast } from "sonner"

const POPULAR_CASINOS = [
  "Vegas",
  "Red",
  "Emotion",
  "Royale"
]

interface SessionFormProps {
  onSubmit: (data: SessionFormData) => void
  editSession?: Session | null
  onClose?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SessionForm({
  onSubmit,
  editSession,
  onClose,
  open,
  onOpenChange,
}: SessionFormProps) {
  const isEditing = !!editSession

  const [casinoName, setCasinoName] = useState(editSession?.casinoName || "")
  const [date, setDate] = useState(
    editSession?.date || new Date().toISOString().split("T")[0]
  )
  const [hours, setHours] = useState(
    editSession ? Math.floor(editSession.timePlayedMinutes / 60) : 0
  )
  const [minutes, setMinutes] = useState(
    editSession ? editSession.timePlayedMinutes % 60 : 0
  )
  const [buyIn, setBuyIn] = useState(editSession?.buyIn?.toString() || "")
  const [cashOut, setCashOut] = useState(editSession?.cashOut?.toString() || "")
  const [notes, setNotes] = useState(editSession?.notes || "")

  function resetForm() {
    setCasinoName("")
    setDate(new Date().toISOString().split("T")[0])
    setHours(0)
    setMinutes(0)
    setBuyIn("")
    setCashOut("")
    setNotes("")
  }

  function handleSubmit() {
    if (!casinoName.trim()) {
      toast.error("Ingresa el nombre del casino")
      return
    }
    if (!buyIn || Number(buyIn) <= 0) {
      toast.error("Ingresa el monto de entrada")
      return
    }
    if (!cashOut && cashOut !== "0") {
      toast.error("Ingresa el monto de salida")
      return
    }
    if (hours === 0 && minutes === 0) {
      toast.error("Ingresa el tiempo jugado")
      return
    }

    onSubmit({
      casinoName: casinoName.trim(),
      date,
      hours,
      minutes,
      buyIn: Number(buyIn.replace(/,/g, "")),
      cashOut: Number(cashOut.replace(/,/g, "")),
      notes: notes.trim() || undefined,
    })

    if (!isEditing) {
      resetForm()
    }

    const profit = Number(cashOut) - Number(buyIn)
    if (profit >= 0) {
      toast.success(
        `Sesion ${isEditing ? "actualizada" : "registrada"}: +$${profit.toLocaleString()}`
      )
    } else {
      toast(`Sesion ${isEditing ? "actualizada" : "registrada"}: -$${Math.abs(profit).toLocaleString()}`)
    }

    onOpenChange?.(false)
    onClose?.()
  }

  const formContent = (
    <div className="flex flex-col gap-5 px-4 pb-2 overflow-y-auto max-h-[60vh]">
      {/* Casino Name */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="casino" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Casino
        </Label>
        <Input
          id="casino"
          placeholder="Nombre del casino"
          value={casinoName}
          onChange={(e) => setCasinoName(e.target.value)}
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
        />
        {!isEditing && (
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_CASINOS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setCasinoName(name)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${casinoName === name
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Date */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="date" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Fecha
        </Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-secondary border-border text-foreground"
        />
      </div>

      {/* Time played */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Tiempo Jugado
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              min={0}
              max={24}
              placeholder="0"
              value={hours || ""}
              onChange={(e) => setHours(Number(e.target.value))}
              className="bg-secondary border-border text-foreground"
            />
            <span className="text-center text-xs text-muted-foreground">Horas</span>
          </div>
          <div className="flex flex-col gap-1">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              min={0}
              max={59}
              placeholder="0"
              value={minutes || ""}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="bg-secondary border-border text-foreground"
            />
            <span className="text-center text-xs text-muted-foreground">Minutos</span>
          </div>
        </div>
      </div>

      {/* Money */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="buyIn" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Entrada ($)
          </Label>
          <Input
            id="buyIn"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            min={0}
            placeholder="0"
            value={buyIn}
            onChange={(e) => {
              // quitar todo lo que no sea número
              const raw = e.target.value.replace(/[^\d]/g, "");

              // formatear con separadores
              const formatted = raw
                ? new Intl.NumberFormat("en-US").format(Number(raw))
                : "";

              setBuyIn(formatted);
            }} 
            className="bg-secondary border-border text-foreground font-mono"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="cashOut" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Salida ($)
          </Label>
          <Input
            id="cashOut"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            min={0}
            placeholder="0"
            value={cashOut}
            onChange={(e) => {
              // quitar todo lo que no sea número
              const raw = e.target.value.replace(/[^\d]/g, "");

              // formatear con separadores
              const formatted = raw
                ? new Intl.NumberFormat("en-US").format(Number(raw))
                : "";

              setCashOut(formatted);
            }} 
            className="bg-secondary border-border text-foreground font-mono"
          />
        </div>
      </div>

      {/* Profit preview */}
      {Number(buyIn.replace(/,/g, "")) && Number(cashOut.replace(/,/g, "")) && (
        <div
          className={`rounded-xl p-3 text-center font-mono text-lg font-bold ${Number(cashOut.replace(/,/g, "")) - Number(buyIn.replace(/,/g, "")) >= 0
            ? "bg-success/10 text-success border border-success/20"
            : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}
        >
          {Number(Number(cashOut.replace(/,/g, ""))) - Number(Number(buyIn.replace(/,/g, ""))) >= 0 ? "+" : ""}$
          {(Number(Number(cashOut.replace(/,/g, ""))) - Number(Number(buyIn.replace(/,/g, "")))).toLocaleString()}
        </div>
      )}

      {/* Notes */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="notes" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Notas (Opcional)
        </Label>
        <Textarea
          id="notes"
          placeholder="Estrategia, mesas, observaciones..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none"
        />
      </div>
    </div>
  )

  if (isEditing) {
    return (
      <div>
        {formContent}
        <div className="flex gap-3 px-4 pt-2 pb-4">
          <Button
            variant="outline"
            className="flex-1 border-border text-muted-foreground"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button className="flex-1 bg-primary text-primary-foreground" onClick={handleSubmit}>
            <Save className="mr-2 h-4 w-4" />
            Guardar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-4 left-4 z-50 h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 text-base font-semibold md:left-auto md:right-6 md:w-auto md:px-8"
        >
          <Plus className="mr-2 h-5 w-5" />
          Nueva Sesion
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-foreground">Nueva Sesion</DrawerTitle>
          <DrawerDescription>Registra tu visita al casino</DrawerDescription>
        </DrawerHeader>
        {formContent}
        <DrawerFooter className="flex-row gap-3">
          <DrawerClose asChild>
            <Button variant="outline" className="flex-1 border-border text-muted-foreground">
              Cancelar
            </Button>
          </DrawerClose>
          <Button className="flex-1 bg-primary text-primary-foreground" onClick={handleSubmit}>
            <Save className="mr-2 h-4 w-4" />
            Registrar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
