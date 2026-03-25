import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

import { onboardingSchema } from '@/lib/validations/onboarding';
import { ZodError } from 'zod';

/**
 * @description Submit or update student onboarding profile details.
 * @route POST /api/onboarding
 * TODO: Integrate auth session to get current logged-in userId
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Placeholder - In production, this would come from the auth session (NextAuth)
    const { userId } = body; 

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user exists and is a STUDENT
    const user = await db.user.findFirst({
      where: {
        id: userId,
        role: 'STUDENT',
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    // Validate the onboarding form data
    const validatedData = onboardingSchema.parse(body);

    // Upsert the student profile (Create if doesn't exist, Update if it does)
    const profile = await db.studentProfile.upsert({
      where: {
        userId: userId,
      },
      update: {
        phone: validatedData.phone,
        whatsapp: validatedData.whatsapp,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
        nationality: validatedData.nationality,
        city: validatedData.city,
        ukPostalCode: validatedData.ukPostalCode,
        ukAddress: validatedData.ukAddress,
        highestQualification: validatedData.highestQualification,
        fieldOfStudy: validatedData.fieldOfStudy,
        university: validatedData.university,
        graduationYear: validatedData.graduationYear,
        visaStatus: validatedData.visaStatus,
        visaExpiryDate: validatedData.visaExpiryDate ? new Date(validatedData.visaExpiryDate) : null,
        workEligibility: validatedData.workEligibility,
        hoursAllowedPerWeek: validatedData.hoursAllowedPerWeek,
        preferredJobTitles: validatedData.preferredJobTitles,
        preferredLocations: validatedData.preferredLocations,
        availableFrom: validatedData.availableFrom ? new Date(validatedData.availableFrom) : null,
        cvSummary: validatedData.cvSummary,
        accommodationNeeded: validatedData.accommodationNeeded,
        onboardingCompleted: true, // Mark as completed
        onboardingStep: 5, // Last step
      },
      create: {
        userId: userId,
        phone: validatedData.phone,
        whatsapp: validatedData.whatsapp,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
        nationality: validatedData.nationality,
        city: validatedData.city,
        ukPostalCode: validatedData.ukPostalCode,
        ukAddress: validatedData.ukAddress,
        highestQualification: validatedData.highestQualification,
        fieldOfStudy: validatedData.fieldOfStudy,
        university: validatedData.university,
        graduationYear: validatedData.graduationYear,
        visaStatus: validatedData.visaStatus,
        visaExpiryDate: validatedData.visaExpiryDate ? new Date(validatedData.visaExpiryDate) : null,
        workEligibility: validatedData.workEligibility,
        hoursAllowedPerWeek: validatedData.hoursAllowedPerWeek,
        preferredJobTitles: validatedData.preferredJobTitles,
        preferredLocations: validatedData.preferredLocations,
        availableFrom: validatedData.availableFrom ? new Date(validatedData.availableFrom) : null,
        cvSummary: validatedData.cvSummary,
        accommodationNeeded: validatedData.accommodationNeeded,
        onboardingCompleted: true,
        onboardingStep: 5,
      },
    });

    return NextResponse.json({
      message: 'Onboarding profile updated successfully',
      data: profile,
    });

  } catch (error) {
    console.error('[ONBOARDING_POST_ERROR]', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (error instanceof ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.flatten().fieldErrors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Something went wrong while saving onboarding data.',
      details: errorMessage
    }, { status: 500 });
  }
}

/**
 * @description Retrieve student profiles for current logged-in user.
 * @route GET /api/onboarding
 * TODO: Integrate auth session
 */
export async function GET(req: Request) {
  try {
     // For testing purposes, we might pass userId as query param until NextAuth is ready
     const { searchParams } = new URL(req.url);
     const userId = searchParams.get('userId');

     if(!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

     const profile = await db.studentProfile.findUnique({
       where: { userId },
       include: {
         user: {
           select: { id: true, name: true, email: true, role: true }
         }
       }
     });

     if(!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

     return NextResponse.json({ data: profile });

  } catch (error) {
    console.error('[ONBOARDING_GET_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch onboarding profile' }, { status: 500 });
  }
}
