import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { adminApplicationUpdateSchema } from '@/lib/validations/admin';
import { ZodError } from 'zod';

/**
 * @description Admin: Update application status and add internal notes.
 * @route PATCH /api/admin/applications/[id]
 */
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { adminId } = body;
    const resolvedParams = await context.params;
    const id = resolvedParams.id;

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }

    const validatedData = adminApplicationUpdateSchema.parse(body);

    const application = await db.serviceApplication.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Update the application status
    const updatedApplication = await db.serviceApplication.update({
      where: { id },
      data: {
        status: validatedData.status || application.status,
        adminNotes: validatedData.adminNote ? {
          create: {
            content: validatedData.adminNote,
            adminId,
          }
        } : undefined,
      },
    });

    // Create notification for student if status changed
    if (validatedData.status && validatedData.status !== application.status) {
      await db.notification.create({
        data: {
          userId: application.userId,
          type: 'APPLICATION_UPDATE',
          title: 'Application Status Updated',
          message: `Your application status for ${application.serviceType} has been updated to ${validatedData.status}.`,
          link: `/dashboard/applications/${application.id}`,
        }
      });
    }

    return NextResponse.json({
      message: 'Application updated successfully',
      data: updatedApplication,
    });

  } catch (error: any) {
    console.error('[ADMIN_APP_PATCH_ERROR]', error);
    if (error instanceof ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.flatten().fieldErrors 
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Something went wrong while updating the application.' }, { status: 500 });
  }
}
