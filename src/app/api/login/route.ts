import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();
  if (!idToken) {
    return NextResponse.json({ error: "No token" }, { status: 400 });
  }
  // httpOnly, secure, sameSiteでセット
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: "token",
    value: idToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
  return res;
}
