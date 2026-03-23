import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'Black Jack - Registro de Sesiones',
  description:
    'Registra y analiza tus sesiones de blackjack en el casino. Lleva control de ganancias, perdidas y estadisticas.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: 'chip_3.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: 'chip_3.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: 'chip_3.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function () {
              var isDark = localStorage.getItem("MODE") === "dark";

              if (isDark) {
                document.documentElement.classList.add("dark");
              } else {
                document.documentElement.classList.remove("dark");
              }

              var meta = document.querySelector('meta[name="theme-color"]');

              if (!meta) {
                meta = document.createElement("meta");
                meta.setAttribute("name", "theme-color");
                document.head.appendChild(meta);
              }

              meta.setAttribute("content", isDark ? "#0f172a" : "#ffffff");
            })();
          `}
        </Script>
      </head>
      <body className={`${_inter.variable} ${_jetbrainsMono.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}