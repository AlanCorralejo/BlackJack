"use client"

import { useEffect, useState } from "react"
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
import { useForm, UseFormReturn } from "react-hook-form"
import { CreateSessionData } from "@/lib/models/session-model"
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form"
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore"
import { app, db } from "@/app/firebase"
import { getAuth } from "firebase/auth"

const POPULAR_CASINOS = [
  "Vegas",
  "Red",
  "Emotion",
  "Royale"
]

interface SessionFormProps {
  editSession?: Session | null
  onClose?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void,
}

export function SessionForm({
  editSession,
  onClose,
  open,
  onOpenChange,
}: SessionFormProps) {
  const isEditing = !!editSession
  const auth = getAuth(app);
  const form = useForm<CreateSessionData>({
    defaultValues: {
      buyIn: 0,
      cashOut: 0,
      casinoName: "",
      date: new Date().toISOString().split("T")[0],
      hours: 0,
      minutes: 0,
      notes: ""
    }
  });

  function resetForm() {
    form.setValue("casinoName", "")
    form.setValue("date", new Date().toISOString().split("T")[0])
    form.setValue("hours", 0)
    form.setValue("minutes", 0)
    form.setValue("buyIn", 0)
    form.setValue("cashOut", 0)
    form.setValue("notes", "")
  }

  const parseMoney = (value: string | number) =>
    Number(String(value).replace(/,/g, ""));

  const handleSaveSession = async (isEditing: boolean) => {
    if (!form.getValues("casinoName").trim()) {
      toast.error("Ingresa el nombre del casino")
      return
    }
    if (!form.getValues("buyIn") || form.getValues("buyIn") <= 0) {
      toast.error("Ingresa el monto de entrada")
      return
    }
    if (!form.getValues("cashOut") && form.getValues("cashOut") !== 0) {
      toast.error("Ingresa el monto de salida")
      return
    }
    if (form.getValues("hours") === 0 && form.getValues("minutes") === 0) {
      toast.error("Ingresa el tiempo jugado")
      return
    }

    const values = form.getValues()
    const formatedValues = {
      ...values,
      buyIn: parseMoney(values.buyIn),
      cashOut: parseMoney(values.cashOut)
    }
    if (isEditing && editSession) {
      try {
        const docRef = doc(db, 'blackjack_sesiones', editSession.id);
        await updateDoc(docRef, {
          ...formatedValues,
          updatedAt: serverTimestamp(),
        });
      } catch (e) {
        console.error("Error al editar documento: ", e);
      }
    } else {
      try {
        await addDoc(collection(db, "blackjack_sesiones"), {
          ...formatedValues,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          userId: auth.currentUser?.uid,
        });
      } catch (e) {
        console.error("Error al añadir documento: ", e);
      }
    }


    const profit = parseMoney(form.getValues("cashOut")) - parseMoney(form.getValues("buyIn"))
    if (profit >= 0) {
      toast.success(
        `Sesion ${isEditing ? "actualizada" : "registrada"}: +$${profit.toLocaleString()}`
      )
    } else {
      toast(`Sesion ${isEditing ? "actualizada" : "registrada"}: -$${Math.abs(profit).toLocaleString()}`)
    }

    onOpenChange?.(false)
    resetForm()
    onClose?.()
  }

  useEffect(() => {
    if (editSession) {
      form.reset(editSession)
    }
  }, [])

  form.watch("buyIn")
  form.watch("cashOut")

  const formContent = (
    <div className="flex flex-col gap-5 px-4 pb-2 overflow-y-auto max-h-[60vh]">
      {/* Casino Name */}

      <Form {...form}>
        <form className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="casinoName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Casino</FormLabel>
                  <FormControl>
                    <Input
                      id="casino"
                      placeholder="Nombre del casino"
                      value={form.getValues("casinoName")}
                      onChange={field.onChange}
                      className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {!isEditing && (
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_CASINOS.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => form.setValue("casinoName", name)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${form.getValues("casinoName") === name
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
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Fecha</FormLabel>
                  <FormControl>
                    <Input
                      id="date"
                      type="date"
                      value={field.value}
                      onChange={field.onChange}
                      className="bg-secondary border-border text-foreground"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Time played */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tiempo jugado</Label>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center text-xs text-muted-foreground">Horas</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min={0}
                        max={24}
                        placeholder="0"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        className="bg-secondary border-border text-foreground"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center text-xs text-muted-foreground">Minutos</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min={0}
                        max={60}
                        placeholder="0"
                        value={field.value || ""}
                        onChange={field.onChange}
                        className="bg-secondary border-border text-foreground"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Money */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="buyIn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Entrada ($)</FormLabel>
                    <FormControl>
                      <Input
                        id="buyIn"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min={0}
                        placeholder="0"
                        value={field.value}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^\d]/g, "");
                          const formatted = raw
                            ? new Intl.NumberFormat("en-US").format(Number(raw))
                            : "";

                          field.onChange(formatted);
                        }}
                        className="bg-secondary border-border text-foreground font-mono"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

            </div>
            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="cashOut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Salida ($)</FormLabel>
                    <FormControl>
                      <Input
                        id="cashOut"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min={0}
                        placeholder="0"
                        value={field.value}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^\d]/g, "");
                          const formatted = raw
                            ? new Intl.NumberFormat("en-US").format(Number(raw))
                            : "";

                          field.onChange(formatted);
                        }}
                        className="bg-secondary border-border text-foreground font-mono"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Profit preview */}
          {Number(form.getValues("buyIn").toString().replace(/,/g, "")) !== 0 && (
            <div
              className={`rounded-xl p-3 text-center font-mono text-lg font-bold ${Number(form.getValues("cashOut").toString().replace(/,/g, "")) - Number(form.getValues("buyIn").toString().replace(/,/g, "")) >= 0
                ? "bg-success/10 text-success border border-success/20"
                : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}
            >
              {Number(Number(form.getValues("cashOut").toString().replace(/,/g, ""))) - Number(Number(form.getValues("buyIn").toString().replace(/,/g, "").replace(/,/g, ""))) >= 0 ? "+" : ""}$
              {(Number(Number(form.getValues("cashOut").toString().replace(/,/g, ""))) - Number(Number(form.getValues("buyIn").toString().replace(/,/g, "").replace(/,/g, "")))).toLocaleString()}
            </div>
          )}


          {/* Notes */}
          <div className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      id="notes"
                      placeholder="Estrategia, mesas, observaciones..."
                      value={field.value}
                      onChange={field.onChange}
                      rows={2}
                      className="bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

          </div>
        </form>
      </Form>
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
          <Button type="button" className="flex-1 bg-primary text-primary-foreground" onClick={() => handleSaveSession(isEditing)}>
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
          <Button className="flex-1 bg-primary text-primary-foreground" onClick={() => handleSaveSession(isEditing)}>
            <Save className="mr-2 h-4 w-4" />
            Registrar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
