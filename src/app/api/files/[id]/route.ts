import { NextRequest, NextResponse } from 'next/server'

// Mock database for files (in production, use a real database)
const filesDatabase = new Map<string, any>()

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!filesDatabase.has(id)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    filesDatabase.delete(id)

    return NextResponse.json({ success: true, message: 'File deleted' })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}
