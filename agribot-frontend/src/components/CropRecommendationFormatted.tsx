import React from 'react';

interface CropRecommendationFormattedProps {
  recommendationText: string;
}

const CropRecommendationFormatted: React.FC<CropRecommendationFormattedProps> = ({ recommendationText }) => {
  if (!recommendationText) {
    return <p className="text-gray-500 italic">No recommendation available yet.</p>;
  }

  // Split the text into paragraphs
  const paragraphs = recommendationText.split('\n\n').filter(p => p.trim());

  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, index) => {
        // Check if paragraph is a heading (starts with # or ##)
        if (paragraph.startsWith('# ') || paragraph.startsWith('## ')) {
          const headingLevel = paragraph.startsWith('# ') ? 'h3' : 'h4';
          const headingText = paragraph.replace(/^#+ /, '');
          
          return React.createElement(
            headingLevel, 
            { 
              key: index,
              className: headingLevel === 'h3' 
                ? 'text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3' 
                : 'text-lg font-bold text-gray-800 dark:text-gray-200 mt-5 mb-2'
            }, 
            headingText
          );
        }
        
        // Check if paragraph is a list (starts with - or *)
        if (paragraph.includes('\n- ') || paragraph.includes('\n* ')) {
          const listItems = paragraph.split(/\n[*-] /).filter(item => item.trim());
          
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
              {listItems.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          );
        }
        
        // Regular paragraph
        return (
          <p key={index} className="text-gray-700 dark:text-gray-300">
            {paragraph}
          </p>
        );
      })}
    </div>
  );
};

export default CropRecommendationFormatted;