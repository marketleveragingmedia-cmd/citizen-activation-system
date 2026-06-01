import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  
  // Extract subdomain from hostname
  // Examples:
  // - john.citizenactivation.com → subdomain = "john"
  // - hub.citizenactivation.com → subdomain = "hub" (main hub)
  // - citizenactivation.com → subdomain = null (root domain)
  
  const parts = hostname.split('.')
  
  // Handle localhost/dev environments
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // For local dev, look for subdomain in query param: ?subdomain=john
    const subdomain = request.nextUrl.searchParams.get('subdomain')
    if (subdomain) {
      const response = NextResponse.next()
      response.headers.set('x-subdomain', subdomain)
      response.headers.set('x-subdomain-detected', 'true')
      return response
    }
    return NextResponse.next()
  }
  
  // Production subdomain detection
  // citizenactivation.com or vercel.app domains
  if (parts.length >= 3) {
    const subdomain = parts[0]
    
    // Ignore common non-subdomain prefixes
    const ignoredSubdomains = ['www', 'api', 'cdn', 'static']
    if (ignoredSubdomains.includes(subdomain)) {
      return NextResponse.next()
    }
    
    // Main hub is not a user subdomain
    if (subdomain === 'hub') {
      return NextResponse.next()
    }
    
    // Valid subdomain detected - add to headers for API routes to access
    const response = NextResponse.next()
    response.headers.set('x-subdomain', subdomain)
    response.headers.set('x-subdomain-detected', 'true')
    return response
  }
  
  return NextResponse.next()
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)',
  ],
}
