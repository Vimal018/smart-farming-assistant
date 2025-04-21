import { useLanguage } from "../LanguageContext";
import { useEffect, useState } from "react";
import { translateText } from "../utils/translateText";
import FeatureCards from "../components/FeatureCard"; // Import FeatureCards

const Home: React.FC = () => {
  const { language } = useLanguage();

  // State for translations
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
    <div className="home-container">
      <h1 className="text-4xl font-bold mb-4">{translatedTitle}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">{translatedDescription}</p>

      {/* Render FeatureCards below the introduction */}
      <FeatureCards />
    </div>
  );
};

export default Home;
