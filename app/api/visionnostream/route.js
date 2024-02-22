import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//export const runtime = 'edge'

export async function POST(req) {

  const { url, img } = await req.json()

	const imageUrl = url ?? img

  console.log('length base64 vision', imageUrl.length)
  console.log('base64 text vision', imageUrl.slice(0,20))

  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "What’s in this image?" },
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
