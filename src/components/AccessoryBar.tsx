'use client'

import { useState } from 'react'

interface AccessoryBarProps {
  onInsertSymbol: (symbol: string) => void
  onToggleSnippets: () => void
  onExecute: () => void
  isExecuting: boolean
  onToggleConsole: () => void
  showConsole: boolean
}

// Common syntax symbols for coding
const SYNTAX_SYMBOLS = [
  { symbol: '{}', label: 'Braces' },
  { symbol: '[]', label: 'Brackets' },
  { symbol: '()', label: 'Parens' },
  { symbol: ';', label: 'Semicolon' },
  { symbol: '->', label: 'Arrow' },
  { symbol: '=>', label: 'Fat Arrow' },
  { symbol: '=', label: 'Equals' },
  { symbol: '"', label: 'Double Quote' },
  { symbol: "'", label: 'Single Quote' },
  { symbol: '\t', label: 'Tab' },
  { symbol: ':', label: 'Colon' },
  { symbol: ',', label: 'Comma' },
  { symbol: '.', label: 'Dot' },
  { symbol: '!', label: 'Exclamation' },
  { symbol: '+', label: 'Plus' },
  { symbol: '-', label: 'Minus' },
]

export default function AccessoryBar({
  onInsertSymbol,
  onToggleSnippets,
  onExecute,
  isExecuting,
  onToggleConsole,
  showConsole,
}: AccessoryBarProps) {
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null)

  const handleSymbolPress = (symbol: string) => {
    setActiveSymbol(symbol)
    onInsertSymbol(symbol)
    
    // Visual feedback
    setTimeout(() => setActiveSymbol(null), 150)
  }

  return (
    <div className="accessory-bar safe-area-bottom">
      {/* Syntax symbols */}
      <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
        {SYNTAX_SYMBOLS.map(({ symbol, label }) => (
          <button
            key={symbol}
            onClick={() => handleSymbolPress(symbol)}
            className={`
              flex-shrink-0 px-3 py-2 rounded-lg font-mono text-sm font-medium
              transition-all duration-150 active:scale-95
              ${
                activeSymbol === symbol
                  ? 'bg-primary-500 text-white transform scale-95'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }
            `}
            aria-label={`Insert ${label}`}
          >
            {symbol === '\t' ? '⇥' : symbol}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
        <button
          onClick={onToggleSnippets}
          className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all"
        >
          📋 Snippets
        </button>

        <button
          onClick={onToggleConsole}
          className={`
            flex-1 px-4 py-2 rounded-lg font-medium text-sm active:scale-95 transition-all
            ${
              showConsole
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }
          `}
        >
          {showConsole ? '📊 Hide' : '📊 Console'}
        </button>

        <button
          onClick={onExecute}
          disabled={isExecuting}
          className={`
            flex-1 px-4 py-2 rounded-lg font-medium text-sm active:scale-95 transition-all
            ${
              isExecuting
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white'
            }
          `}
        >
          {isExecuting ? '⏳ Running...' : '▶ Run'}
        </button>
      </div>
    </div>
  )
}
