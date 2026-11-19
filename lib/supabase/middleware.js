import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Authenticate user securely
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. Proteksi Akses Studio Admin (/admin/*)
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    const role = user.user_metadata?.role || "CLIENT";
    if (role !== "ADMIN") {
      // Klien biasa dilarang mengakses panel admin studio
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // 2. Proteksi Halaman Dashboard Klien (/dashboard/*)
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // 3. Auto-redirect jika sudah login dan mengunjungi halaman auth (/login atau /register)
  if (pathname === "/login" || pathname === "/register") {
    if (user) {
      const role = user.user_metadata?.role || "CLIENT";
      const url = request.nextUrl.clone();
      url.pathname = role === "ADMIN" ? "/admin/dashboard" : "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
