import { useState, useEffect } from "react";
import { useLanguage } from "../LanguageContext";
import { translateText } from "../utils/translateText";

const SoilClassification: React.FC = () => {
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [result, setResult] = useState<{
    soil_type: string;
    pros: string[];
    cons: string[];
    recommended_crops: string[];
  } | null>(null);

  const [translations, setTranslations] = useState({
    title: "Soil Classification",
    label: "Upload Soil Image",
    button: "Classify Soil",
    result: "Classification Result",
    error: "Error processing soil classification",
    uploadPrompt: "Please upload an image",
    processing: "Processing...",
  });

  useEffect(() => {
    const translatePage = async () => {
      try {
        setTranslations({
          title: await translateText("Soil Classification", language),
          label: await translateText("Upload Soil Image", language),
          button: await translateText("Classify Soil", language),
          result: await translateText("Classification Result", language),
          error: await translateText("Error processing soil classification", language),
          uploadPrompt: await translateText("Please upload an image", language),
          processing: await translateText("Processing...", language),
        });
      } catch (err) {
        console.error("Translation error:", err);
      }
    };
    translatePage();
  }, [language]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!selectedImage) {
      alert(translations.uploadPrompt);
      return;
    }
  
    const formData = new FormData();
    formData.append("image", selectedImage);
  
    setIsLoading(true);
    setResult(null);
  
    try {
      const response = await fetch("http://localhost:5000/soil-classification", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch soil classification result");
      }
  
      const data = await response.json();
  
      if (!data.soil_type) {
        throw new Error("Invalid response format");
      }
  
      const translatedSoilType = await translateText(data.soil_type, language);
      const translatedPros = await Promise.all(
        data.pros.map((item: string) => translateText(item, language))
      );
      const translatedCons = await Promise.all(
        data.cons.map((item: string) => translateText(item, language))
      );
      const translatedCrops = await Promise.all(
        data.recommended_crops.map((item: string) => translateText(item, language))
      );
  
      setResult({
        soil_type: translatedSoilType,
        pros: translatedPros,
        cons: translatedCons,
        recommended_crops: translatedCrops,
      });
    } catch (error) {
      console.error("Soil classification error:", error);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-lg mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        {translations.title}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-2 border-dashed p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
          <label className="block text-lg text-gray-800 dark:text-gray-300">
            {translations.label}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            className="cursor-pointer mt-2 block border bg-white dark:bg-gray-700 px-4 py-2 rounded-md text-center text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            📷 {selectedImage ? selectedImage.name : "Choose File"}
          </label>
          {previewImage && (
            <div className="mt-4">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-40 object-cover rounded-md border"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className={`w-full py-2 rounded-md text-white font-semibold transition 
          ${isLoading ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
          disabled={isLoading}
        >
          {isLoading ? "⏳ " + translations.processing : "🌱 " + translations.button}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
            🌿 {translations.result}
          </h3>
          <p className="text-lg font-bold text-green-700 dark:text-green-300 mb-2">
            🧪 Soil Type: {result.soil_type}
          </p>

          <div className="mb-2">
            <p className="font-semibold text-gray-800 dark:text-gray-200">✅ Pros:</p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
              {result.pros.map((pro, index) => (
                <li key={index}>{pro}</li>
              ))}
            </ul>
          </div>

          <div className="mb-2">
            <p className="font-semibold text-gray-800 dark:text-gray-200">⚠️ Cons:</p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
              {result.cons.map((con, index) => (
                <li key={index}>{con}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">🌾 Recommended Crops:</p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
              {result.recommended_crops.map((crop, index) => (
                <li key={index}>{crop}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoilClassification;
