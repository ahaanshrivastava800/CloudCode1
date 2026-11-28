import { useEffect, useState, useCallback } from 'react'

type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error'

export function useOfflineSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced')
  const [pendingChanges, setPendingChanges] = useState(0)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setSyncStatus('synced')
    }

    const handleOffline = () => {
      setIsOnline(false)
      setSyncStatus('offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    setIsOnline(navigator.onLine)
    if (!navigator.onLine) {
      setSyncStatus('offline')
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const manualSync = useCallback(async () => {
    if (!isOnline) {
      setSyncStatus('offline')
      return
    }

    setSyncStatus('syncing')
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setPendingChanges(0)
      setSyncStatus('synced')
    } catch {
      setSyncStatus('error')
    }
  }, [isOnline])

  return {
    syncStatus,
    pendingChanges,
    isOnline,
    manualSync,
  }
}
