import OpenAI from "openai";
import { NextResponse } from "next/server";
//import { OpenAIStream, StreamingTextResponse } from 'ai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge'

export async function POST(req) {

  const { text } = await req.json()

    //const request = text ?? `¿como puedo preparar el platillo que se describe a continuacion?`
    // const imageCaption = caption === "" ? "¿Como puedo preparar este platillo en casa?" : caption

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    //stream: true,
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `¿como puedo preparar el platillo que se describe a continuacion? ${text}`
          },
        ],
      },
    ],
  });
  //const stream = OpenAIStream(response)
  //return new StreamingTextResponse(stream)
  return NextResponse.json({ msg: response.choices[0] }, { status: 200 })
}
