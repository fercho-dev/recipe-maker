import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from 'ai'

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
  const stream = OpenAIStream(response)
	return new StreamingTextResponse(stream)
}
