import type { Metadata, Viewport } from 'next'
import './globals.css'
import ServiceWorkerRegistration from './ServiceWorkerRegistration'

export const metadata: Metadata = {
  title: 'CloudCode - Mobile-First Coding Platform',
  description: 'A mobile-first progressive web application for coding with hybrid execution capabilities',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CloudCode',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0ea5e9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
