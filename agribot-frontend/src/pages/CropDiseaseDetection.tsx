import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "../LanguageContext";
import { translateText } from "../utils/translateText";
import { ImageIcon, Loader2, AlertTriangle } from "lucide-react";

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
  const [translatedError, setTranslatedError] = useState("Error analyzing image");
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
      const response = await fetch("http://localhost:5000/crop-disease-detection", {
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
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-bold mb-8 text-center text-primary">{translatedTitle}</h1>

      <Card className="p-6 shadow-xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-medium mb-2">{translatedLabel}</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {preview && (
              <div className="mt-4 flex flex-col items-center">
                <img
                  src={preview}
                  alt="Selected plant"
                  className="w-72 h-72 object-cover rounded-lg border border-muted shadow transition-all duration-500"
                />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Preview of the uploaded plant image
                </p>
              </div>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin h-5 w-5" />
                {translatedProcessing}
              </span>
            ) : (
              translatedButton
            )}
          </Button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-800 border border-red-300 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {error}
          </div>
        )}

        {/* Result */}
        {result && !error && (
          <div className="p-4 border rounded-lg bg-green-50 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-100 dark:border-green-700">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              {translatedResult}
            </h3>
            <p>
              <span className="font-medium">{translatedPredictedClass}:</span> {result.predicted_class}
            </p>
            <p>
              <span className="font-medium">{translatedConfidence}:</span> {result.confidence.toFixed(2)}%
            </p>
            {result.prevention_advice && (
              <p className="mt-3">
                <span className="font-medium">{translatedAdvice}:</span> {result.prevention_advice}
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CropDiseaseDetection;
