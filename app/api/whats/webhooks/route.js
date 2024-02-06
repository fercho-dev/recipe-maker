import { NextResponse } from "next/server";

export async function GET(request) {
  const token = process.env.VERIFICATION_TOKEN;

  const mode = request.nextUrl.searchParams.get('hub.mode') || null;
  const challenge = request.nextUrl.searchParams.get('hub.challenge') || null;
  const reqToken = request.nextUrl.searchParams.get('hub.verify_token') || null;

  if (
    mode === 'subscribe' &&
    reqToken === token
  ) {
    return NextResponse.json(challenge);
  } else {
    return NextResponse.json({ message: `Invalid Token` }, { status: 400 })
  }
}
