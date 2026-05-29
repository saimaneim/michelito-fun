import { type NextRequest, NextResponse } from "next/server";
import { generateDiscordGif } from "@/src/lib/generate";

export async function POST(req: NextRequest) {
  try {
    const { text, username, roleColor, timestamp } = await req.json();

    if (!text || text.trim() === "") {
      return NextResponse.json(
        { error: "El texto no puede estar vacío" },
        { status: 400 },
      );
    }

    const gifBuffer = await generateDiscordGif({
      text: text.trim(),
      username: username || "Michelito",
      roleColor: roleColor || "#2ECC71",
      timestamp: timestamp,
    });

    return new NextResponse(gifBuffer as any, {
      headers: {
        "Content-Type": "image/gif",
        "Content-Disposition": `attachment; filename="michelito.gif"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Error generando el GIF" },
      { status: 500 },
    );
  }
}
