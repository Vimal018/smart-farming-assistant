import { useState, useEffect } from "react";
import { useLanguage } from "../LanguageContext";
import { translateText } from "../utils/translateText";
import { toast } from "sonner";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter,
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChartBar, TrendingUp, TrendingDown, Search, DollarSign, MapPin, CalendarDays, ClipboardList, FileText, Database, Leaf } from "lucide-react";

const soilTypes = ["Alluvial soil", "Black", "Chalky", "Clay soil", "Mary", "Red soil", "Sand", "Silt"];

const districtsList = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
  "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur",
  "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris",
  "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivagangai",
  "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore",
  "Viluppuram", "Virudhunagar"
];

interface MarketData {
  crop: string;
  current_price: string;
  demand: string;
  marketing_tips: string[];
  nearby_markets: string[];
  peak_selling_months: string;
  price_trend: string;
  storage_advice: string;
}

const MarketAnalysis = () => {
  const { language } = useLanguage();
  const [district, setDistrict] = useState("");
  const [crops, setCrops] = useState<string[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [translatedDistricts, setTranslatedDistricts] = useState(districtsList);
  const [, setTranslatedSoilTypes] = useState(soilTypes);
  const [cropsInput, setCropsInput] = useState("");

  const [translations, setTranslations] = useState({
    title: "Market Analysis",
    subtitle: "Analyze market trends for your crops",
    districtLabel: "Select District",
    cropsLabel: "Crop Selection",
    submitText: "Analyze Market",
    placeholderCrops: "Enter crops (comma separated)",
    currentPrice: "Current Price",
    demand: "Market Demand",
    marketingChannels: "Marketing Tips",
    storageLife: "Storage Advice",
    loading: "Loading...",
    noData: "No data available",
    priceTrend: "Price Trend",
    peakSelling: "Peak Selling Months",
    nearbyMarkets: "Nearby Markets",
  });

  useEffect(() => {
    const translatePage = async () => {
      try {
        const newTranslations = {
          title: await translateText("Market Analysis", language),
          subtitle: await translateText("Analyze market trends for your crops", language),
          districtLabel: await translateText("Select District", language),
          cropsLabel: await translateText("Crop Selection", language),
          submitText: await translateText("Analyze Market", language),
          placeholderCrops: await translateText("Enter crops (comma separated)", language),
          currentPrice: await translateText("Current Price", language),
          demand: await translateText("Market Demand", language),
          marketingChannels: await translateText("Marketing Tips", language),
          storageLife: await translateText("Storage Advice", language),
          loading: await translateText("Loading...", language),
          noData: await translateText("No data available", language),
          priceTrend: await translateText("Price Trend", language),
          peakSelling: await translateText("Peak Selling Months", language),
          nearbyMarkets: await translateText("Nearby Markets", language)
        };
        setTranslations(newTranslations);

        const translatedSoils = await Promise.all(soilTypes.map((soil) => translateText(soil, language)));
        setTranslatedSoilTypes(translatedSoils);

        const translatedNames = await Promise.all(districtsList.map((district) => translateText(district, language)));
        setTranslatedDistricts(translatedNames);
      } catch (err) {
        console.error("Error translating text:", err);
      }
    };

    translatePage();
  }, [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMarketData([]);
    setError("");

    if (!district.trim()) {
      setError("Please select a district.");
      toast.error("Please select a district.");
      return;
    }

    if (crops.length === 0) {
      setError("Please enter at least one crop.");
      toast.error("Please enter at least one crop.");
      return;
    }

    try {
      setLoading(true);
      toast.info("Analyzing market data...");
      
       const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const response = await fetch(`${backendUrl}/market-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ district, crops }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch market analysis");
      }

      setMarketData(data.market_data.market_analysis || []);
      setLoading(false);
      
    } catch (error) {
      setError("Error fetching market analysis. Please try again later.");
      toast.error("Error fetching market analysis");
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const handleCropsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cropsText = e.target.value;
    setCropsInput(cropsText);
    const cropsList = cropsText.split(',').map(crop => crop.trim()).filter(crop => crop.length > 0);
    setCrops(cropsList);
  };

  const getTrendIcon = (trend: string) => {
    if (trend.toLowerCase().includes("upward")) {
      return <TrendingUp className="text-green-500" />;
    } else if (trend.toLowerCase().includes("downward")) {
      return <TrendingDown className="text-red-500" />;
    } else {
      return <ChartBar className="text-blue-500" />;
    }
  };

  const renderMarketData = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center p-12">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/20"></div>
            <div className="h-4 w-48 rounded bg-primary/20"></div>
            <p className="text-muted-foreground">{translations.loading}</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (marketData.length === 0) {
      return null;
    }

    return (
      <div className="grid gap-8 mt-8 animate-fade-in">
        {marketData.map((item, index) => (
          <Card key={index} className="overflow-hidden border-l-4 border-l-primary">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-primary">{item.crop}</CardTitle>
                  <CardDescription>Market analysis for {district}</CardDescription>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm">
                  {getTrendIcon(item.price_trend)}
                  <span className="font-medium">{item.price_trend} trend</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{translations.currentPrice}</p>
                      <p className="font-semibold">{item.current_price}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      <ChartBar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{translations.demand}</p>
                      <p className="font-semibold">{item.demand}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{translations.peakSelling}</p>
                      <p className="font-semibold">{item.peak_selling_months}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{translations.nearbyMarkets}</p>
                      <p className="font-semibold">{item.nearby_markets.join(", ")}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{translations.storageLife}</p>
                      <p className="font-semibold">{item.storage_advice}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  {translations.marketingChannels}
                </h4>
                <ul className="grid gap-2 pl-6 list-disc">
                  {item.marketing_tips.map((tip, i) => (
                    <li key={i} className="text-muted-foreground">{tip}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 flex justify-between">
              <div className="text-sm text-muted-foreground">
                Last updated: April 25, 2025
              </div>
              <Button variant="outline" size="sm">
                <Database className="mr-2 h-4 w-4" /> Export Data
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-10 px-4 animate-fade-in">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {translations.title}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {translations.subtitle}
        </p>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" /> 
            <span>Market Search</span>
          </CardTitle>
          <CardDescription>
            Enter your location and crops to get detailed market insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="district">{translations.districtLabel}</Label>
              <Select 
                value={district} 
                onValueChange={setDistrict}
              >
                <SelectTrigger id="district" className="w-full">
                  <SelectValue placeholder={`-- ${translations.districtLabel} --`} />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[400px]">
                    {districtsList.map((d, i) => (
                      <SelectItem key={i} value={d}>
                        {translatedDistricts[i]}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="crops">{translations.cropsLabel}</Label>
              <Input
                id="crops"
                type="text"
                value={cropsInput}
                placeholder={translations.placeholderCrops}
                onChange={handleCropsChange}
              />
              {crops.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {crops.map((crop, index) => (
                    <div key={index} className="px-2 py-1 text-sm rounded-md bg-primary/10 text-primary flex items-center gap-1">
                      <Leaf className="h-3.5 w-3.5" />
                      {crop}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  {translations.loading}
                </>
              ) : (
                translations.submitText
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {renderMarketData()}
    </div>
  );
};

export default MarketAnalysis;