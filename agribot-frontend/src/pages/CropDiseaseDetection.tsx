import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "../LanguageContext";
import { translateText } from "../utils/translateText";
import { ImageIcon, Loader2, AlertTriangle, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert"; // Adjust the path based on your project structure
import DiseaseDetectionResult from "@/components/DiseaseDetectionResult";

interface DetectionResult {
  confidence: number;
  predicted_class: string;
  prevention_advice?: string;
  error?: string;
}

const CropDiseaseDetection: React.FC = () => {
  const { language } = useLanguage();
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Translated text states
  const [translatedTitle, setTranslatedTitle] = useState("Crop Disease Detection");
  const [translatedLabel, setTranslatedLabel] = useState("Upload Plant Image");
  const [translatedButton, setTranslatedButton] = useState("Analyze Image");
  const [translatedResult, setTranslatedResult] = useState("Detection Result");
  const [translatedPredictedClass, setTranslatedPredictedClass] = useState("Predicted Class");
  const [translatedConfidence, setTranslatedConfidence] = useState("Confidence");
  const [translatedAdvice, setTranslatedAdvice] = useState("Prevention Advice");
  const [, setTranslatedError] = useState("Error analyzing image");
  const [translatedProcessing, setTranslatedProcessing] = useState("Analyzing...");

  useEffect(() => {
    const translatePage = async () => {
      setTranslatedTitle(await translateText("Crop Disease Detection", language));
      setTranslatedLabel(await translateText("Upload Plant Image", language));
      setTranslatedButton(await translateText("Analyze Image", language));
      setTranslatedResult(await translateText("Detection Result", language));
      setTranslatedPredictedClass(await translateText("Predicted Class", language));
      setTranslatedConfidence(await translateText("Confidence", language));
      setTranslatedAdvice(await translateText("Prevention Advice", language));
      setTranslatedError(await translateText("Error analyzing image", language));
      setTranslatedProcessing(await translateText("Analyzing...", language));
    };
    translatePage();
  }, [language]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];
      setImage(selectedImage);
      setPreview(URL.createObjectURL(selectedImage));
      setError("");
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setError(await translateText("Please upload an image", language));
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);

    try {
      const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

        const response = await fetch(`${backendUrl}/crop-disease-detection`, {
          method: "POST",
          body: formData,
        });

      const data: DetectionResult = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to analyze image");
      }

      const predictedClass = data.predicted_class
        ? await translateText(data.predicted_class, language)
        : "Unknown Disease";

      const prevention = data.prevention_advice
        ? await translateText(data.prevention_advice, language)
        : "No advice available.";

      const confidence = data.confidence ? data.confidence.toFixed(2) : "N/A";

      setResult({
        confidence: parseFloat(confidence),
        predicted_class: predictedClass,
        prevention_advice: prevention,
      });
      setError("");
    } catch (err) {
      setError(await translateText(err instanceof Error ? err.message : "Error analyzing image", language));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950/30 dark:to-background py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">
            {translatedTitle}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Upload a photo of your plant to detect potential diseases and get prevention advice
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-6 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-primary transition-colors" />
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                    {translatedLabel}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Drag and drop or click to upload
                  </p>
                </div>
              </div>

              {preview && (
                <div className="relative group rounded-lg overflow-hidden">
                  <img
                    src={preview}
                    alt="Selected plant"
                    className="w-full h-64 object-cover rounded-lg transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm">Click to change image</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin h-5 w-5" />
                    {translatedProcessing}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    {translatedButton}
                  </span>
                )}
              </Button>
            </form>

            {error && (
              <div className="mt-4 animate-fade-in">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
          </Card>

          <ScrollArea className="h-[600px] rounded-lg">
            {result && !error && (
              <div className="animate-fade-in">
                <DiseaseDetectionResult
                  result={result}
                  translatedLabels={{
                    result: translatedResult,
                    predictedClass: translatedPredictedClass,
                    confidence: translatedConfidence,
                    advice: translatedAdvice,
                  }}
                />
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default CropDiseaseDetection;
