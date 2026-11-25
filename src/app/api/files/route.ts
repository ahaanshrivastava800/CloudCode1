import { NextRequest, NextResponse } from 'next/server'

// Mock database for files (in production, use a real database)
const filesDatabase = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, content, language, createdAt, updatedAt } = body

    // Validate input
    if (!name || !content || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Store file
    const file = {
      id: id || `file-${Date.now()}`,
      name,
      content,
      language,
      createdAt: createdAt || Date.now(),
      updatedAt: updatedAt || Date.now(),
    }

    filesDatabase.set(file.id, file)

    return NextResponse.json({ success: true, file })
  } catch (error) {
    console.error('Error saving file:', error)
    return NextResponse.json(
      { error: 'Failed to save file' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language')

    let files = Array.from(filesDatabase.values())

    if (language) {
      files = files.filter(file => file.language === language)
    }

    return NextResponse.json({ files })
  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    )
  }
}
