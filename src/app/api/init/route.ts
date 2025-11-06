import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Create a default user if it doesn't exist
    const defaultUser = await db.user.upsert({
      where: { email: 'default@duelvault.app' },
      update: {},
      create: {
        email: 'default@duelvault.app',
        name: 'Default User'
      }
    })

    // Create a default collection if it doesn't exist
    const defaultCollection = await db.collection.upsert({
      where: {
        userId_name: {
          userId: defaultUser.id,
          name: 'My Collection'
        }
      },
      update: {},
      create: {
        name: 'My Collection',
        description: 'Default collection for your cards',
        userId: defaultUser.id
      }
    })

    return Response.json({
      success: true,
      user: defaultUser,
      collection: defaultCollection,
      message: 'Database initialized successfully'
    })

  } catch (error) {
    console.error('Database initialization error:', error)
    return Response.json(
      { success: false, error: 'Failed to initialize database' },
      { status: 500 }
    )
  }
}