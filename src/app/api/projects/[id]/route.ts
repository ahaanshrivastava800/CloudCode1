import { NextRequest, NextResponse } from 'next/server'

// Mock database for projects (in production, use a real database)
const projectsDatabase = new Map<string, any>()

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!projectsDatabase.has(id)) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    projectsDatabase.delete(id)

    return NextResponse.json({ success: true, message: 'Project deleted' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
