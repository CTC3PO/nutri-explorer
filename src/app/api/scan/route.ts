import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        productName: { type: SchemaType.STRING },
        brand: { type: SchemaType.STRING },
        energy: { type: SchemaType.NUMBER },
        sugars: { type: SchemaType.NUMBER },
        saturatedFat: { type: SchemaType.NUMBER },
        sodium: { type: SchemaType.NUMBER },
        fiber: { type: SchemaType.NUMBER },
        protein: { type: SchemaType.NUMBER },
        fruitVegetablesPercentage: { type: SchemaType.NUMBER },
      },
      required: ["productName", "energy", "sugars", "saturatedFat", "sodium"],
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const buffer = await image.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");

    const prompt = `
      Extract nutritional information from this food label image.
      If a field is not found or visible, return null or 0.
      Ensure energy is in kJ per 100g, and other macros are in g per 100g (sodium in mg).
      Estimate fruitVegetablesPercentage 0-100 if possible.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // With responseMimeType set to application/json, the text is guaranteed
    // to be a parsable JSON string adhering to the schema.
    const extraction = JSON.parse(text);
    return NextResponse.json(extraction);

  } catch (error: unknown) {
    console.error("Scan API Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to process image";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
