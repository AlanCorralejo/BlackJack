"use client"

import { useEffect, useRef, useState } from "react"
import { StatsDashboard } from "@/components/stats-dashboard"
import { SessionList } from "@/components/session-list"
import { SessionForm } from "@/components/session-form"
import { Switch } from "@/components/ui/switch"
import { WiDaySunny } from "react-icons/wi";
import { LuMoon } from "react-icons/lu";
import { app, db } from '../../firebase';
import { getAuth, signOut, User } from "firebase/auth"
import { redirect } from "next/navigation"
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore"
import { Session } from "@/lib/types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CirclePower } from "lucide-react"
import { SlMenu } from "react-icons/sl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StatsGraphics from "@/components/Graficas/stats-graphics"


type Tab = "stats" | "history" | "graficas"

export default function Home() {
  const [sesiones, setSesiones] = useState<Session[]>([])
  const [activeTab, setActiveTab] = useState<Tab>("stats")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const auth = getAuth(app);

  const TABS: Tab[] = ["stats", "history", "graficas"]
  const TAB_VALUES = ["resumen", "historial", "graficas"]
  const touchStartX = useRef<number>(0)
  const [currentTabIndex, setCurrentTabIndex] = useState(0)
  const [sliding, setSliding] = useState<"left" | "right" | null>(null)

  const stats = {
    profits: sesiones.map((s) => s.cashOut - s.buyIn),
    totalBuyIn: sesiones.reduce((sum, s) => sum + s.buyIn, 0),
    totalCashOut: sesiones.reduce((sum, s) => sum + s.cashOut, 0),
    wins: sesiones.filter((s) => s.cashOut > s.buyIn).length,
    totalTime: sesiones.reduce((sum, s) => sum + s.hours, 0),
    totalSessions: sesiones.length,
    netProfit: sesiones.reduce((sum, s) => sum + s.cashOut, 0) - sesiones.reduce((sum, s) => sum + s.buyIn, 0),
    winRate: (sesiones.filter((s) => s.cashOut > s.buyIn).length / sesiones.length) * 100,
    avgSessionTime: sesiones.reduce((sum, s) => sum + s.hours, 0) / sesiones.length,
    bestSession: Math.max(...sesiones.map((s) => s.cashOut - s.buyIn)),
    worstSession: Math.min(...sesiones.map((s) => s.cashOut - s.buyIn)),
    avgProfit: (sesiones.reduce((sum, s) => sum + s.cashOut, 0) - sesiones.reduce((sum, s) => sum + s.buyIn, 0)) / sesiones.length,
  }
  const setupRealtimeDataListener = (currentUser: User | null, setSesiones: (sessions: Session[]) => void) => {
    if (!currentUser) {
      setSesiones([]);
      console.log("No hay usuario autenticado para escuchar datos de sesiones.");
      return () => { };
    }

    const q = query(
      collection(db, "blackjack_sesiones"),
      where("userId", "==", currentUser.uid),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const sessions: Session[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Session[];
      setSesiones(sessions);
    }, (error: any) => {
      console.error("Error al escuchar los datos de sesiones: ", error);
    });

    return unsubscribe;
  };



  const logOut = async () => {
    try {
      await signOut(auth);
      redirect('/login')

    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(deltaX) < 50) return

    const direction = deltaX > 0 ? "left" : "right"
    const nextIndex = deltaX > 0 ? currentTabIndex + 1 : currentTabIndex - 1

    if (nextIndex < 0 || nextIndex >= TABS.length) return

    setSliding(direction)

    setTimeout(() => {
      setCurrentTabIndex(nextIndex)
      setActiveTab(TABS[nextIndex])
      setSliding(null)
    }, 250)
  }

  const applyTheme = (dark: boolean) => {
    setIsDark(dark)
    localStorage.setItem('MODE', dark ? 'dark' : '')
    document.documentElement.classList.toggle('dark', dark)

    // Primer intento inmediato
    const existingMeta = document.querySelector('meta[name="theme-color"]')
    if (existingMeta) {
      existingMeta.remove()
    }

    const meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    meta.setAttribute('content', dark ? '#0f172a' : '#ffffff')
    document.head.appendChild(meta)

    // Safari iOS fix: segundo intento con delay
    setTimeout(() => {
      const m = document.querySelector('meta[name="theme-color"]')
      if (m) m.remove()

      const newMeta = document.createElement('meta')
      newMeta.setAttribute('name', 'theme-color')
      newMeta.setAttribute('content', dark ? '#0f172a' : '#ffffff')
      document.head.appendChild(newMeta)
    }, 50)
  }

  useEffect(() => {
    const savedMode = localStorage.getItem("MODE") === "dark"
    document.documentElement.classList.toggle("dark", savedMode)
    setIsDark(savedMode)
  }, [])


  useEffect(() => {
    let unsubscribeFromFirestore: () => void;

    if (auth.currentUser) {
      unsubscribeFromFirestore = setupRealtimeDataListener(auth.currentUser, setSesiones);
    } else {
      setSesiones([]);
      unsubscribeFromFirestore = () => { };
    }
    return () => {
      if (unsubscribeFromFirestore) {
        unsubscribeFromFirestore();
        console.log("Listener de datos de sesiones detenido.");
      }
    };
  }, [auth.currentUser]);


  return (
    <main className={`relative mx-auto flex min-h-dvh max-w-lg flex-col bg-background`}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <img className="h-8 w-8" src="chip_3.png" />
            <div>
              <h1 className="text-base font-bold text-foreground tracking-tight">
                Black Jack
              </h1>
              <p className="text-xs text-muted-foreground">
                {stats.totalSessions} {stats.totalSessions === 1 ? "sesion" : "sesiones"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <WiDaySunny size={25} />
            <Switch
              checked={isDark}
              onCheckedChange={(checked) => { applyTheme(checked) }}
            />
            <LuMoon size={20} />
          </div>
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <SlMenu />
              </PopoverTrigger>
              <PopoverContent className="w-auto">
                <div onClick={() => logOut()} className="flex items-center space-x-2"><CirclePower size={18} /> <p className="text-sm">Cerrar sesión</p></div>
              </PopoverContent>
            </Popover>
          </div>

        </div>

      </header>
      <div>
        <Tabs
          value={TAB_VALUES[currentTabIndex]}
          onValueChange={(val) => {
            const idx = TAB_VALUES.indexOf(val)
            setCurrentTabIndex(idx)
            setActiveTab(TABS[idx])
          }}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="resumen">
              <TabButton
                label="Resumen"
                active={activeTab === "stats"}
                onClick={() => setActiveTab("stats")}
              />
            </TabsTrigger>
            <TabsTrigger value="historial">
              <TabButton
                label="Historial"
                active={activeTab === "history"}
                onClick={() => setActiveTab("history")}
              />
            </TabsTrigger>
            <TabsTrigger value="graficas">
              <TabButton
                label="Graficas"
                active={activeTab === "graficas"}
                onClick={() => setActiveTab("graficas")}
              />
            </TabsTrigger>
          </TabsList>
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{
              transform: sliding === "left"
                ? "translateX(-30px)"
                : sliding === "right"
                  ? "translateX(30px)"
                  : "translateX(0)",
              opacity: sliding ? 0 : 1,
              transition: sliding
                ? "transform 250ms ease, opacity 250ms ease"
                : "none",
            }}>
            <TabsContent value="resumen">
              <StatsDashboard stats={stats} />
            </TabsContent>
            <TabsContent value="historial">
              <SessionList
                sessions={sesiones}
              />
            </TabsContent>
            <TabsContent value="graficas">
              <StatsGraphics sesiones={sesiones} />
            </TabsContent>
          </div>

        </Tabs>
      </div>

      {/* Floating Action Button */}
      <SessionForm
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
    <p
      onClick={onClick}
      className={`relative flex-1 py-2.5 text-sm font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full bg-primary" />
      )}
    </p>
  )
}
