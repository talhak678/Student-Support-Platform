import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { applicationSchema } from '@/lib/validations/application';
import { ZodError } from 'zod';

/**
 * @description Submit a new application for a service (CV Strategy, Job Placement, Accommodation etc.).
 * @route POST /api/applications
 * TODO: Use NextAuth for currentUser session
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body; 

    if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

    const validatedData = applicationSchema.parse(body);

    // Check if the user is a STUDENT
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Permission denied. Only students can apply.' }, { status: 403 });
    }

    // Create the service application
    const application = await db.serviceApplication.create({
      data: {
        userId,
        serviceType: validatedData.serviceType,
        details: validatedData.details,
        status: 'SUBMITTED',
        // If it's accommodation booking, create empty accommodation request linked
        accommodationRequest: validatedData.serviceType === 'ACCOMMODATION_BOOKING' ? {
          create: {
            preferredCity: validatedData.accommodationDetails?.preferredCity,
            budgetMax: validatedData.accommodationDetails?.budgetMax,
            moveInDate: validatedData.accommodationDetails?.moveInDate ? new Date(validatedData.accommodationDetails.moveInDate) : null,
          }
        } : undefined,
      },
      include: {
        accommodationRequest: true,
      }
    });

    // Create notification for student
    await db.notification.create({
      data: {
        userId,
        type: 'APPLICATION_UPDATE',
        title: 'Application Received',
        message: `Your application for ${validatedData.serviceType} has been successfully submitted.`,
        link: `/dashboard/applications/${application.id}`,
      }
    });

    return NextResponse.json({
      message: 'Application submitted successfully',
      data: application,
    }, { status: 201 });

  } catch (error) {
    console.error('[APPLICATION_POST_ERROR]', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (error instanceof ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.flatten().fieldErrors 
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Something went wrong while submitting the application.' }, { status: 500 });
  }
}

/**
 * @description Get all applications for the current student.
 * @route GET /api/applications
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

    const applications = await db.serviceApplication.findMany({
      where: { userId },
      include: {
        accommodationRequest: true,
        adminNotes: {
          select: { id: true, content: false, createdAt: true } // Don't expose content to students
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      data: applications,
    });

  } catch (error) {
    console.error('[APPLICATION_GET_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}
