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

  const addSession = useCallback((formData: SessionFormData) => {
    const current = getSessions()
    const newSession: Session = {
      id: crypto.randomUUID(),
      casinoName: formData.casinoName,
      date: formData.date,
      timePlayedMinutes: formData.hours * 60 + formData.minutes,
      buyIn: formData.buyIn,
      cashOut: formData.cashOut,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    }
    saveSessions([newSession, ...current])
    return newSession
  }, [])

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

  const stats: Stats = (() => {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalBuyIn: 0,
        totalCashOut: 0,
        netProfit: 0,
        winRate: 0,
        avgSessionTime: 0,
        bestSession: 0,
        worstSession: 0,
        avgProfit: 0,
      }
    }

    const profits = sessions.map((s) => s.cashOut - s.buyIn)
    const totalBuyIn = sessions.reduce((sum, s) => sum + s.buyIn, 0)
    const totalCashOut = sessions.reduce((sum, s) => sum + s.cashOut, 0)
    const wins = sessions.filter((s) => s.cashOut > s.buyIn).length
    const totalTime = sessions.reduce((sum, s) => sum + s.timePlayedMinutes, 0)

    return {
      totalSessions: sessions.length,
      totalBuyIn,
      totalCashOut,
      netProfit: totalCashOut - totalBuyIn,
      winRate: (wins / sessions.length) * 100,
      avgSessionTime: totalTime / sessions.length,
      bestSession: Math.max(...profits),
      worstSession: Math.min(...profits),
      avgProfit: (totalCashOut - totalBuyIn) / sessions.length,
    }
  })()

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return { sessions: sortedSessions, stats, addSession, deleteSession, editSession }
}
