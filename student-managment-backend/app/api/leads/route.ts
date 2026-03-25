import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { leadSchema } from '@/lib/validations/lead';
import { ZodError } from 'zod';

/**
 * @description Capture potential leads from the public website's contact form.
 * @route POST /api/leads
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = leadSchema.parse(body);

    // Create the lead in the database
    const lead = await db.lead.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        whatsapp: validatedData.whatsapp,
        city: validatedData.city,
        interestedService: validatedData.interestedService,
        message: validatedData.message,
        status: 'NEW', // Default status for new leads
        source: 'website',
      },
    });

    return NextResponse.json({
      message: 'Lead captured successfully',
      data: lead,
    }, { status: 201 });

  } catch (error) {
    console.error('[LEAD_POST_ERROR]', error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (error instanceof ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.flatten().fieldErrors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Something went wrong while capturing the lead.' 
    }, { status: 500 });
  }
}

/**
 * @description Get all leads for the admin dashboard.
 * @route GET /api/leads
 * TODO: Add Auth protection (Admin/Super Admin only)
 */
export async function GET() {
  try {
    const leads = await db.lead.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      data: leads,
    });
  } catch (error) {
    console.error('[LEAD_GET_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}
