import { NextRequest, NextResponse } from 'next/server'

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Supported remote execution languages
const REMOTE_LANGUAGES = ['cpp', 'rust', 'go', 'java']

// Language configurations for execution
const LANGUAGE_CONFIGS: Record<string, {
  compileCommand: string
  runCommand: string
  extension: string
  timeout: number
  memoryLimit: number
}> = {
  cpp: {
    compileCommand: 'g++ -o /tmp/output {file}',
    runCommand: '/tmp/output',
    extension: '.cpp',
    timeout: 10000,
    memoryLimit: 256 * 1024 * 1024, // 256MB
  },
  rust: {
    compileCommand: 'rustc -o /tmp/output {file}',
    runCommand: '/tmp/output',
    extension: '.rs',
    timeout: 15000,
    memoryLimit: 512 * 1024 * 1024, // 512MB
  },
  go: {
    compileCommand: 'go build -o /tmp/output {file}',
    runCommand: '/tmp/output',
    extension: '.go',
    timeout: 10000,
    memoryLimit: 256 * 1024 * 1024, // 256MB
  },
  java: {
    compileCommand: 'javac {file}',
    runCommand: 'java {className}',
    extension: '.java',
    timeout: 15000,
    memoryLimit: 512 * 1024 * 1024, // 512MB
  },
}

// Rate limiting middleware
function checkRateLimit(identifier: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

// Input validation
function validateInput(code: string, language: string): { valid: boolean; error?: string } {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Invalid code input' }
  }

  if (code.length > 10000) {
    return { valid: false, error: 'Code too long (max 10,000 characters)' }
  }

  if (!REMOTE_LANGUAGES.includes(language)) {
    return { valid: false, error: `Language ${language} not supported for remote execution` }
  }

  // Basic security checks
  const dangerousPatterns = [
    /import\s+os/,
    /import\s+subprocess/,
    /exec\s*\(/,
    /eval\s*\(/,
    /system\s*\(/,
    /\.\.\/\.\./, // Path traversal
    /\/etc\//, // System file access
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      return { valid: false, error: 'Code contains potentially dangerous operations' }
    }
  }

  return { valid: true }
}

// Mock execution service (in production, this would use Docker containers or Piston API)
async function executeInSandbox(
  code: string,
  language: string,
  timeout: number
): Promise<{ output: string; error?: string }> {
  // In a real implementation, this would:
  // 1. Create a Docker container with resource limits
  // 2. Copy the code to the container
  // 3. Compile and execute the code
  // 4. Capture stdout/stderr
  // 5. Return the results

  // For this example, we'll simulate execution
  const config = LANGUAGE_CONFIGS[language]
  
  // Simulate compilation and execution
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Simulate different outputs based on language
  const mockOutputs: Record<string, string> = {
    cpp: `g++ -o /tmp/output main.cpp
/tmp/output
Hello from C++!
Program executed successfully.`,
    rust: `rustc -o /tmp/output main.rs
/tmp/output
Hello from Rust!
Program executed successfully.`,
    go: `go build -o /tmp/output main.go
/tmp/output
Hello from Go!
Program executed successfully.`,
    java: `javac Main.java
java Main
Hello from Java!
Program executed successfully.`,
  }

  return {
    output: mockOutputs[language] || 'Code executed successfully',
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, language, timeout = 10000 } = body

    // Get client identifier for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'

    // Check rate limit
    if (!checkRateLimit(clientIp, 10, 60000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    // Validate input
    const validation = validateInput(code, language)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Get language configuration
    const config = LANGUAGE_CONFIGS[language]
    if (!config) {
      return NextResponse.json(
        { error: `Language ${language} not configured` },
        { status: 400 }
      )
    }

    // Execute code in sandbox
    const result = await executeInSandbox(code, language, Math.min(timeout, config.timeout))

    // Log execution for monitoring (in production)
    console.log(`Execution completed: ${language} from ${clientIp}`)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Execution error:', error)
    return NextResponse.json(
      { error: 'Internal server error during execution' },
      { status: 500 }
    )
  }
}
