import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // for routing
import { useLanguage } from "../LanguageContext";
import { translateText } from "../utils/translateText";

const FeatureCards: React.FC = () => {
  const { language } = useLanguage();

  const features = [
    {
      key: "soil_classification",
      text: "Soil Classification",
      icon: "🌱",
      image: "src/images/soil.jpg",
      link: "/soil-classification",
    },
    {
      key: "crop_disease",
      text: "Crop Disease Detection",
      icon: "🦠",
      image: "src/images/disease.jpg",
      link: "/crop-disease-detection",
    },
    {
      key: "gov_schemes",
      text: "Farming Schemes",
      icon: "📜",
      image: "src/images/schemes.jpg",
      link: "/farming-schemes",
    },
    {
      key: "crop_recommend",
      text: "Crop Recommendation",
      icon: "🌾",
      image: "src/images/recommendation.jpg",
      link: "/crop-recommendation",
    },
    {
      key: "market_analysis",
      text: "Market Analysis",
      icon: "📈",
      image: "src/images/market.jpg", // make sure this image exists
      link: "/market-analysis",
    },
    {
      key: "seasonal_calendar",
      text: "Seasonal Calendar",
      icon: "📅",
      image: "src/images/seasonal.jpg", // make sure this image exists
      link: "/seasonal-calendar",
    },
  ];
  

  const [translatedFeatures, setTranslatedFeatures] = useState<string[]>([]);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const translations = await Promise.all(
          features.map((feature) => translateText(feature.text, language))
        );
        setTranslatedFeatures(translations);
      } catch (error) {
        console.error("Translation error:", error);
      }
    };

    fetchTranslations();
  }, [language]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      {features.map((feature, index) => (
        <Link key={feature.key} to={feature.link}>
          <div
            className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden transform transition-all hover:scale-105"
          >
            {/* Image */}
            <img
              src={feature.image}
              alt={feature.text}
              className="w-full h-40 object-cover"
            />

            {/* Card Content */}
            <div className="p-4 text-center">
              <div className="text-3xl">{feature.icon}</div>
              <h3 className="text-xl font-semibold mt-2 text-gray-900 dark:text-white">
                {translatedFeatures[index] || feature.text}
              </h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default FeatureCards;
