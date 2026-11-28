'use client'

import { useEffect, useRef, useState } from 'react'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'
import { loadLanguageExtension } from '@/lib/codemirror-config'

interface CodeEditorProps {
  code: string
  onChange: (value: string) => void
  language: string
  className?: string
  theme?: 'light' | 'dark'
  enableAutocomplete?: boolean
}

export default function CodeEditor({
  code,
  onChange,
  language,
  className = '',
  theme = 'light',
  enableAutocomplete = false,
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  const codeRef = useRef(code)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    codeRef.current = code
  }, [code])

  // Create or recreate editor when language, theme, or autocomplete changes
  useEffect(() => {
    const container = editorRef.current
    if (!container) return

    let cancelled = false

    const initEditor = async () => {
      setIsLoading(true)

      if (viewRef.current) {
        viewRef.current.destroy()
        viewRef.current = null
      }

      const baseExtensions = [
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString())
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px',
          },
          '.cm-content': {
            padding: '12px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          },
          '.cm-scroller': {
            overflow: 'auto',
          },
        }),
      ]

      if (theme === 'dark') {
        baseExtensions.push(oneDark)
      }

      const langExtension = await loadLanguageExtension(language)
      if (Array.isArray(langExtension)) {
        baseExtensions.push(...langExtension)
      } else if (langExtension) {
        baseExtensions.push(langExtension)
      }

      if (enableAutocomplete) {
        const { autocompletion } = await import('@codemirror/autocomplete')
        baseExtensions.push(autocompletion())
      }

      if (cancelled || !editorRef.current) return

      const state = EditorState.create({
        doc: codeRef.current,
        extensions: baseExtensions,
      })

      viewRef.current = new EditorView({
        state,
        parent: editorRef.current,
      })
      setIsLoading(false)
    }

    initEditor()

    return () => {
      cancelled = true
      if (viewRef.current) {
        viewRef.current.destroy()
        viewRef.current = null
      }
    }
  }, [language, theme, enableAutocomplete])

  // Update code when it changes externally
  useEffect(() => {
    if (!viewRef.current) return

    const currentDoc = viewRef.current.state.doc.toString()
    if (currentDoc !== code) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: currentDoc.length,
          insert: code,
        },
      })
    }
  }, [code])

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-gray-500 dark:text-gray-400">Loading editor...</div>
        </div>
      )}
      <div ref={editorRef} className="h-full w-full" />
    </div>
  )
}
