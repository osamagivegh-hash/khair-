import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function GET() {
    try {
        // 1. Configure Cloudinary
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
        const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
        const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

        if (!cloudName || !apiKey || !apiSecret) {
            return NextResponse.json({
                success: false,
                error: 'Missing credentials',
                details: {
                    hasCloudName: !!cloudName,
                    hasApiKey: !!apiKey,
                    hasApiSecret: !!apiSecret
                }
            }, { status: 500 });
        }

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true,
        });

        // 2. Try to upload a simple base64 image (1x1 red pixel)
        const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

        console.log('Attempting debug upload...');

        const result = await cloudinary.uploader.upload(base64Image, {
            folder: 'debug-test',
            resource_type: 'image'
        });

        return NextResponse.json({
            success: true,
            message: 'Debug upload successful!',
            url: result.secure_url,
            config: {
                cloudName,
                apiKey: apiKey.substring(0, 3) + '***'
            }
        });

    } catch (error: any) {
        console.error('Debug upload failed:', error);
        return NextResponse.json({
            success: false,
            error: 'Debug upload failed',
            message: error.message || String(error),
            http_code: error.http_code,
            name: error.name,
            fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
        }, { status: 500 });
    }
}
