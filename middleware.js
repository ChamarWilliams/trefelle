import { createServerClient } from '@supabase/ssr';
import { next } from '@vercel/edge';

export const config = {
  matcher: ['/workspace'],
};

const SUPABASE_URL = 'https://kketxmprsmqjbikfgbdf.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_5WlJ1UtU7DOuLwkI2J7Kkg_zRUbgWfU';

function parseCookies(cookieHeader) {
  if (!cookieHeader) return [];
  return cookieHeader
    .split(';')
    .map((c) => c.trim())
    .filter(Boolean)
    .map((c) => {
      const idx = c.indexOf('=');
      return { name: c.slice(0, idx), value: decodeURIComponent(c.slice(idx + 1)) };
    });
}

export default async function middleware(request) {
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => parseCookies(request.headers.get('cookie')),
      // Refreshed-token cookies are re-set client-side on the next page
      // load by the browser client; middleware only needs to read here.
      setAll: () => {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', '/workspace');
    return Response.redirect(loginUrl, 307);
  }

  return next();
}
