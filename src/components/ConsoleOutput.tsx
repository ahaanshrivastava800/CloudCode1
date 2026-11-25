'use client'

interface ConsoleOutputProps {
  output: string
  className?: string
}

export default function ConsoleOutput({ output, className = '' }: ConsoleOutputProps) {
  const isError = output.toLowerCase().includes('error') || output.toLowerCase().includes('failed')
  const isSuccess = output.toLowerCase().includes('success') || output.toLowerCase().includes('completed')

  return (
    <div
      className={`
        console-output
        ${isError ? 'error' : ''}
        ${isSuccess ? 'success' : ''}
        ${className}
      `}
    >
      {output || 'No output yet. Run your code to see results.'}
    </div>
  )
}
