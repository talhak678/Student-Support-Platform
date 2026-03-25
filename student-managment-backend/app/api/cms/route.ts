import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * @description Retrieve all public website content by page.
 * @route GET /api/cms?page=home
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page');

    const contents = await db.cmsContent.findMany({
      where: page ? { page } : {},
      orderBy: { key: 'asc' },
    });

    return NextResponse.json({ data: contents });

  } catch (error) {
    console.error('[CMS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch CMS content' }, { status: 500 });
  }
}

/**
 * @description Admin: Update or create website content key-value pairs.
 * @route POST /api/cms
 */
export async function POST(req: Request) {
  try {
    const { key, value, page, label, adminId } = await req.json();

    if (!key || !value || !page || !adminId) {
      return NextResponse.json({ error: 'Missing required configuration' }, { status: 400 });
    }

    const content = await db.cmsContent.upsert({
      where: { key },
      update: {
        value,
        page,
        label,
        updatedBy: adminId,
      },
      create: {
        key,
        value,
        page,
        label,
        updatedBy: adminId,
      },
    });

    return NextResponse.json({ 
      message: 'CMS content updated successfully', 
      data: content 
    });

  } catch (error) {
    console.error('[CMS_POST_ERROR]', error);
    return NextResponse.json({ error: 'Failed to save CMS content' }, { status: 500 });
  }
}
