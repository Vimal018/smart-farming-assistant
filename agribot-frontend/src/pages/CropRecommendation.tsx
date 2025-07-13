import { useState, useEffect } from "react";
import { useLanguage } from "../LanguageContext";
import { translateText } from "../utils/translateText";
import CropRecommendationFormatted from "../components/CropRecommendationFormatted";
import { Sprout, Home, ArrowDown, Search, Leaf, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [, setTopCrops] = useState<string[]>([]);
  const [translatedTopCrops, setTranslatedTopCrops] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("form");
  const [, setActiveTab] = useState("recommendations");
  const [translatedDistricts, setTranslatedDistricts] = useState(districtsList);
  const [translatedSoilTypes, setTranslatedSoilTypes] = useState(soilTypes);

  const [translations, setTranslations] = useState({
    title: "Crop Recommendation",
    subtitle: "Find the best crops for your soil and location",
    soilLabel: "Soil Type",
    districtLabel: "Select District",
    submitText: "Get Recommendations",
    placeholderSoil: "Enter soil type",
    topCropsLabel: "Top Crops",
    recommendationLabel: "Recommendation",
    backToForm: "Change Selections",
    loading: "Loading...",
    noData: "No data available"
  });

  useEffect(() => {
    const translatePage = async () => {
      try {
        const newTranslations = {
          title: await translateText("Crop Recommendation", language),
          subtitle: await translateText("Find the best crops for your soil and location", language),
          soilLabel: await translateText("Soil Type", language),
          districtLabel: await translateText("Select District", language),
          submitText: await translateText("Get Recommendations", language),
          placeholderSoil: await translateText("Enter soil type", language),
          topCropsLabel: await translateText("Top Crops", language),
          recommendationLabel: await translateText("Recommendation", language),
          backToForm: await translateText("Change Selections", language),
          loading: await translateText("Loading...", language),
          noData: await translateText("No data available", language)
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

  const handleSubmit = async (e: React.FormEvent) => {
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
       const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

        const response = await fetch(`${backendUrl}/crop-recommendation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ soilType, district }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch recommendations");
      }

      if (data.error === "Failed to fetch recommendations") {
        setError("There is no such type of soil in this particular district for crop recommendation.");
        return;
      }

      setRecommendation(data.recommended_crops);
      setTopCrops(data.top_crops || []);

      const translatedText = await translateText(data.recommended_crops, language);
      setTranslatedRecommendation(translatedText);

      const translatedTop = await Promise.all(
        (data.top_crops || []).map((crop: string) => translateText(crop, language))
      );
      setTranslatedTopCrops(translatedTop);

      setView("results");
      setActiveTab("recommendations");
    } catch (error) {
      setError("Error fetching recommendations. Please try again later.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-900/20 dark:to-gray-900 py-12 px-4 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center text-center mb-10 space-y-4">
          <div className="inline-block p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
            <Sprout className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-green-800 to-emerald-600 dark:from-green-400 dark:to-emerald-300 bg-clip-text text-transparent">
            {translations.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
            {translations.subtitle}
          </p>
        </div>

        {view === "form" ? (
          <Card className="border-none bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-green-100/20 dark:hover:shadow-green-900/20">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
              <CardTitle className="flex items-center text-2xl text-green-700 dark:text-green-300">
                <Search className="mr-2 h-5 w-5" />
                Find Optimal Crops
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-lg font-medium text-gray-800 dark:text-gray-200 mb-2 items-center">
                      <Leaf className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                      {translations.soilLabel}
                    </label>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="w-full py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">{translations.placeholderSoil}</option>
                      {translatedSoilTypes.map((soil, index) => (
                        <option key={index} value={soilTypes[index]}>
                          {soil}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-lg font-medium text-gray-800 dark:text-gray-200 mb-2 items-center">
                      <CalendarDays className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                      {translations.districtLabel}
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">{translations.districtLabel}</option>
                      {translatedDistricts.map((d, index) => (
                        <option key={index} value={districtsList[index]}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-md animate-fade-in">
                    <p className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </p>
                  </div>
                )}

                <div className="flex justify-center mt-8">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="px-8 py-6 h-auto bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white text-lg font-medium rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <span className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-3" />
                        {translations.loading}
                      </span>
                    ) : (
                      <>
                        <span>{translations.submitText}</span>
                        <ArrowDown className="h-5 w-5 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <Card className="border-none bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-300 flex items-center">
                    <Sprout className="h-5 w-5 mr-2" />
                    {translations.topCropsLabel} - {district}, {soilType}
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setView("form")}
                    className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/30 self-start sm:self-auto"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    {translations.backToForm}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
                      <Leaf className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                      {translations.topCropsLabel}
                    </h3>
                    <div className="space-y-4">
                      {loading ? (
                        Array(3).fill(0).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full rounded-lg bg-green-100/50 dark:bg-green-900/20" />
                        ))
                      ) : translatedTopCrops.length > 0 ? (
                        translatedTopCrops.map((crop, idx) => (
                          <div 
                            key={idx} 
                            className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg transform transition-all duration-300 hover:translate-x-1 hover:shadow-md flex items-center border-l-4 border-green-500 dark:border-green-400"
                          >
                            <Sprout className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                            <span className="text-lg text-gray-900 dark:text-gray-100">{crop}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">{translations.noData}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
                      <CalendarDays className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                      {translations.recommendationLabel}
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm">
                      {loading ? (
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-3/4 bg-gray-200/50 dark:bg-gray-600/50" />
                          <Skeleton className="h-4 w-full bg-gray-200/50 dark:bg-gray-600/50" />
                          <Skeleton className="h-4 w-5/6 bg-gray-200/50 dark:bg-gray-600/50" />
                          <Skeleton className="h-4 w-4/5 bg-gray-200/50 dark:bg-gray-600/50" />
                        </div>
                      ) : (
                        <CropRecommendationFormatted 
                          recommendationText={language === "en" ? recommendation || "" : translatedRecommendation || ""}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropRecommendation;