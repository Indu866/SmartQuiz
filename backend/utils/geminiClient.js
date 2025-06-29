const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Removes trailing commas before } or ]
 */
function cleanJson(text) {
  return text.replace(/,\s*([}\]])/g, "$1");
}

async function GeminiAPI(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    let text = result.response.candidates[0].content.parts[0].text;

    console.log("\n📦 Gemini raw output:\n", text);  // Keep this for debugging

    // Remove any markdown formatting (like ```json ... ```)
    if (text.startsWith("```")) {
      text = text.substring(text.indexOf("\n") + 1);
      if (text.endsWith("```")) {
        text = text.substring(0, text.lastIndexOf("```")).trim();
      }
    }

    // Extract JSON content
    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]") + 1;
    let clean = text.slice(jsonStart, jsonEnd);

    // Clean up trailing commas
    clean = cleanJson(clean);

    // Parse JSON
    const parsed = JSON.parse(clean);
    console.log("✅ Parsed questions:", parsed);

    return parsed;
  } catch (err) {
    console.error("❌ GeminiAPI error:", err);
    throw new Error("Invalid response format from Gemini");
  }
}

module.exports = { GeminiAPI };
