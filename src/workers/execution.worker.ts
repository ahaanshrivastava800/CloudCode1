// Web Worker for client-side code execution using WASM
// Handles Python (Pyodide), JavaScript, and SQL execution

type ExecutionMessage = {
  type: 'execute' | 'init' | 'terminate'
  language: string
  code: string
  timeout?: number
}

type ExecutionResponse = {
  type: 'result' | 'error' | 'init-complete' | 'timeout'
  output?: string
  error?: string
  language: string
}

let pyodide: any = null
let sqlJs: any = null
let isInitialized = false

// Dynamic CDN loader that bypasses static bundler module resolution
const dynamicImport = (url: string): Promise<any> =>
  new Function('url', 'return import(url)')(url)

// Initialize Pyodide for Python execution
async function initPyodide() {
  try {
    const { loadPyodide } = await dynamicImport('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js')
    
    pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
    })

    // Install common packages
    await pyodide.loadPackage(['micropip'])
    
    console.log('Pyodide initialized successfully')
    return true
  } catch (error) {
    console.error('Failed to initialize Pyodide:', error)
    return false
  }
}

// Initialize SQL.js for SQL execution
async function initSqlJs() {
  try {
    const initSqlJsModule = await dynamicImport('https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/sql-wasm.js')
    const initFn = initSqlJsModule.default || initSqlJsModule
    sqlJs = await initFn({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    })
    
    console.log('SQL.js initialized successfully')
    return true
  } catch (error) {
    console.error('Failed to initialize SQL.js:', error)
    return false
  }
}

// Execute Python code using Pyodide
async function executePython(code: string, timeout: number = 10000): Promise<ExecutionResponse> {
  if (!pyodide) {
    const initialized = await initPyodide()
    if (!initialized) {
      return {
        type: 'error',
        error: 'Failed to initialize Python environment',
        language: 'python',
      }
    }
  }

  try {
    // Redirect stdout/stderr to capture output
    pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
    `)

    // Create timeout promise
    const timeoutPromise = new Promise<ExecutionResponse>((_, reject) => {
      setTimeout(() => reject(new Error('Execution timeout')), timeout)
    })

    // Execute code with timeout
    const executionPromise: Promise<ExecutionResponse> = (async (): Promise<ExecutionResponse> => {
      try {
        await pyodide.runPythonAsync(code)
        
        // Get captured output
        const stdout = pyodide.runPython('sys.stdout.getvalue()')
        const stderr = pyodide.runPython('sys.stderr.getvalue()')
        
        const output = stdout + stderr
        
        return {
          type: 'result',
          output: output || 'Code executed successfully',
          language: 'python',
        }
      } catch (error) {
        return {
          type: 'error',
          error: error instanceof Error ? error.message : String(error),
          language: 'python',
        }
      }
    })()

    const result = await Promise.race([executionPromise, timeoutPromise])
    return result
  } catch (error) {
    if (error instanceof Error && error.message === 'Execution timeout') {
      return {
        type: 'timeout',
        error: 'Execution timeout',
        language: 'python',
      }
    }
    return {
      type: 'error',
      error: error instanceof Error ? error.message : String(error),
      language: 'python',
    }
  }
}

// Execute JavaScript code using lightweight sandbox
async function executeJavaScript(code: string, timeout: number = 10000): Promise<ExecutionResponse> {
  try {
    // Create timeout promise
    const timeoutPromise = new Promise<ExecutionResponse>((_, reject) => {
      setTimeout(() => reject(new Error('Execution timeout')), timeout)
    })

    // Execute code with timeout
    const executionPromise: Promise<ExecutionResponse> = (async (): Promise<ExecutionResponse> => {
      try {
        // Create a sandboxed execution environment
        const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
        const sandboxedFunction = new AsyncFunction('console', code)
        
        // Mock console to capture output
        const consoleOutput: string[] = []
        const mockConsole = {
          log: (...args: any[]) => {
            consoleOutput.push(args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '))
          },
          error: (...args: any[]) => {
            consoleOutput.push('ERROR: ' + args.map(arg => String(arg)).join(' '))
          },
          warn: (...args: any[]) => {
            consoleOutput.push('WARN: ' + args.map(arg => String(arg)).join(' '))
          },
        }

        await sandboxedFunction(mockConsole)
        
        return {
          type: 'result',
          output: consoleOutput.join('\n') || 'Code executed successfully',
          language: 'javascript',
        }
      } catch (error) {
        return {
          type: 'error',
          error: error instanceof Error ? error.message : String(error),
          language: 'javascript',
        }
      }
    })()

    const result = await Promise.race([executionPromise, timeoutPromise])
    return result
  } catch (error) {
    if (error instanceof Error && error.message === 'Execution timeout') {
      return {
        type: 'timeout',
        error: 'Execution timeout',
        language: 'javascript',
      }
    }
    return {
      type: 'error',
      error: error instanceof Error ? error.message : String(error),
      language: 'javascript',
    }
  }
}

// Execute SQL code using SQL.js
async function executeSQL(code: string, timeout: number = 10000): Promise<ExecutionResponse> {
  if (!sqlJs) {
    const initialized = await initSqlJs()
    if (!initialized) {
      return {
        type: 'error',
        error: 'Failed to initialize SQL environment',
        language: 'sql',
      }
    }
  }

  try {
    // Create timeout promise
    const timeoutPromise = new Promise<ExecutionResponse>((_, reject) => {
      setTimeout(() => reject(new Error('Execution timeout')), timeout)
    })

    // Execute code with timeout
    const executionPromise: Promise<ExecutionResponse> = (async (): Promise<ExecutionResponse> => {
      try {
        const db = new sqlJs.Database()
        
        // Execute SQL
        const results: string[] = []
        
        // Split by semicolon to handle multiple statements
        const statements = code.split(';').filter(s => s.trim())
        
        for (const statement of statements) {
          try {
            const stmt = db.prepare(statement)
            stmt.step()
            const row = stmt.getAsObject()
            results.push(JSON.stringify(row, null, 2))
            stmt.free()
          } catch (stmtError) {
            // Some statements might not return results (CREATE, INSERT, etc.)
            results.push(`Statement executed: ${statement.trim()}`)
          }
        }
        
        db.close()
        
        return {
          type: 'result',
          output: results.join('\n') || 'SQL executed successfully',
          language: 'sql',
        }
      } catch (error) {
        return {
          type: 'error',
          error: error instanceof Error ? error.message : String(error),
          language: 'sql',
        }
      }
    })()

    const result = await Promise.race([executionPromise, timeoutPromise])
    return result
  } catch (error) {
    if (error instanceof Error && error.message === 'Execution timeout') {
      return {
        type: 'timeout',
        error: 'Execution timeout',
        language: 'sql',
      }
    }
    return {
      type: 'error',
      error: error instanceof Error ? error.message : String(error),
      language: 'sql',
    }
  }
}

// Main message handler
self.onmessage = async (event: MessageEvent<ExecutionMessage>) => {
  const { type, language, code, timeout = 10000 } = event.data

  switch (type) {
    case 'init':
      // Initialize WASM environments
      const pyodideInit = await initPyodide()
      const sqlJsInit = await initSqlJs()
      
      isInitialized = pyodideInit || sqlJsInit
      
      self.postMessage({
        type: 'init-complete',
        language,
      } as ExecutionResponse)
      break

    case 'execute':
      if (!isInitialized && (language === 'python' || language === 'sql')) {
        // Auto-initialize if needed
        await initPyodide()
        await initSqlJs()
      }

      let result: ExecutionResponse

      switch (language) {
        case 'python':
          result = await executePython(code, timeout)
          break
        case 'javascript':
          result = await executeJavaScript(code, timeout)
          break
        case 'sql':
          result = await executeSQL(code, timeout)
          break
        default:
          result = {
            type: 'error',
            error: `Language ${language} not supported in client-side execution. Use remote execution.`,
            language,
          }
      }

      self.postMessage(result)
      break

    case 'terminate':
      // Cleanup resources
      if (pyodide) {
        pyodide = null
      }
      if (sqlJs) {
        sqlJs = null
      }
      isInitialized = false
      break

    default:
      self.postMessage({
        type: 'error',
        error: `Unknown message type: ${type}`,
        language,
      } as ExecutionResponse)
  }
}

// Export types for TypeScript
export type { ExecutionMessage, ExecutionResponse }
