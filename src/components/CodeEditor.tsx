'use client'

import { useEffect, useRef, useState } from 'react'
import { EditorView } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'
import { createMobileEditorConfig, loadLanguageExtension } from '@/lib/codemirror-config'

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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!editorRef.current) return

    // Create editor state
    const createState = async () => {
      const baseExtensions = [
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
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

      // Add theme
      if (theme === 'dark') {
        baseExtensions.push(oneDark)
      }

      // Load language extension
      const langExtension = await loadLanguageExtension(language)
      if (Array.isArray(langExtension)) {
        baseExtensions.push(...langExtension)
      } else if (langExtension) {
        baseExtensions.push(langExtension)
      }

      // Optional autocomplete
      if (enableAutocomplete) {
        const { autocompletion } = await import('@codemirror/autocomplete')
        baseExtensions.push(autocompletion())
      }

      return EditorState.create({
        doc: code,
        extensions: baseExtensions,
      })
    }

    // Initialize editor
    createState().then((state) => {
      if (editorRef.current && !viewRef.current) {
        viewRef.current = new EditorView({
          state,
          parent: editorRef.current,
        })
        setIsLoading(false)
      }
    })

    // Cleanup
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy()
        viewRef.current = null
      }
    }
  }, []) // Only run on mount

  // Re-create editor when language, theme, or autocomplete changes
  useEffect(() => {
    if (!editorRef.current) return

    const recreateEditor = async () => {
      // Destroy existing editor
      if (viewRef.current) {
        viewRef.current.destroy()
        viewRef.current = null
      }

      // Create new editor state
      const baseExtensions = [
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
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

      // Add theme
      if (theme === 'dark') {
        baseExtensions.push(oneDark)
      }

      // Load language extension
      const langExtension = await loadLanguageExtension(language)
      if (Array.isArray(langExtension)) {
        baseExtensions.push(...langExtension)
      } else if (langExtension) {
        baseExtensions.push(langExtension)
      }

      // Optional autocomplete
      if (enableAutocomplete) {
        const { autocompletion } = await import('@codemirror/autocomplete')
        baseExtensions.push(autocompletion())
      }

      const state = EditorState.create({
        doc: code,
        extensions: baseExtensions,
      })

      // Create new editor view
      if (editorRef.current) {
        viewRef.current = new EditorView({
          state,
          parent: editorRef.current,
        })
        setIsLoading(false)
      }
    }

    recreateEditor()
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
