import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Test Connection
        await prisma.$connect();

        // 2. Try to count users (or any model)
        const slideCount = await prisma.slide.count();

        // 3. Try to create a dummy record (and delete it)
        const testSlide = await prisma.slide.create({
            data: {
                title: 'Test DB Connection',
                subtitle: 'Testing...',
                imageUrl: 'https://example.com/test.jpg',
                order: 999
            }
        });

        // 4. Delete the test record
        await prisma.slide.delete({
            where: { id: testSlide.id }
        });

        return NextResponse.json({
            success: true,
            message: 'Database connection working!',
            slideCount,
            testRecordId: testSlide.id
        });

    } catch (error: any) {
        console.error('Database test failed:', error);
        return NextResponse.json({
            success: false,
            error: 'Database connection failed',
            message: error.message,
            code: error.code,
            meta: error.meta,
            name: error.name
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
