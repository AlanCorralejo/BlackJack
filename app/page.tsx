"use client"

import { useState } from "react"
import { useSessions } from "@/hooks/use-sessions"
import { StatsDashboard } from "@/components/stats-dashboard"
import { SessionList } from "@/components/session-list"
import { SessionForm } from "@/components/session-form"
import { Spade } from "lucide-react"

type Tab = "stats" | "history"

export default function Home() {
  const { sessions, stats, addSession, deleteSession, editSession } = useSessions()
  const [activeTab, setActiveTab] = useState<Tab>("stats")
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-lg flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Spade className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground tracking-tight">
                Black Jack
              </h1>
              <p className="text-xs text-muted-foreground">
                {stats.totalSessions} {stats.totalSessions === 1 ? "sesion" : "sesiones"}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-4 pb-0">
          <TabButton
            label="Resumen"
            active={activeTab === "stats"}
            onClick={() => setActiveTab("stats")}
          />
          <TabButton
            label="Historial"
            active={activeTab === "history"}
            onClick={() => setActiveTab("history")}
          />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 pt-4">
        {activeTab === "stats" ? (
          <StatsDashboard stats={stats} />
        ) : (
          <SessionList
            sessions={sessions}
            onDelete={deleteSession}
            onEdit={editSession}
          />
        )}
      </div>

      {/* Floating Action Button */}
      <SessionForm
        onSubmit={addSession}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </main>
  )
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-1 py-2.5 text-sm font-medium transition-colors ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full bg-primary" />
      )}
    </button>
  )
}
