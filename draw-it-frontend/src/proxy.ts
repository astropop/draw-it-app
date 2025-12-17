import { NextRequest, NextResponse } from "next/server";

/**
 * redirect to spectate game if no player session id
 */
export default function proxy(request: NextRequest) {
  const playerSessionId = request.cookies.get("playerSessionId")?.value;

  // users access game room without session, redirect to spectate
  if (!playerSessionId && request.nextUrl.pathname.startsWith("/game")) {
    const gameCode = request.nextUrl.pathname.split("/")[2];
    const spectateUrl = new URL(`/spectate/${gameCode}`, request.url);
    return NextResponse.redirect(spectateUrl);
  }

  return NextResponse.next();
}

// only for /game paths
export const config = {
  matcher: ["/game/:path*"],
};
