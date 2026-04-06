// import { NextResponse } from "next/server";

// export function middleware(request) {
//   const token = request.cookies.get("accessToken")?.value;
//   const { pathname } = request.nextUrl;

//   // Protected routes — must have accessToken cookie
//   if (pathname.startsWith("/dashboard")) {
//     if (!token) {
//       return NextResponse.redirect(new URL("/login", request.url));
//     }
//   }

//   // If user has token and visits login/register, send them to dashboard
//   if ((pathname === "/login" || pathname === "/register") && token) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/dashboard/:path*", "/login", "/register"],
// };
import { NextResponse } from "next/server";

export function middleware(request) {
  const accesstoken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const { pathname } = request.nextUrl;

  let authenticated =true

  if(!accesstoken && !refreshToken){
    authenticated=false
  }

  // Protected routes — must have accessToken cookie
  if (pathname.startsWith("/dashboard")) {
    if (!authenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // If user has token and visits login/register, send them to dashboard
  if ((pathname === "/login" || pathname === "/register") && authenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};