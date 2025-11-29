import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * CORS headers helper
 * Adds proper CORS headers to API responses
 */
export function corsHeaders(origin?: string | null) {
  // Allow all origins in production (or specific origins)
  // For Cloud Run, we allow all origins since it's a public API
  const allowedOrigins = [
    'https://khair-backend-autodeploy-1033808631898.europe-west1.run.app',
    'http://localhost:3000',
    'http://localhost:8080',
  ];

  // Check if origin is allowed, or allow all in production
  const isAllowedOrigin = !origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'production';

  return {
    'Access-Control-Allow-Origin': isAllowedOrigin && origin ? origin : '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Handle OPTIONS preflight request
 */
export function handleOptions(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(origin),
  });
}

/**
 * Wrap API response with CORS headers
 */
export function withCors(response: NextResponse, request: NextRequest) {
  const origin = request.headers.get('origin');
  const headers = corsHeaders(origin);
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

