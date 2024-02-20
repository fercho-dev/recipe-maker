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
    !body.entry[0].changes[0].value.statuses &&
    body.entry[0].changes[0].value.messages &&
    body.entry[0].changes[0].value.messages[0]
  ) {
    let phon_no_id = body.entry[0].changes[0].value.metadata.phone_number_id;
    let from = body.entry[0].changes[0].value.messages[0].from;

    if (body.entry[0].changes[0].value.messages[0].type === 'text') {
      //let msg_body = body.entry[0].changes[0].value.messages[0].text.body;
      try {
        const response = await fetch(`https://graph.facebook.com/v19.0/${phon_no_id}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.WHATS_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: from,
            text: {
              body: "Hello, I am a bot!"
            }
          })
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        return NextResponse.json(null, { status: 200 })
      } catch (error) {
        return NextResponse.json({ success: false }, { status: 400 })
      }

    } else if (body.entry[0].changes[0].value.messages[0].type === 'image') {
      try {
        let img_id = body.entry[0].changes[0].value.messages[0].image.id;
        console.log(img_id);

        const response_id = await fetch(`https://graph.facebook.com/v19.0/${img_id}`, {
          headers: {
            'Authorization': `Bearer ${process.env.WHATS_API_TOKEN}`,
          },
        })
        
        if (!response_id.ok) {
          throw new Error(`HTTP error! status: ${response_id.status}`);
        }

        const data = await response_id.json();
        const img_url = data.url;

        console.log(img_url);

        const response_img = await fetch(`${img_url}`, {
          headers: {
            'Authorization': `Bearer ${process.env.WHATS_API_TOKEN}`,
          },
        })

        if (!response_img.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const arrBuffer = await response_img.arrayBuffer()
        const buffer = Buffer.from(arrBuffer)
        const img_data = buffer.toString('base64')

        console.log(img_data)
        console.log(`Tamaño del buffer: ${buffer.length} bytes`);
        console.log(`Longitud de la cadena Base64: ${img_data.length} caracteres`);


        const response_vision = await fetch(`${process.env.DEPLOY_URL}/api/visionnostream`, {
          method: 'POST',
          body: JSON.stringify({ img: `data:image/jpeg;base64,${img_data}` }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response_vision.ok) {
          throw new Error(`Error in response: ${response.status}`);
        }

        console.log("no error in response vision");

        let textResponse = "";
        const reader = response_vision.body.getReader();
        let { done, value } = await reader.read();
        while (!done) {
          textResponse += new TextDecoder("utf-8").decode(value);
          ({ done, value } = await reader.read());
        }

        console.log("textResponse: ", textResponse);

        const response = await fetch(`https://graph.facebook.com/v19.0/${phon_no_id}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.WHATS_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: from,
            text: {
              body: `${textResponse}`
            }
          })
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        return NextResponse.json(null, { status: 200 })
      } catch (error) {
        return NextResponse.json({ success: false }, { status: 404 })
      }

    } else {
      return NextResponse.json({ message: `Invalid Type` }, { status: 404 })
    }
    

  } else {
    return NextResponse.json({ message: `Invalid Request - no text` }, { status: 404 })
  }
}
