import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//export const runtime = 'edge'

export async function POST(req) {

  const { url, img, caption } = await req.json()

    const imageUrl = url ?? img
    let imageCaption = ""
    if(caption) {
        imageCaption = caption
    } else {
        imageCaption = "¿Como puedo preparar este platillo en casa?"
    }

  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: imageCaption },
          {
            type: "image_url",
            image_url: imageUrl,
          },
        ],
      },
    ],
  });
  return NextResponse.json({ msg: response.choices[0] }, { status: 200 })
}
