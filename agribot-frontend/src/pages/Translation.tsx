import { useState } from "react";
import axios from "axios";

const Translation = () => {
  const [text, setText] = useState("");
  const [targetLang, setTargetLang] = useState("ta"); // Default to Tamil
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTranslate = async () => {
    if (!text) {
      setError("Please enter text to translate.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/translate", {
        text,
        targetLang,
      });

      setTranslatedText(response.data.translatedText);
    } catch (err) {
      setError("Translation failed. Try again.");
      console.error("Translation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Text Translator</h2>
      
      <textarea
        className="w-full p-2 border rounded"
        placeholder="Enter text to translate..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <select
        className="w-full p-2 border rounded"
        value={targetLang}
        onChange={(e) => setTargetLang(e.target.value)}
      >
        <option value="ta">Tamil</option>
        <option value="hi">Hindi</option>
        <option value="fr">French</option>
        <option value="es">Spanish</option>
        <option value="de">German</option>
      </select>

      <button
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        onClick={handleTranslate}
        disabled={loading}
      >
        {loading ? "Translating..." : "Translate"}
      </button>

      {error && <p className="text-red-500">{error}</p>}
      {translatedText && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <strong>Translated Text:</strong> {translatedText}
        </div>
      )}
    </div>
  );
};

export default Translation;
