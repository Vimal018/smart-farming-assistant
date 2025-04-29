import { useLanguage } from "../LanguageContext";
import { useEffect, useState } from "react";
import { translateText } from "../utils/translateText";
import FeatureCards from "../components/FeatureCard";
import { Leaf } from "lucide-react";

const Home: React.FC = () => {
  const { language } = useLanguage();
  const [translatedTitle, setTranslatedTitle] = useState<string>("Welcome to Smart Farming Assistant");
  const [translatedDescription, setTranslatedDescription] = useState<string>(
    "Your smart farming assistant. Helping farmers improve productivity, food security, and more."
  );

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const translatedTitle = await translateText("Welcome to Smart Farming Assistant", language);
        const translatedDescription = await translateText(
          "Your smart farming assistant. Helping farmers improve productivity, food security, and more.",
          language
        );

        setTranslatedTitle(translatedTitle);
        setTranslatedDescription(translatedDescription);
      } catch (error) {
        console.error("Translation error:", error);
      }
    };

    fetchTranslations();
  }, [language]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950/30 dark:to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="flex justify-center mb-6 animate-fade-in">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Leaf className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent animate-fade-in">
            {translatedTitle}
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed animate-fade-in">
            {translatedDescription}
          </p>

          {/* Decorative Element */}
          <div className="relative h-1 max-w-sm mx-auto my-12">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50" />
          </div>
        </div>

        {/* Feature Cards Section */}
        <div className="mt-16 animate-fade-in">
          <FeatureCards />
        </div>
      </div>
    </div>
  );
};

export default Home;