import { NextResponse } from "next/server";
const { verifyWebhook } = require('whatsapp-cloud-api');

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
  const data = await req.json();
  const client = new Client({ credentials: process.env.WHATSAPP_CLOUD_API_CREDENTIALS });
  const isValidToken = verifyWebhook(req.headers['x-hub-signature'], req.body);

  if (!isValidToken) {
    return NextResponse.json({ message: 'Invalid Token' }, { status: 401 });
  }

  if(data.entry.changes.field === 'messages') {
    const message = {
      "messaging_product": "whatsapp",
      "recipient_type": "individual",
      "to": data.entry[0].changes[0].value.phone_number,
      "text": {
        "body": "Hola! Este es un mensaje automático."
      }
    };

    const response = await client.sendMessage(message);

    if (response.status === 200) {
      console.log('Respuesta enviada correctamente');
    } else {
      console.log('Error al enviar la respuesta:', response.statusText);
    }
  }

  return new Response("OK");
}
