import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl

  // ── Detectar subdominio ──────────────────────────────────
  // En producción: laspalmas.hogarapp.cl → slug = "laspalmas"
  // En localhost:  localhost:3000?building=laspalmas (para dev)
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'hogarapp.cl'
  const isProduction = hostname.endsWith(appDomain)
  
  let buildingSlug: string | null = null

  if (isProduction) {
    const subdomain = hostname.replace(`.${appDomain}`, '')
    if (subdomain && subdomain !== 'www' && subdomain !== 'admin' && subdomain !== 'app') {
      buildingSlug = subdomain
    }
  } else {
    // Desarrollo local: usar query param ?building=laspalmas
    buildingSlug = request.nextUrl.searchParams.get('building')
  }

  // Crear respuesta con headers del building para el resto de la app
  const response = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(request.headers),
        'x-building-slug': buildingSlug || '',
        'x-hostname': hostname,
      }),
    },
  })

  // ── Supabase auth ────────────────────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Rutas protegidas
  const protectedRoutes = ['/dashboard', '/admin']
  const isProtected = protectedRoutes.some(r => pathname.startsWith(r))

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Si ya está logueado y va al login → redirigir al dashboard
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
