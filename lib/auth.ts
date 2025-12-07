import { NextRequest, NextResponse } from 'next/server';

/**
 * Authentication utilities for protecting API routes
 */

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SEED_SECRET = process.env.SEED_SECRET_TOKEN;

/**
 * Check if admin authentication is configured
 */
export function isAdminAuthConfigured(): boolean {
  return !!ADMIN_PASSWORD;
}

/**
 * Require admin authentication for protected routes
 * Uses HTTP Basic Auth
 * 
 * Returns null if authenticated, or an error response if not
 */
export function requireAdminAuth(request: NextRequest): NextResponse | null {
  // In development without password set, allow access with warning
  if (!ADMIN_PASSWORD) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ ADMIN_PASSWORD not set - admin routes unprotected in development');
      return null;
    }
    // In production, deny access if not configured
    return NextResponse.json(
      { error: 'Admin authentication not configured' },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get('Authorization');

  // No auth header
  if (!authHeader) {
    return NextResponse.json(
      { error: 'Authentication required' },
      {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
      }
    );
  }

  // Check for Basic auth
  if (!authHeader.startsWith('Basic ')) {
    return NextResponse.json(
      { error: 'Invalid authentication method. Use Basic auth.' },
      { status: 401 }
    );
  }

  // Decode and verify credentials
  try {
    const base64Credentials = authHeader.slice(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return null; // Authenticated successfully
    }
  } catch {
    // Invalid base64 or format
  }

  return NextResponse.json(
    { error: 'Invalid credentials' },
    {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
    }
  );
}

/**
 * Require seed secret token for database seeding operations
 * Uses Bearer token auth
 */
export function requireSeedAuth(request: NextRequest): NextResponse | null {
  if (!SEED_SECRET) {
    return NextResponse.json(
      {
        error: 'Seed endpoint disabled',
        message: 'SEED_SECRET_TOKEN environment variable not configured',
      },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get('Authorization');
  const providedToken = authHeader?.replace('Bearer ', '');

  if (!providedToken || providedToken !== SEED_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized - invalid or missing seed token' },
      { status: 401 }
    );
  }

  return null; // Authorized
}

/**
 * Simple API key authentication for external services
 */
export function requireApiKey(request: NextRequest): NextResponse | null {
  const apiKey = process.env.API_SECRET_KEY;
  
  if (!apiKey) {
    return null; // No API key configured, allow access
  }

  const providedKey = request.headers.get('X-API-Key');
  
  if (!providedKey || providedKey !== apiKey) {
    return NextResponse.json(
      { error: 'Invalid or missing API key' },
      { status: 401 }
    );
  }

  return null; // Valid API key
}

