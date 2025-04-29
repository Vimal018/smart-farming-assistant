import { Check, X, Leaf, FlaskConical } from "lucide-react";
import { Card, CardHeader, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

interface SoilClassificationResultProps {
  result: {
    soil_type: string;
    pros: string[];
    cons: string[];
    recommended_crops: string[];
  };
  resultLabel: string;
}

const SoilClassificationResult: React.FC<SoilClassificationResultProps> = ({
  result,
  resultLabel,
}) => {
  return (
    <Card className="w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-100 dark:border-green-900">
      <CardHeader>
        <div className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
          <FlaskConical className="h-6 w-6 text-green-600 dark:text-green-400" />
          {resultLabel}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Soil Type: {result.soil_type}
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Advantages
            </h4>
            <ul className="space-y-2">
              {result.pros.map((pro, index) => (
                <li key={index} className="flex items-start gap-2 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                    {pro}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <X className="h-5 w-5 text-red-600" />
              Limitations
            </h4>
            <ul className="space-y-2">
              {result.cons.map((con, index) => (
                <li key={index} className="flex items-start gap-2 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <Badge variant="secondary" className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                    {con}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-green-100 dark:border-green-900">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-3">
            <Leaf className="h-5 w-5 text-green-600" />
            Recommended Crops
          </h4>
          <div className="flex flex-wrap gap-2">
            {result.recommended_crops.map((crop, index) => (
              <Badge
                key={index}
                className="bg-green-600 text-white animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {crop}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SoilClassificationResult;