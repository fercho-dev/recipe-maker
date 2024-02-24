import OpenAI from "openai";
import { NextResponse } from "next/server";
//import { OpenAIStream, StreamingTextResponse } from 'ai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge'

export async function POST(req) {

  const { url, img } = await req.json()

    const imageUrl = url ?? img
    // const imageCaption = caption === "" ? "¿Como puedo preparar este platillo en casa?" : caption

  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    //stream: true,
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:  "¿Dime que hay en esta imagen, se breve pero descriptivo a detalle?"
          },
          {
            type: "image_url",
            image_url: {
                url: imageUrl,
                detail: "low"
            },
          },
        ],
      },
    ],
  });
  //const stream = OpenAIStream(response)
  //return new StreamingTextResponse(stream)
  return NextResponse.json({ msg: response.choices[0] }, { status: 200 })
}
