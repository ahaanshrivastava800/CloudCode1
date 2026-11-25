import { NextRequest, NextResponse } from 'next/server'

// Mock database for projects (in production, use a real database)
const projectsDatabase = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, fileIds, createdAt, updatedAt } = body

    // Validate input
    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      )
    }

    // Store project
    const project = {
      id: id || `project-${Date.now()}`,
      name,
      description: description || '',
      fileIds: fileIds || [],
      createdAt: createdAt || Date.now(),
      updatedAt: updatedAt || Date.now(),
    }

    projectsDatabase.set(project.id, project)

    return NextResponse.json({ success: true, project })
  } catch (error) {
    console.error('Error saving project:', error)
    return NextResponse.json(
      { error: 'Failed to save project' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const projects = Array.from(projectsDatabase.values())

    // Sort by updatedAt descending
    projects.sort((a, b) => b.updatedAt - a.updatedAt)

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}
