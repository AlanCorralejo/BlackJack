export interface Session {
  id: string
  casinoName: string
  date: string
  hours: number,
  minutes: number,
  buyIn: number
  cashOut: number
  notes?: string
  createdAt: string,
  totalWin: number
}

export interface SessionFormData {
  casinoName: string
  date: string
  hours: number
  minutes: number
  buyIn: number
  cashOut: number
  notes?: string
}

export interface Stats {
  totalSessions: number
  totalBuyIn: number
  totalCashOut: number
  netProfit: number
  winRate: number
  avgSessionTime: number
  bestSession: number
  worstSession: number
  avgProfit: number
}
