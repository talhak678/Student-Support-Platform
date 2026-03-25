import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET() {
  try {
    const users = await db.user.findMany({
      include: {
        studentProfile: true
      }
    })
    return NextResponse.json(users)
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json()
    const user = await db.user.create({
      data: {
        name,
        email,
        password, // Reminder: Hash this in real implementation
        role
      }
    })
    return NextResponse.json(user)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
