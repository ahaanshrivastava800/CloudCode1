import { NextRequest, NextResponse } from 'next/server'

// Mock database for execution logs (in production, use a real database)
const executionLogsDatabase = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileId, code, language, output, error, timestamp } = body

    // Validate input
    if (!fileId || !code || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Store execution log
    const log = {
      id: `log-${Date.now()}`,
      fileId,
      code,
      language,
      output: output || '',
      error: error || null,
      timestamp: timestamp || Date.now(),
    }

    executionLogsDatabase.set(log.id, log)

    return NextResponse.json({ success: true, log })
  } catch (error) {
    console.error('Error saving execution log:', error)
    return NextResponse.json(
      { error: 'Failed to save execution log' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')

    let logs = Array.from(executionLogsDatabase.values())

    if (fileId) {
      logs = logs.filter(log => log.fileId === fileId)
    }

    // Sort by timestamp descending
    logs.sort((a, b) => b.timestamp - a.timestamp)

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Error fetching execution logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch execution logs' },
      { status: 500 }
    )
  }
}
