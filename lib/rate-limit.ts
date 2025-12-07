import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple in-memory rate limiter
 * For production with multiple Cloud Run instances, use Redis or Cloud Memorystore
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Configuration
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_DEFAULT = 60; // 60 requests per minute per IP
const MAX_REQUESTS_STRICT = 10; // For sensitive endpoints

/**
 * Get client IP from request headers
 */
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

/**
 * Rate limit check - returns error response if limit exceeded, null if allowed
 */
export function checkRateLimit(
  request: NextRequest,
  maxRequests: number = MAX_REQUESTS_DEFAULT
): NextResponse | null {
  const ip = getClientIP(request);
  const now = Date.now();
  const windowData = rateLimitMap.get(ip);

  // New window or expired window
  if (!windowData || now > windowData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return null; // Allow request
  }

  // Check if limit exceeded
  if (windowData.count >= maxRequests) {
    const retryAfter = Math.ceil((windowData.resetTime - now) / 1000);
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(windowData.resetTime),
        },
      }
    );
  }

  // Increment counter
  windowData.count++;
  return null; // Allow request
}

/**
 * Strict rate limit for sensitive endpoints (10 req/min)
 */
export function checkStrictRateLimit(request: NextRequest): NextResponse | null {
  return checkRateLimit(request, MAX_REQUESTS_STRICT);
}

/**
 * Cleanup old entries to prevent memory leak
 * This runs periodically in the background
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimitMap.entries()) {
      if (now > data.resetTime + WINDOW_MS) {
        rateLimitMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000); // Clean up every 5 minutes
}

