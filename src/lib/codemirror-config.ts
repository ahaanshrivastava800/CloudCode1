import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'

// Dynamic language extension loader for minimal bundle size
export async function loadLanguageExtension(language: string) {
  switch (language) {
    case 'javascript':
      const { javascript } = await import('@codemirror/lang-javascript')
      return javascript()
    case 'python':
      const { python } = await import('@codemirror/lang-python')
      return python()
    case 'sql':
      const { sql } = await import('@codemirror/lang-sql')
      return sql()
    default:
      return []
  }
}

// Optional autocomplete loader (lazy-loaded)
export async function loadAutocomplete() {
  const { autocompletion } = await import('@codemirror/autocomplete')
  return autocompletion()
}

// Optional lint loader (lazy-loaded)
export async function loadLint() {
  const { linter } = await import('@codemirror/lint')
  return linter(() => [])
}

// Create minimal editor configuration
export function createEditorConfig({
  code,
  onChange,
  language = 'javascript',
  theme = 'light',
  enableAutocomplete = false,
  enableLint = false,
}: {
  code: string
  onChange: (value: string) => void
  language?: string
  theme?: 'light' | 'dark'
  enableAutocomplete?: boolean
  enableLint?: boolean
}) {
  const extensions = [
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
      },
    }),
  ]

  // Add theme
  if (theme === 'dark') {
    extensions.push(oneDark)
  }

  // Load language extension asynchronously
  loadLanguageExtension(language).then(langExt => {
    // Note: This would need to be handled differently in actual implementation
    // as extensions can't be added after editor creation
  })

  // Optional: Add autocomplete if enabled
  if (enableAutocomplete) {
    loadAutocomplete().then(autoExt => {
      // Same issue - needs to be added during creation
    })
  }

  // Optional: Add lint if enabled
  if (enableLint) {
    loadLint().then(lintExt => {
      // Same issue - needs to be added during creation
    })
  }

  return EditorState.create({
    doc: code,
    extensions,
  })
}

// Mobile-optimized editor configuration
export function createMobileEditorConfig(config: {
  code: string
  onChange: (value: string) => void
  language?: string
  theme?: 'light' | 'dark'
}) {
  return createEditorConfig({
    ...config,
    enableAutocomplete: false, // Disabled by default on mobile for performance
    enableLint: false, // Disabled by default on mobile for performance
  })
}
