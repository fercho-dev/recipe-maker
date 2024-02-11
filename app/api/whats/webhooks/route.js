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

async function sendMessage(to, text) {
  const url = `https://graph.facebook.com/v13.0/${process.env.PHONE_NUMBER_ID}/messages`;
  const data = {
    messaging_product: "whatsapp",
    to: to,
    type: "text",
    text: { body: text },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer your_access_token`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json(); // Devuelve la respuesta de la API de WhatsApp
}

export async function POST(req) {
  const data = await req.json();
  const { entry } = data;
    if (entry && entry[0].changes && entry[0].changes[0].value.messages) {
      const messageData = entry[0].changes[0].value.messages[0];
      const from = messageData.from; // Número de teléfono del remitente
      //const messageId = messageData.id; // ID del mensaje recibido
      let textReceived = "";

      // Asumiendo que es un mensaje de texto. Adaptar según sea necesario para otros tipos de mensajes.
      if (messageData.type === "text") {
        textReceived = messageData.text.body;
      }


      // Envía una respuesta automática
      const responseText = "Gracias por tu mensaje. Esto es una respuesta automática.";

      try {
        const sendMessageResponse = await sendMessage(from, responseText);
        return NextResponse.json({ success: true }, { status: 200 })
      } catch (error) {
        return NextResponse.json({ error: "Error al enviar mensaje" }, { status: 500 })
      }
    } else {
      // No es un mensaje válido o no es lo que esperábamos
      return NextResponse.json({ error: "Petición no válida" }, { status: 400 })
    }
}
