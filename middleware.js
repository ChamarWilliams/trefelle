export const config = {
  matcher: ['/workspace'],
};

export default function middleware(request) {
  return Response.redirect(new URL('/login', request.url), 307);
}
