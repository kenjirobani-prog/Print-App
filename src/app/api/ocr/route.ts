import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Cloud Vision API key is not configured" },
      { status: 500 }
    );
  }

  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Remove data URL prefix if present
    const base64Image = image.replace(/^data:image\/\w+;base64,/, "");

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Image },
              features: [{ type: "TEXT_DETECTION", maxResults: 1 }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Vision API error:", errorText);
      return NextResponse.json(
        { error: "OCR request failed" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text =
      data.responses?.[0]?.textAnnotations?.[0]?.description || "";

    return NextResponse.json({ text: text.trim() });
  } catch (error) {
    console.error("OCR error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
