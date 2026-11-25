'use client'

import { useState, useEffect } from 'react'
import CodeEditor from '@/components/CodeEditor'
import AccessoryBar from '@/components/AccessoryBar'
import SnippetLibrary from '@/components/SnippetLibrary'
import Terminal from '@/components/Terminal'
import { useExecutionWorker } from '@/hooks/useExecutionWorker'

export default function Home() {
  const [code, setCode] = useState('console.log("Hello, World!");\nconsole.log("Welcome to CodeFlow!");')
  const [language, setLanguage] = useState('javascript')
  const [output, setOutput] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [showConsole, setShowConsole] = useState(false)
  const [showSnippets, setShowSnippets] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  const { executeCode, initializeWorker } = useExecutionWorker()

  useEffect(() => {
    // Initialize execution worker on mount
    initializeWorker()

    // Monitor online status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleExecute = async () => {
    setIsExecuting(true)
    setOutput('')

    try {
      const result = await executeCode(code, language)
      setOutput(result.output || result.error || 'Execution completed')
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsExecuting(false)
    }
  }

  const handleInsertSymbol = (symbol: string) => {
    setCode(prev => prev + symbol)
  }

  const handleInsertSnippet = (snippet: string) => {
    setCode(prev => prev + '\n' + snippet + '\n')
    setShowSnippets(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">CloudCode</h1>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
              <span className="w-2 h-2 rounded-full bg-current"></span>
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
      </header>

      {/* Language Selector */}
      <div className="px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="sql">SQL</option>
          <option value="cpp">C++ (Remote)</option>
          <option value="rust">Rust (Remote)</option>
          <option value="go">Go (Remote)</option>
          <option value="java">Java (Remote)</option>
        </select>
      </div>

      {/* Main Content - Adaptive Layout */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-180px)]">
        {/* Editor Section */}
        <div className={`relative ${showConsole ? 'md:w-1/2' : 'md:w-full'}`}>
          <CodeEditor
            code={code}
            onChange={setCode}
            language={language}
            className="h-full"
          />
        </div>

        {/* Console Output - Desktop Split View / Mobile Sheet View */}
        {showConsole && (
          <>
            {/* Desktop: Side-by-side view */}
            <div className="hidden md:block md:w-1/2 bg-gray-900 border-l border-gray-700">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <h3 className="font-semibold text-white">Terminal</h3>
                <button
                  onClick={() => setShowConsole(false)}
                  className="text-gray-400 hover:text-white"
                >
                  Close
                </button>
              </div>
              <div className="h-[calc(100%-52px)] overflow-y-auto p-4">
                <Terminal output={output} language={language} onClear={() => setOutput('')} />
              </div>
            </div>

            {/* Mobile: Sheet view */}
            <div className="md:hidden mobile-sheet bg-gray-900 border-t border-gray-700">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <h3 className="font-semibold text-white">Terminal</h3>
                <button
                  onClick={() => setShowConsole(false)}
                  className="text-gray-400 hover:text-white"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <Terminal output={output} language={language} onClear={() => setOutput('')} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Accessory Bar */}
      <AccessoryBar
        onInsertSymbol={handleInsertSymbol}
        onToggleSnippets={() => setShowSnippets(!showSnippets)}
        onExecute={handleExecute}
        isExecuting={isExecuting}
        onToggleConsole={() => setShowConsole(!showConsole)}
        showConsole={showConsole}
      />

      {/* Snippet Library */}
      <SnippetLibrary
        isOpen={showSnippets}
        onClose={() => setShowSnippets(false)}
        onInsertSnippet={handleInsertSnippet}
        language={language}
      />
    </main>
  )
}
