import { NextResponse } from "next/server";
import crossFetch from "cross-fetch";

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
        // let img_caption = body.entry[0].changes[0].value.messages[0].image.caption || null;
        console.log("mimetype", body.entry[0].changes[0].value.messages[0].image.mime_type)
        console.log("image", body.entry[0].changes[0].value.messages[0].image)

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

        // cross-fetch
        const response_url = await crossFetch(img_url, {
        headers: {
            Authorization: `Bearer ${process.env.WHATS_API_TOKEN}`,
            "User-Agent": "node"
        }
        });

        if (!response_url.ok) {
            throw new Error(`HTTP error! status: ${response_url.status}`);
        }

        const buffer = await response_url.buffer();
        const base64Data = buffer.toString('base64');

        console.log("base64 img", base64Data.slice(0,20))

        // const response_prev = await fetch(`https://graph.facebook.com/v19.0/${phon_no_id}/messages`, {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${process.env.WHATS_API_TOKEN}`,
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify({
        //     messaging_product: 'whatsapp',
        //     to: from,
        //     text: {
        //       body: "Procesando imagen..."
        //     }
        //   })
        // });
    
        // if (!response_prev.ok) {
        //   throw new Error(`HTTP error! status: ${response.status}`);
        // }

        const resVision = await fetch(`${process.env.DEPLOY_URL}/api/vision`, {
            method: 'POST',
            body: JSON.stringify({
                img: `data:image/jpeg;base64,${base64Data}`,
                // caption: img_caption === null ? "" : img_caption
            }),
            headers: {
            'Content-Type': 'application/json',
            },
        })

        if (!resVision.ok) {
            throw new Error(`Error in response: ${resVision.status}`);
        }

        let visionText = "";
        const reader = resVision.body.getReader();
        let { done, value } = await reader.read();
        while (!done) {
            visionText += new TextDecoder("utf-8").decode(value);
            ({ done, value } = await reader.read());
        }

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
              body: `${visionText}`
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
