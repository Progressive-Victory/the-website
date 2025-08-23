import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Redirects all requests to blog to the homepage.
 *
 * This middleware is used on the live site to prevent access to the blog
 * before it is ready.
 *
 * @param {NextRequest} request
 * @returns {NextResponse}
 */
export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL('/', request.url))
}


export const config = {
  matcher: '/pathnotcurrentlyinuse/:path*',
}
