import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//export const runtime = 'edge'

export async function POST(req) {

  const { url, img } = await req.json()

    const imageUrl = url ?? img
    // const imageCaption = caption === "" ? "¿Como puedo preparar este platillo en casa?" : caption

  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:  "¿Como puedo preparar este platillo en casa?"
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
  return NextResponse.json({ msg: response.choices[0] }, { status: 200 })
}
