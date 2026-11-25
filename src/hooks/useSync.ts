import { useEffect, useState } from 'react'

type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error'

export function useOfflineSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced')
  const [pendingChanges, setPendingChanges] = useState(0)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Monitor online status
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

    // Initialize online status
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const manualSync = async () => {
    if (!isOnline) {
      setSyncStatus('offline')
      return
    }
    
    setSyncStatus('syncing')
    // Simulate sync - in production this would sync with server
    setTimeout(() => {
      setSyncStatus('synced')
    }, 1000)
  }

  return {
    syncStatus,
    pendingChanges,
    isOnline,
    manualSync,
  }
}

  const syncItem = async (item: any) => {
    switch (item.type) {
      case 'file':
        return syncFile(item)
      case 'execution':
        return syncExecution(item)
      case 'project':
        return syncProject(item)
      default:
        throw new Error(`Unknown sync type: ${item.type}`)
    }
  }

  const syncFile = async (item: any) => {
    const { operation, data } = item
    
    switch (operation) {
      case 'create':
      case 'update':
        const response = await fetch('/api/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        
        if (!response.ok) throw new Error('Failed to sync file')
        break
        
      case 'delete':
        const deleteResponse = await fetch(`/api/files/${data.id}`, {
          method: 'DELETE',
        })
        
        if (!deleteResponse.ok) throw new Error('Failed to delete file')
        break
    }
  }

  const syncExecution = async (item: any) => {
    const { data } = item
    
    const response = await fetch('/api/execution-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) throw new Error('Failed to sync execution log')
  }

  const syncProject = async (item: any) => {
    const { operation, data } = item
    
    switch (operation) {
      case 'create':
      case 'update':
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        
        if (!response.ok) throw new Error('Failed to sync project')
        break
        
      case 'delete':
        const deleteResponse = await fetch(`/api/projects/${data.id}`, {
          method: 'DELETE',
        })
        
        if (!deleteResponse.ok) throw new Error('Failed to delete project')
        break
    }
  }

  const manualSync = useCallback(async () => {
    if (!isOnline) {
      setSyncStatus('offline')
      return
    }
    
    await syncPendingChanges()
  }, [isOnline, syncPendingChanges])

  return {
    syncStatus,
    pendingChanges,
    isOnline,
    manualSync,
  }
}
