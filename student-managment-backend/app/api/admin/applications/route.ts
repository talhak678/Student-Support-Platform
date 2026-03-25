import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * @description Admin: Get all service applications across the platform.
 * @route GET /api/admin/applications
 */
export async function GET() {
  try {
    const applications = await db.serviceApplication.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        accommodationRequest: true,
        adminNotes: {
            orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: applications });

  } catch (error) {
    console.error('[ADMIN_GET_APPS_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch all applications' }, { status: 500 });
  }
}
