import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * @description Submit a student support ticket.
 * @route POST /api/tickets
 */
export async function POST(req: Request) {
  try {
    const { userId, subject, message, priority } = await req.json();

    if (!userId || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ticket = await db.supportTicket.create({
      data: {
        userId,
        subject,
        message,
        priority: priority || 'NORMAL',
        status: 'OPEN',
      },
    });

    return NextResponse.json({ 
      message: 'Support ticket created successfully', 
      data: ticket 
    }, { status: 201 });

  } catch (error) {
    console.error('[TICKET_POST_ERROR]', error);
    return NextResponse.json({ error: 'Failed to create support ticket' }, { status: 500 });
  }
}

/**
 * @description Get all tickets for a specific user.
 * @route GET /api/tickets?userId=xxx
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const tickets = await db.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        replies: true,
      }
    });

    return NextResponse.json({ data: tickets });

  } catch (error) {
    console.error('[TICKET_GET_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch support tickets' }, { status: 500 });
  }
}
