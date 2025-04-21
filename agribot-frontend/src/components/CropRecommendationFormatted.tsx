import React from "react";

interface Props {
  recommendationText: string;
}

const CropRecommendationFormatted: React.FC<Props> = ({ recommendationText }) => {
  const sections = recommendationText.split("\n\n");

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-6 text-gray-800">
      {sections.map((section, i) => {
        // Title block with location info
        if (i === 0 && section.includes("📍 District")) {
          return (
            <div key={i} className="text-sm space-y-1">
              {section.split("\n").map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          );
        }

        // Recommended crops section
        if (section.startsWith("🌾 Recommended Crops:")) {
          return (
            <div key={i}>
              <h3 className="text-lg font-semibold mb-1">🌾 Recommended Crops</h3>
              <p className="text-sm">{section.replace("🌾 Recommended Crops:", "").trim()}</p>
            </div>
          );
        }

        // Top crops list
        if (section.startsWith("**Top 3-4 Most Suitable Crops:**")) {
          const lines = section.split("\n").slice(1);
          return (
            <div key={i}>
              <h4 className="text-base font-semibold mb-2">✅ Top 3–4 Most Suitable Crops</h4>
              <ul className="list-decimal ml-6 text-sm space-y-1">
                {lines.map((line, idx) => (
                  <li key={idx}>
                    <span dangerouslySetInnerHTML={{ __html: line }} />
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        // Categorization heading
        if (section.startsWith("**Categorization of Other Crops:**")) {
          return (
            <h4 key={i} className="text-base font-semibold">
              🗂️ {section.replace("**", "").replace("**", "")}
            </h4>
          );
        }

        // Categorized crop bullet points
        if (section.startsWith("* ")) {
          return (
            <ul key={i} className="list-disc ml-6 text-sm space-y-1">
              {section.split("\n").map((item, idx) => (
                <li key={idx}>{item.replace("* ", "")}</li>
              ))}
            </ul>
          );
        }

        // Important Note block
        if (section.startsWith("**Important Note:**")) {
          return (
            <div
              key={i}
              className="text-sm bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-md"
            >
              <strong>📌 Important Note:</strong>{" "}
              {section.replace("**Important Note:**", "").trim()}
            </div>
          );
        }

        // Fallback
        return <p key={i} className="text-sm">{section}</p>;
      })}
    </div>
  );
};

export default CropRecommendationFormatted;
