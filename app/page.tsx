"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { app } from "./firebase"

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const auth = getAuth(app)

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/home")
      } else {
        router.replace("/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  return null
}