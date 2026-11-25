'use client'

import { useEffect, useState } from 'react'

export default function ServiceWorkerRegistration() {
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          })
          console.log('Service Worker registered:', registration)
          setSwRegistration(registration)

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setShowUpdate(true)
                }
              })
            }
          })
        } catch (error) {
          console.error('Service Worker registration failed:', error)
        }
      }

      registerSW()
    }
  }, [])

  const handleUpdate = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  if (!showUpdate) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-primary-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <span className="text-sm font-medium">Update available</span>
        <button
          onClick={handleUpdate}
          className="bg-white text-primary-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  )
}
