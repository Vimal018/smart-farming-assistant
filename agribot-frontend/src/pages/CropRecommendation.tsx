import { useState, useEffect } from "react";
import { useLanguage } from "../LanguageContext";
import { translateText } from "../utils/translateText";
import CropRecommendationFormatted from "@/components/CropRecommendationFormatted";

const soilTypes = ["Alluvial soil", "Black", "Chalky", "Clay soil", "Mary", "Red soil", "Sand", "Silt"];

const districtsList = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
  "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur",
  "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris",
  "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivagangai",
  "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore",
  "Viluppuram", "Virudhunagar"
];

const CropRecommendation = () => {
  const { language } = useLanguage();
  const [soilType, setSoilType] = useState("");
  const [district, setDistrict] = useState("");
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [translatedRecommendation, setTranslatedRecommendation] = useState<string | null>(null);
  const [topCrops, setTopCrops] = useState<string[]>([]);
  const [translatedTopCrops, setTranslatedTopCrops] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [translatedDistricts, setTranslatedDistricts] = useState(districtsList);
  const [translatedSoilTypes, setTranslatedSoilTypes] = useState(soilTypes);

  const [translations, setTranslations] = useState({
    title: "Crop Recommendation",
    soilLabel: "Soil Type",
    districtLabel: "Select District",
    submitText: "Get Recommendations",
    placeholderSoil: "Enter soil type",
    topCropsLabel: "Top Crops",
    recommendationLabel: "Recommendation",
  });

  useEffect(() => {
    const translatePage = async () => {
      try {
        const newTranslations = {
          title: await translateText("Crop Recommendation", language),
          soilLabel: await translateText("Soil Type", language),
          districtLabel: await translateText("Select District", language),
          submitText: await translateText("Get Recommendations", language),
          placeholderSoil: await translateText("Enter soil type", language),
          topCropsLabel: await translateText("Top Crops", language),
          recommendationLabel: await translateText("Recommendation", language),
        };
        setTranslations(newTranslations);

        const translatedSoils = await Promise.all(soilTypes.map((soil) => translateText(soil, language)));
        setTranslatedSoilTypes(translatedSoils);

        const translatedNames = await Promise.all(districtsList.map((district) => translateText(district, language)));
        setTranslatedDistricts(translatedNames);
      } catch (err) {
        console.error("Error translating text:", err);
      }
    };

    translatePage();
  }, [language]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRecommendation(null);
    setTranslatedRecommendation(null);
    setTopCrops([]);
    setTranslatedTopCrops([]);
    setError("");

    if (!soilType.trim() || !district.trim()) {
      setError("Please enter soil type and select a district.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/crop-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soilType, district }),
      });

      const data = await response.json();

      if (data.error === "Failed to fetch recommendations") {
        setError("There is no such type of soil in this particular district for crop recommendation.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      setRecommendation(data.recommended_crops);
      setTopCrops(data.top_crops || []);

      const translatedText = await translateText(data.recommended_crops, language);
      setTranslatedRecommendation(translatedText);

      const translatedTop = await Promise.all(
        (data.top_crops || []).map((crop: string) => translateText(crop, language))
      );
      setTranslatedTopCrops(translatedTop);
    } catch (error) {
      setError("Error fetching recommendations. Please try again later.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">{translations.title}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-lg text-gray-800 dark:text-gray-300">{translations.soilLabel}</label>
          <select
            value={soilType}
            onChange={(e) => setSoilType(e.target.value)}
            className="border p-2 w-full mt-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md"
          >
            <option value="">{translations.soilLabel}</option>
            {translatedSoilTypes.map((soil, index) => (
              <option key={index} value={soilTypes[index]}>
                {soil}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-lg text-gray-800 dark:text-gray-300">{translations.districtLabel}</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="border p-2 w-full mt-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md"
          >
            <option value="">{translations.districtLabel}</option>
            {translatedDistricts.map((d, index) => (
              <option key={index} value={districtsList[index]}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition"
        >
          {loading ? "Loading..." : translations.submitText}
        </button>
      </form>

      {error && <p className="mt-4 text-red-500">{error}</p>}

      {translatedTopCrops.length > 0 && (
        <div className="mt-6 bg-green-100 dark:bg-green-900 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
            🌾 {translations.topCropsLabel}
          </h3>
          <ul className="list-disc pl-5 text-gray-900 dark:text-gray-100">
            {translatedTopCrops.slice(0, 4).map((crop, idx) => (
              <li key={idx} className="text-lg">🌱 {crop}</li>
            ))}
          </ul>
        </div>
      )}

      {translatedRecommendation && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {translations.recommendationLabel}:
          </h3>
          <CropRecommendationFormatted recommendationText={language === "en" ? recommendation || "" : translatedRecommendation || ""} />
        </div>
      )}
    </div>
  );
};

export default CropRecommendation;
