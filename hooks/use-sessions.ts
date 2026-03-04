"use client"

import { useCallback, useSyncExternalStore } from "react"
import type { Session, SessionFormData, Stats } from "@/lib/types"

const STORAGE_KEY = "blackjack-sessions"

let listeners: Array<() => void> = []

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener]
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

function getSnapshot(): string {
  if (typeof window === "undefined") return "[]"
  return localStorage.getItem(STORAGE_KEY) || "[]"
}

function getServerSnapshot(): string {
  return "[]"
}

function getSessions(): Session[] {
  try {
    return JSON.parse(getSnapshot())
  } catch {
    return []
  }
}

function saveSessions(sessions: Session[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  emitChange()
}

export function useSessions() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const sessions: Session[] = (() => {
    try {
      return JSON.parse(raw)
    } catch {
      return []
    }
  })()


  const deleteSession = useCallback((id: string) => {
    const current = getSessions()
    saveSessions(current.filter((s) => s.id !== id))
  }, [])

  const editSession = useCallback((id: string, formData: SessionFormData) => {
    const current = getSessions()
    saveSessions(
      current.map((s) =>
        s.id === id
          ? {
              ...s,
              casinoName: formData.casinoName,
              date: formData.date,
              timePlayedMinutes: formData.hours * 60 + formData.minutes,
              buyIn: formData.buyIn,
              cashOut: formData.cashOut,
              notes: formData.notes,
            }
          : s
      )
    )
  }, [])

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return { sessions: sortedSessions, deleteSession, editSession }
}
