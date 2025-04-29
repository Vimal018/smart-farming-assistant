import { useState, useEffect, Key, ReactElement, ReactNode } from "react";
import { useLanguage } from "../LanguageContext";
import { translateText } from "../utils/translateText";
import { CalendarDays, Leaf, Sunrise, Droplet, Sprout } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// List of districts and soil types
const districtsList = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
  "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur",
  "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris",
  "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivagangai",
  "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore",
  "Viluppuram", "Virudhunagar"
];

const soilTypes = [
  "Alluvial", "Black", "Red", "Laterite", "Saline", "Peaty", "Desert", "Mountain"
];

// Define interface for seasonal data
interface SeasonalData {
  crop: string;
  sowing: string;
  growing: string;
  harvesting: string;
  waterNeeds: string;
}

interface Crop {
  name: ReactNode;
  sowing_time: ReactNode;
  key_activities: any[];
  harvest_time: ReactNode;
  water_requirements: ReactNode;
}

interface SeasonData {
  season: string;
  months: string;
  crops: Crop[];
}

const SeasonalCalendar = () => {
  const { language } = useLanguage();
  const [district, setDistrict] = useState("");
  const [soilType, setSoilType] = useState("");
  const [crops, setCrops] = useState<string[]>([]);
  const [seasonalData, setSeasonalData] = useState<SeasonData[]>([]);
  const [translatedDistricts, setTranslatedDistricts] = useState(districtsList);
  const [translations, setTranslations] = useState({
    title: "Seasonal Calendar",
    subtitle: "Check seasonal activities for crops",
    districtLabel: "Select District",
    soilTypeLabel: "Select Soil Type",
    cropsLabel: "Crop Selection",
    submitText: "Get Calendar",
    placeholderCrops: "Enter crops (comma separated)",
    sowing: "Sowing Period",
    growing: "Growing Season",
    harvesting: "Harvesting Period",
    waterNeeds: "Water Needs",
    loading: "Loading...",
    noData: "No data available",
    errorMsg: "Please select a district, soil type, and enter at least one crop."
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const translate = async () => {
      try {
        const translated = {
          title: await translateText("Seasonal Calendar", language),
          subtitle: await translateText("Check seasonal activities for crops", language),
          districtLabel: await translateText("Select District", language),
          soilTypeLabel: await translateText("Select Soil Type", language),
          cropsLabel: await translateText("Crop Selection", language),
          submitText: await translateText("Get Calendar", language),
          placeholderCrops: await translateText("Enter crops (comma separated)", language),
          sowing: await translateText("Sowing Period", language),
          growing: await translateText("Growing Season", language),
          harvesting: await translateText("Harvesting Period", language),
          waterNeeds: await translateText("Water Needs", language),
          loading: await translateText("Loading...", language),
          noData: await translateText("No data available", language),
          errorMsg: await translateText("Please select a district, soil type, and enter at least one crop.", language),
        };
        setTranslations(translated);

        const translatedDistricts = await Promise.all(
          districtsList.map((d) => translateText(d, language))
        );
        setTranslatedDistricts(translatedDistricts);
      } catch (err) {
        console.error("Translation error:", err);
      }
    };
    translate();
  }, [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSeasonalData([]);

    if (!district.trim() || !soilType.trim() || crops.length === 0) {
      toast.error(translations.errorMsg);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/seasonal-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ district, soilType, crops })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Fetch failed");

      // Handling the response format
      const calendarData = data.calendar_data?.calendar || [];
      setSeasonalData(calendarData);
      toast.success("Calendar data loaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Error fetching seasonal calendar.");
      setError("Error fetching seasonal calendar.");
    } finally {
      setLoading(false);
    }
  };

  const handleCropsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cropList = e.target.value.split(",").map((c) => c.trim()).filter(Boolean);
    setCrops(cropList);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">{translations.title}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">{translations.subtitle}</p>
      </div>

      <Card className="mb-8 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-b">
          <CardTitle className="text-xl">{translations.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* District Select */}
              <div className="space-y-2">
                <label className="block font-medium text-gray-700 dark:text-gray-300">{translations.districtLabel}</label>
                <select
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-green-400"
                  onChange={(e) => setDistrict(e.target.value)}
                  value={district}
                >
                  <option value="">-- {translations.districtLabel} --</option>
                  {translatedDistricts.map((name, i) => (
                    <option key={i} value={districtsList[i]}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Soil Type Select */}
              <div className="space-y-2">
                <label className="block font-medium text-gray-700 dark:text-gray-300">{translations.soilTypeLabel}</label>
                <select
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-green-400"
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                >
                  <option value="">-- {translations.soilTypeLabel} --</option>
                  {soilTypes.map((type, idx) => (
                    <option key={idx} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Crop Selection */}
            <div className="space-y-2">
              <label className="block font-medium text-gray-700 dark:text-gray-300">{translations.cropsLabel}</label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-green-400"
                placeholder={translations.placeholderCrops}
                onChange={handleCropsChange}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button 
                type="submit"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium px-8 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {translations.loading}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    {translations.submitText}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <p>{error}</p>
        </div>
      )}

      {seasonalData.length > 0 ? (
        <div className="space-y-8">
          {seasonalData.map((season, idx) => (
            <Card key={idx} className="overflow-hidden shadow-lg border-t-4 border-t-green-500">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">{season.season}</CardTitle>
                  <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full dark:bg-green-900/30 dark:text-green-300">
                    {season.months}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-8">
                  {season.crops.map((crop, cropIdx) => (
                    <div key={cropIdx} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0 dark:border-gray-700">
                      <h4 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
                        <span className="inline-block w-2 h-6 bg-green-500 mr-3 rounded"></span>
                        {crop.name}
                      </h4>
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg dark:bg-amber-900/30">
                              <Sunrise className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700 dark:text-gray-300">{translations.sowing}</p>
                              <p className="text-gray-600 mt-1 dark:text-gray-400">{crop.sowing_time}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/30">
                              <Sprout className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700 dark:text-gray-300">{translations.growing}</p>
                              <p className="text-gray-600 mt-1 dark:text-gray-400">
                                {crop.key_activities.join(", ")}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg dark:bg-emerald-900/30">
                              <Leaf className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700 dark:text-gray-300">{translations.harvesting}</p>
                              <p className="text-gray-600 mt-1 dark:text-gray-400">{crop.harvest_time}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                              <Droplet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700 dark:text-gray-300">{translations.waterNeeds}</p>
                              <p className="text-gray-600 mt-1 dark:text-gray-400">{crop.water_requirements}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center dark:bg-gray-800 dark:border-gray-700">
          <CalendarDays className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">{translations.noData}</p>
        </div>
      )}
    </div>
  );
};

export default SeasonalCalendar;