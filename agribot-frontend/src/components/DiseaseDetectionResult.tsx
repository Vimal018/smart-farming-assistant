import { ImageIcon, ShieldCheck, AlertCircle, Sprout } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface DetectionResultProps {
  result: {
    confidence: number;
    predicted_class: string;
    prevention_advice?: string;
  };
  translatedLabels: {
    result: string;
    predictedClass: string;
    confidence: string;
    advice: string;
  };
}

const DiseaseDetectionResult: React.FC<DetectionResultProps> = ({
  result,
  translatedLabels,
}) => {
  return (
    <Card className="w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-100 dark:border-green-900">
      <CardHeader>
        <div className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
          <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
          {translatedLabels.result}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            {result.predicted_class}
          </h3>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {translatedLabels.confidence}
            </span>
            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30">
              {result.confidence.toFixed(1)}%
            </Badge>
          </div>
          <Progress value={result.confidence} className="h-2" />
        </div>

        {result.prevention_advice && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Sprout className="h-5 w-5 text-green-600" />
                {translatedLabels.advice}
              </h4>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  {result.prevention_advice}
                </AlertDescription>
              </Alert>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DiseaseDetectionResult;