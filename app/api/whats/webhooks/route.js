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
    //return NextResponse.json(challenge);
    return new NextResponse(challenge, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } else {
    return NextResponse.json({ message: `Invalid Token` }, { status: 400 })
  }
}

export async function POST(req) {
  const body = await req.json();

  if(
    body.entry &&
    body.entry[0].changes &&
    body.entry[0].changes[0].value.messages &&
    body.entry[0].changes[0].value.messages[0]
  ) {
    let phon_no_id = body.entry[0].changes[0].value.metadata.phone_number_id;
    let from = body.entry[0].changes[0].value.messages[0].from;
    //let msg_body = body.entry[0].changes[0].value.messages[0].text.body;

    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${phon_no_id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATS_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: {
          messaging_product: 'whatsapp',
          to: from,
          text: {
            body: "Hello, I am a bot!"
          }
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      return NextResponse.json({ success: false }, { status: 400 })
    }

  } else {
    return NextResponse.json({ message: `Invalid Request` }, { status: 404 })
  }
}
