import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { hashPassword } from '@/lib/passwords'

export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    const users = await db.user.findMany({
      include: {
        studentProfile: true
      }
    })
    return NextResponse.json(users)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Database Error', 
      details: message,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stack: (error as any)?.stack 
    }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json()

    // Hash the password before saving
    const hashedPassword = await hashPassword(password)

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    })
    return NextResponse.json(user)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
