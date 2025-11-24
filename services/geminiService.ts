import { GoogleGenAI } from "@google/genai";
import type { ImageFile, Language, AssetMap, AssetType } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper to find the closest supported aspect ratio for Gemini.
 */
function getClosestAspectRatio(width: number, height: number): string {
  const targetRatio = width / height;
  const supportedRatios = [
    { str: "1:1", val: 1 },
    { str: "3:4", val: 3/4 },
    { str: "4:3", val: 4/3 },
    { str: "9:16", val: 9/16 },
    { str: "16:9", val: 16/9 },
  ];
  
  return supportedRatios.reduce((prev, curr) => 
    Math.abs(curr.val - targetRatio) < Math.abs(prev.val - targetRatio) ? curr : prev
  ).str;
}

/**
 * Analyzes multiple asset images to create a unified descriptive prompt.
 * @param assets Dictionary of asset images (excluding face).
 * @param lang Language for the output.
 */
export async function analyzeAssets(assets: AssetMap, lang: Language): Promise<string> {
  const model = 'gemini-2.5-flash';
  
  const languageInstruction = lang === 'ru' 
    ? "Output the final detailed description strictly in Russian." 
    : "Output the final detailed description in English.";

  // Build the multimodal request
  const parts: any[] = [];
  
  parts.push({ 
    text: `
      You are an expert visual director. Your task is to analyze the provided reference images and combine them into a SINGLE, cohesive visual description for a generative AI model.
      
      I will provide images labeled by their category (e.g., Clothing, Shoes, Style, Hairstyle).
      You must merge these elements into a scene description.
      
      **Directives:**
      1. If 'Style/Background' is provided, use it for the environment, lighting, and camera angle.
      2. If 'Clothing' or 'Shoes' are provided, describe them in detail as being worn by the main subject.
      3. If 'Hairstyle' is provided, apply it to the subject.
      4. If 'Accessories' are provided, include them naturally.
      5. Resolve any conflicts artistically (e.g., if Style implies winter but Clothing is summer, prioritize the Clothing for the subject but adapt the Style slightly or note the contrast).
      
      ${languageInstruction}

      **Output Format:**
      Return ONLY the descriptive paragraph. Do not add intro/outro text.
    ` 
  });

  // Helper to append image parts with labels
  const addPart = (type: AssetType, label: string) => {
    const img = assets[type];
    if (img) {
      parts.push({ text: `\n[REFERENCE IMAGE: ${label}]` });
      parts.push({ inlineData: { data: img.data, mimeType: img.mimeType } });
    }
  };

  addPart('style', 'TARGET STYLE / ENVIRONMENT');
  addPart('clothing', 'CLOTHING TO WEAR');
  addPart('shoes', 'SHOES TO WEAR');
  addPart('accessories', 'ACCESSORIES');
  addPart('hairstyle', 'HAIRSTYLE');

  const response = await ai.models.generateContent({
    model,
    contents: { parts }
  });

  return response.text || "";
}

/**
 * Generates the final composite image using ALL provided assets for maximum fidelity.
 * @param assets The map of all user assets.
 * @param prompt The extracted descriptive prompt.
 */
export async function generateCompositeImage(assets: AssetMap, prompt: string): Promise<string> {
  const model = 'gemini-2.5-flash-image';
  
  // Determine aspect ratio from style image if available, else face image, else 1:1
  const refImage = assets.style || assets.face;
  if (!refImage) throw new Error("No reference images provided");
  
  const aspectRatio = getClosestAspectRatio(refImage.width, refImage.height);

  // Construct the instruction to force strict adherence to visual inputs
  const systemInstruction = `
    You are an advanced image compositor. Generate a photorealistic high-fidelity image based on the provided inputs.
    
    **MASTER SCENE DESCRIPTION**:
    "${prompt}"

    **CRITICAL EXECUTION RULES:**
    1. **IDENTITY**: You MUST use the face provided in the [IDENTITY_FACE] reference. The subject in the final image must be recognizable as this person.
    2. **CLOTHING & STYLE**: You are provided with specific reference images for CLOTHING, SHOES, and ACCESSORIES. You MUST copy their visual design, colors, textures, and details EXACTLY. Do not invent new clothes if references are provided.
    3. **INTEGRATION**: Blend the subject naturally into the environment defined by the [STYLE_ENVIRONMENT] reference (if provided) or the text description. Match lighting, shadows, and color grading.
    4. **REALISM**: The output must look like a high-end photograph, not a cartoon (unless the style reference is artistic).
  `;

  const parts: any[] = [];
  
  parts.push({ text: systemInstruction });

  // Add the Face (Primary)
  if (assets.face) {
    parts.push({ text: "REFERENCE: [IDENTITY_FACE] (Strictly preserve facial features)" });
    parts.push({ inlineData: { data: assets.face.data, mimeType: assets.face.mimeType } });
  }

  // Add other assets with strict labels
  const assetTypes: { type: AssetType, label: string }[] = [
    { type: 'style', label: 'STYLE_ENVIRONMENT (Copy atmosphere/lighting)' },
    { type: 'clothing', label: 'CLOTHING (Copy design/texture exactly)' },
    { type: 'shoes', label: 'SHOES (Copy exact model)' },
    { type: 'accessories', label: 'ACCESSORIES (Include details)' },
    { type: 'hairstyle', label: 'HAIRSTYLE (Apply to subject)' }
  ];

  for (const asset of assetTypes) {
    const img = assets[asset.type];
    if (img) {
      parts.push({ text: `REFERENCE: [${asset.label}]` });
      parts.push({ inlineData: { data: img.data, mimeType: img.mimeType } });
    }
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
       imageConfig: {
           aspectRatio: aspectRatio,
       },
       // DISABLING SAFETY FILTERS to prevent "Empty response" on valid inputs
       // Often models block "face swaps" or specific clothing under over-sensitive filters.
       safetySettings: [
           { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
           { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
           { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
           { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
           { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' }
       ]
    }
  });

  // Handle potential text-only responses (Rejection/Explanation)
  let textFallback = "";
  
  if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
        if (part.text) {
            textFallback += part.text;
        }
      }
  }

  // If we got here, no image was found.
  if (textFallback) {
      // Clean up the error message
      throw new Error(`Model Response: ${textFallback.substring(0, 300)}...`);
  }

  throw new Error("No image was generated by the model (Empty response). Ensure the inputs are clear and not violating major policies.");
}