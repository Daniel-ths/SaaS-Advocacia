import { NextRequest, NextResponse } from "next/server";
import { openrouter } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const completion = await openrouter.chat.completions.create({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      resposta: completion.choices[0].message.content,
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}