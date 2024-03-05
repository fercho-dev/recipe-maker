import OpenAI from "openai";
//import { OpenAIStream, StreamingTextResponse } from 'ai'
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge'

export async function POST(req) {

  const { url, img } = await req.json()

	const imageUrl = url ?? img

  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    stream: true,
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "que hay en la imagen" },
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
  //const stream = OpenAIStream(response)
	//return new StreamingTextResponse(stream)
}
