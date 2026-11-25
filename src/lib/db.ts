import { openDB, DBSchema, IDBPDatabase } from 'idb'

// Define the database schema
interface CloudCodeDB extends DBSchema {
  files: {
    key: string
    value: {
      id: string
      name: string
      content: string
      language: string
      createdAt: number
      updatedAt: number
      synced: boolean
    }
    indexes: {
      'by-updatedAt': number
      'by-language': string
      'by-synced': boolean
    }
  }
  executionLogs: {
    key: string
    value: {
      id: string
      fileId: string
      code: string
      language: string
      output: string
      error?: string
      timestamp: number
      synced: boolean
    }
    indexes: {
      'by-fileId': string
      'by-timestamp': number
      'by-synced': boolean
    }
  }
  projects: {
    key: string
    value: {
      id: string
      name: string
      description?: string
      createdAt: number
      updatedAt: number
      fileIds: string[]
      synced: boolean
    }
    indexes: {
      'by-updatedAt': number
      'by-synced': boolean
    }
  }
  syncQueue: {
    key: string
    value: {
      id: string
      type: 'file' | 'execution' | 'project'
      operation: 'create' | 'update' | 'delete'
      data: any
      timestamp: number
      retryCount: number
    }
    indexes: {
      'by-timestamp': number
      'by-retryCount': number
    }
  }
}

const DB_NAME = 'CloudCodeDB'
const DB_VERSION = 1

let db: IDBPDatabase<CloudCodeDB> | null = null

// Initialize the database
export async function initDB(): Promise<IDBPDatabase<CloudCodeDB>> {
  if (db) return db

  db = await openDB<CloudCodeDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      // Files store
      if (!database.objectStoreNames.contains('files')) {
        const fileStore = database.createObjectStore('files', { keyPath: 'id' })
        fileStore.createIndex('by-updatedAt', 'updatedAt')
        fileStore.createIndex('by-language', 'language')
        fileStore.createIndex('by-synced', 'synced')
      }

      // Execution logs store
      if (!database.objectStoreNames.contains('executionLogs')) {
        const logStore = database.createObjectStore('executionLogs', { keyPath: 'id' })
        logStore.createIndex('by-fileId', 'fileId')
        logStore.createIndex('by-timestamp', 'timestamp')
        logStore.createIndex('by-synced', 'synced')
      }

      // Projects store
      if (!database.objectStoreNames.contains('projects')) {
        const projectStore = database.createObjectStore('projects', { keyPath: 'id' })
        projectStore.createIndex('by-updatedAt', 'updatedAt')
        projectStore.createIndex('by-synced', 'synced')
      }

      // Sync queue store
      if (!database.objectStoreNames.contains('syncQueue')) {
        const syncStore = database.createObjectStore('syncQueue', { keyPath: 'id' })
        syncStore.createIndex('by-timestamp', 'timestamp')
        syncStore.createIndex('by-retryCount', 'retryCount')
      }
    },
  })

  return db
}

// File operations
export async function saveFile(file: {
  id: string
  name: string
  content: string
  language: string
  synced?: boolean
}) {
  const database = await initDB()
  const fileWithTimestamp = {
    ...file,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    synced: file.synced ?? false,
  }
  
  await database.put('files', fileWithTimestamp)
  
  // Add to sync queue if not synced
  if (!fileWithTimestamp.synced) {
    await addToSyncQueue({
      type: 'file',
      operation: file.id ? 'update' : 'create',
      data: fileWithTimestamp,
    })
  }
  
  return fileWithTimestamp
}

export async function getFile(id: string) {
  const database = await initDB()
  return database.get('files', id)
}

export async function getAllFiles() {
  const database = await initDB()
  return database.getAll('files')
}

export async function getFilesByLanguage(language: string) {
  const database = await initDB()
  return database.getAllFromIndex('files', 'by-language', language)
}

export async function deleteFile(id: string) {
  const database = await initDB()
  await database.delete('files', id)
  
  // Add to sync queue
  await addToSyncQueue({
    type: 'file',
    operation: 'delete',
    data: { id },
  })
}

// Execution log operations
export async function saveExecutionLog(log: {
  fileId: string
  code: string
  language: string
  output: string
  error?: string
  synced?: boolean
}) {
  const database = await initDB()
  const logWithTimestamp = {
    ...log,
    id: `${log.fileId}-${Date.now()}`,
    timestamp: Date.now(),
    synced: log.synced ?? false,
  }
  
  await database.put('executionLogs', logWithTimestamp)
  
  // Add to sync queue if not synced
  if (!logWithTimestamp.synced) {
    await addToSyncQueue({
      type: 'execution',
      operation: 'create',
      data: logWithTimestamp,
    })
  }
  
  return logWithTimestamp
}

export async function getExecutionLogs(fileId: string) {
  const database = await initDB()
  return database.getAllFromIndex('executionLogs', 'by-fileId', fileId)
}

export async function getRecentExecutionLogs(limit: number = 10) {
  const database = await initDB()
  return database.getAllFromIndex('executionLogs', 'by-timestamp', null, limit)
}

// Project operations
export async function saveProject(project: {
  id: string
  name: string
  description?: string
  fileIds: string[]
  synced?: boolean
}) {
  const database = await initDB()
  const projectWithTimestamp = {
    ...project,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    synced: project.synced ?? false,
  }
  
  await database.put('projects', projectWithTimestamp)
  
  // Add to sync queue if not synced
  if (!projectWithTimestamp.synced) {
    await addToSyncQueue({
      type: 'project',
      operation: project.id ? 'update' : 'create',
      data: projectWithTimestamp,
    })
  }
  
  return projectWithTimestamp
}

export async function getProject(id: string) {
  const database = await initDB()
  return database.get('projects', id)
}

export async function getAllProjects() {
  const database = await initDB()
  return database.getAll('projects')
}

export async function deleteProject(id: string) {
  const database = await initDB()
  await database.delete('projects', id)
  
  // Add to sync queue
  await addToSyncQueue({
    type: 'project',
    operation: 'delete',
    data: { id },
  })
}

// Sync queue operations
async function addToSyncQueue(item: {
  type: 'file' | 'execution' | 'project'
  operation: 'create' | 'update' | 'delete'
  data: any
}) {
  const database = await initDB()
  const queueItem = {
    id: `${item.type}-${item.operation}-${Date.now()}`,
    ...item,
    timestamp: Date.now(),
    retryCount: 0,
  }
  
  await database.put('syncQueue', queueItem)
}

export async function getSyncQueue() {
  const database = await initDB()
  return database.getAll('syncQueue')
}

export async function removeFromSyncQueue(id: string) {
  const database = await initDB()
  await database.delete('syncQueue', id)
}

export async function updateSyncRetryCount(id: string, retryCount: number) {
  const database = await initDB()
  const item = await database.get('syncQueue', id)
  if (item) {
    await database.put('syncQueue', { ...item, retryCount })
  }
}

// Utility functions
export async function clearAllData() {
  const database = await initDB()
  const stores = ['files', 'executionLogs', 'projects', 'syncQueue']
  
  for (const store of stores) {
    await database.clear(store)
  }
}

export async function getUnsyncedItems() {
  const database = await initDB()
  
  const unsyncedFiles = await database.getAllFromIndex('files', 'by-synced', false)
  const unsyncedLogs = await database.getAllFromIndex('executionLogs', 'by-synced', false)
  const unsyncedProjects = await database.getAllFromIndex('projects', 'by-synced', false)
  
  return {
    files: unsyncedFiles,
    executionLogs: unsyncedLogs,
    projects: unsyncedProjects,
  }
}

export async function markAsSynced(type: 'file' | 'execution' | 'project', id: string) {
  const database = await initDB()
  
  switch (type) {
    case 'file': {
      const file = await database.get('files', id)
      if (file) {
        await database.put('files', { ...file, synced: true })
      }
      break
    }
    case 'execution': {
      const log = await database.get('executionLogs', id)
      if (log) {
        await database.put('executionLogs', { ...log, synced: true })
      }
      break
    }
    case 'project': {
      const project = await database.get('projects', id)
      if (project) {
        await database.put('projects', { ...project, synced: true })
      }
      break
    }
  }
}
