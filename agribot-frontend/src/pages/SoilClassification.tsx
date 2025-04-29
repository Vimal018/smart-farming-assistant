import { useState, useEffect } from "react";
import { useLanguage } from "../LanguageContext";
import { translateText } from "../utils/translateText";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Loader, Upload } from "lucide-react";
import SoilClassificationResult from "../components/SoilClassificationResult";

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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950/30 dark:to-background py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-4 animate-fade-in">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            {translations.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Upload a soil image to analyze its properties and get crop recommendations
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-100 dark:border-green-900">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <label className="block text-lg font-medium text-gray-800 dark:text-gray-200">
                    {translations.label}
                  </label>
                  <div
                    className={`
                      border-2 border-dashed border-green-300 dark:border-green-700 
                      rounded-lg p-8 text-center hover:border-green-500 dark:hover:border-green-500 
                      transition-all cursor-pointer bg-green-50/50 dark:bg-green-900/20
                      ${selectedImage ? 'border-green-500' : ''}
                    `}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="fileInput"
                    />
                    <label htmlFor="fileInput" className="cursor-pointer space-y-4 block">
                      <Upload className="h-12 w-12 mx-auto text-green-600 dark:text-green-400" />
                      <span className="block text-gray-600 dark:text-gray-300">
                        {selectedImage ? selectedImage.name : "Click or drag to upload soil image"}
                      </span>
                    </label>
                  </div>
                  {previewImage && (
                    <div className="mt-4 rounded-lg overflow-hidden shadow-lg animate-fade-in">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-64 object-cover transition-transform hover:scale-105 duration-300"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {result && (
              <div className="animate-fade-in">
                <SoilClassificationResult result={result} resultLabel={translations.result} />
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !selectedImage}
            className={`w-full h-12 text-lg font-semibold transition-all duration-300
              ${
                !selectedImage
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-md hover:shadow-lg'
              }
            `}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader className="h-5 w-5 animate-spin" />
                {translations.processing}
              </div>
            ) : (
              <span>{translations.button}</span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SoilClassification;