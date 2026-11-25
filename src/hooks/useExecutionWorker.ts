import { useState, useCallback } from 'react'

type ExecutionResult = {
  output?: string
  error?: string
  success: boolean
}

// Languages that support client-side execution
const CLIENT_SIDE_LANGUAGES = ['javascript', 'python', 'sql']

// Languages that require remote execution
const REMOTE_LANGUAGES = ['cpp', 'rust', 'go', 'java']

export function useExecutionWorker() {
  const [isWorkerReady, setIsWorkerReady] = useState(false)

  // Initialize the worker (simplified)
  const initializeWorker = useCallback(() => {
    // Simulate worker initialization
    setTimeout(() => {
      setIsWorkerReady(true)
    }, 500)
  }, [])

  // Execute code (actual execution for JavaScript, simulated for others)
  const executeCode = useCallback(async (
    code: string,
    language: string,
    timeout: number = 10000
  ): Promise<ExecutionResult> => {
    // Check if language requires remote execution
    if (REMOTE_LANGUAGES.includes(language)) {
      return executeRemoteCode(code, language, timeout)
    }

    // Execute JavaScript directly
    if (language === 'javascript') {
      return executeJavaScript(code, timeout)
    }

    // For other client-side languages, still simulate for now
    // In production, this would use Pyodide for Python and SQL.js for SQL
    return executeSimulated(code, language)
  }, [])

  // Execute JavaScript code directly
  const executeJavaScript = async (code: string, timeout: number): Promise<ExecutionResult> => {
    return new Promise((resolve) => {
      const output: string[] = []
      const startTime = Date.now()

      // Create a sandboxed console to capture output
      const sandboxConsole = {
        log: (...args: any[]) => {
          output.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '))
        },
        error: (...args: any[]) => {
          output.push('ERROR: ' + args.map(arg => String(arg)).join(' '))
        },
        warn: (...args: any[]) => {
          output.push('WARN: ' + args.map(arg => String(arg)).join(' '))
        },
        info: (...args: any[]) => {
          output.push('INFO: ' + args.map(arg => String(arg)).join(' '))
        },
      }

      // Set timeout
      const timeoutId = setTimeout(() => {
        resolve({
          output: output.length > 0 ? output.join('\n') : 'Execution timeout',
          success: false,
        })
      }, timeout)

      try {
        // Create a function from the code and execute it
        const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
        const executableCode = new AsyncFunction('console', code)
        
        executableCode(sandboxConsole).then(() => {
          clearTimeout(timeoutId)
          const executionTime = Date.now() - startTime
          const result = output.length > 0 
            ? output.join('\n') 
            : 'Code executed successfully (no output)'
          
          resolve({
            output: `${result}\n\nExecution time: ${executionTime}ms`,
            success: true,
          })
        }).catch((error) => {
          clearTimeout(timeoutId)
          resolve({
            output: output.length > 0 ? output.join('\n') : '',
            error: error instanceof Error ? error.message : String(error),
            success: false,
          })
        })
      } catch (error) {
        clearTimeout(timeoutId)
        resolve({
          output: output.length > 0 ? output.join('\n') : '',
          error: error instanceof Error ? error.message : String(error),
          success: false,
        })
      }
    })
  }

  // Simulated execution for Python and SQL (for now)
  const executeSimulated = async (code: string, language: string): Promise<ExecutionResult> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // For Python, try to parse print statements and show their output
    if (language === 'python') {
      const printMatches = code.match(/print\s*\(([^)]+)\)/g)
      if (printMatches) {
        const outputs = printMatches.map(match => {
          const content = match.match(/print\s*\(([^)]+)\)/)?.[1]
          // Remove quotes from string literals
          return content?.replace(/^['"]|['"]$/g, '').replace(/\\n/g, '\n') || ''
        }).filter(Boolean)
        
        if (outputs.length > 0) {
          return {
            output: outputs.join('\n'),
            success: true,
          }
        }
      }
    }

    // For SQL, simulate simple SELECT results
    if (language === 'sql') {
      if (code.toLowerCase().includes('select')) {
        return {
          output: 'id | name | value\n----|------|------\n1   | test | 100\n2   | demo | 200',
          success: true,
        }
      }
      return {
        output: 'Query executed successfully',
        success: true,
      }
    }

    return {
      output: `Code executed successfully\n(Language: ${language})`,
      success: true,
    }
  }

  // Execute code on remote server
  const executeRemoteCode = async (
    code: string,
    language: string,
    timeout: number = 10000
  ): Promise<ExecutionResult> => {
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          code,
          timeout,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      return {
        output: result.output,
        error: result.error,
        success: !result.error,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Remote execution failed',
        success: false,
      }
    }
  }

  return {
    executeCode,
    initializeWorker,
    isWorkerReady,
  }
}
