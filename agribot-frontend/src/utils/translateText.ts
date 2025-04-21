import axios from "axios";

// Ensure the API key is set correctly (avoid using process.env in Vite frontend)
const API_KEY = import.meta.env.VITE_TRANSLATOR_API_KEY;
const REGION = "centralindia";
const ENDPOINT = "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en";

export const translateText = async (text: string, targetLang: string): Promise<string> => {
  // 🛑 Prevent empty or invalid text
  if (!text || text.trim() === "") {
    console.warn("⚠️ Translation Warning: Empty or invalid text provided.");
    return text;
  }

  // 🛑 Prevent translation from English to English (API limitation)
  if (targetLang === "en") {
    return text;
  }

  try {
    console.log("🔍 Sending text for translation:", text, "➡️", targetLang);

    const response = await axios.post(
      `${ENDPOINT}&to=${targetLang}`,
      [{ Text: text }], // ✅ Ensure correct format
      {
        headers: {
          "Ocp-Apim-Subscription-Key": API_KEY,
          "Ocp-Apim-Subscription-Region": REGION,
          "Content-Type": "application/json",
        },
      }
    );

    const translatedText = response.data[0]?.translations[0]?.text || text;
    console.log("✅ Translated Text:", translatedText);
    return translatedText;
  } catch (error: any) {
    console.error("❌ Translation API Error:", error.response?.data || error.message);
    return text; // Return original text on error
  }
};
