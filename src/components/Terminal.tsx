'use client'

import { useEffect, useRef, useState } from 'react'

interface TerminalProps {
  output: string
  className?: string
  language?: string
  onClear?: () => void
}

export default function Terminal({ 
  output, 
  className = '', 
  language = 'javascript',
  onClear 
}: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  const formatOutput = (text: string) => {
    if (!text) return ''
    
    // Add syntax highlighting for common patterns
    return text
      .replace(/Error:/gi, '<span class="text-red-400 font-bold">Error:</span>')
      .replace(/ERROR:/gi, '<span class="text-red-400 font-bold">ERROR:</span>')
      .replace(/Success:/gi, '<span class="text-green-400 font-bold">Success:</span>')
      .replace(/WARN:/gi, '<span class="text-yellow-400 font-bold">WARN:</span>')
      .replace(/Warning:/gi, '<span class="text-yellow-400 font-bold">Warning:</span>')
      .replace(/Info:/gi, '<span class="text-blue-400 font-bold">Info:</span>')
      .replace(/\d+ms/g, '<span class="text-purple-400">$&</span>')
      .replace(/\d+\.\d+s/g, '<span class="text-purple-400">$&</span>')
      .replace(/Execution time:/gi, '<span class="text-gray-400">Execution time:</span>')
  }

  const getPrompt = () => {
    return `<span class="text-green-400">user@cloudcode</span>:<span class="text-blue-400">~</span>$`
  }

  const getCommandDisplay = () => {
    return `${language} --exec`
  }

  return (
    <div className={`terminal-container ${className}`}>
      {/* Terminal Header */}
      <div className="terminal-header">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-xs text-gray-400 font-mono">
            {language.toUpperCase()} Terminal
          </span>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="text-xs text-gray-400 hover:text-white transition-colors"
            title="Clear terminal"
          >
            Clear
          </button>
        )}
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="terminal-content"
      >
        {/* Command prompt */}
        <div className="terminal-line">
          <span 
            dangerouslySetInnerHTML={{ 
              __html: getPrompt() 
            }} 
          />
          <span className="ml-2 text-gray-300">
            {getCommandDisplay()}
          </span>
        </div>

        {/* Output */}
        {output ? (
          <div className="terminal-output">
            <pre 
              className="whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{ 
                __html: formatOutput(output) 
              }}
            />
          </div>
        ) : (
          <div className="terminal-line text-gray-500 italic">
            No output yet. Run your code to see results.
          </div>
        )}

        {/* End marker */}
        <div className="terminal-line">
          <span 
            dangerouslySetInnerHTML={{ 
              __html: getPrompt() 
            }} 
          />
          <span className="ml-2 animate-pulse">▌</span>
        </div>
      </div>
    </div>
  )
}
