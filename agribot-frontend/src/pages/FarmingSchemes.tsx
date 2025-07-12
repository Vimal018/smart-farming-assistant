import { useState, useEffect } from "react";
import { useLanguage } from "../LanguageContext";
import { translateText } from "../utils/translateText";
import SchemeCard from "@/components/SchemeCard";

interface Scheme {
  title: string;
  description: string;
  subsidy: string;
  eligibility: string;
  department: string;
  documents: string[];
  image: string;
}

  // Updated List of Farming Schemes (Added Agriculture Infrastructure Fund)
  const schemes = [
    {
      title: "Palmyrah Development Mission",
      description: "Promotes Palmyrah cultivation and provides subsidies for farmers.",
      subsidy: "75% subsidy (Max: Rs.4,500/Unit) | 50% subsidy (Max: Rs.4,000/Unit)",
      eligibility: "All farmers except Chennai & The Nilgiris. Preference for small, marginal, women, SC/ST farmers.",
      documents: [
        "Chitta", "Adangal", "Beneficiary photo (2)", "Ration Card / Smart Card",
        "Aadhaar Card", "Bank account details", "Palm Jaggery Cooperative Society card", "Palm tree climber license"
      ],
      department: "Department of Agriculture and Farmers Welfare, Government of Tamil Nadu",
      image: "/images/palm.jpg"
    },
    {
      title: "Chief Minister Dryland Development Mission",
      description: "Encourages food & agriculture entrepreneurs with training & financial support.",
      subsidy: "Capital subsidy up to Rs.2.00 lakh (40% of project cost). Loans up to Rs.5 lakh.",
      eligibility: "Degree/Diploma/ITI holders. Preference for Agriculture Graduates. Supports agro-based activities like food processing & packaging.",
      documents: [
        "PAN Card", "Aadhaar", "Address Proof", "Utility Certificate (Address)", 
        "Bank Passbook Details", "Price Note for Machines to be Installed",
        "Educational Qualification Certificates", "Certificate of Competence of Skilled Training",
        "CIBIL Report"
      ],
      department: "Department of Agriculture and Farmers Welfare, Government of Tamil Nadu",
      image: "/images/dryland.jpg"
    },
    {
      title: "Chief Minister Solar Powered Pump Set",
      description: "Provides solar-powered pump sets to farmers for irrigation and promotes renewable energy use in agriculture.",
      subsidy: "5 HP Pump: Total Cost Rs.2,69,717/- (Subsidy: Rs.1,88,802/-) | 7.5 HP Pump: Total Cost Rs.3,63,898/- (Subsidy: Rs.2,54,728/-) | 10 HP Pump: Total Cost Rs.4,57,240/- (Subsidy: Rs.2,54,728/-)",
      eligibility: "New solar pumps not allowed in dark/black zones. Existing diesel pumps can be converted to solar if using micro irrigation techniques.",
      documents: [
        "Land ownership proof", "Aadhaar Card", "Bank details", "Proof of existing diesel pump",
        "Micro-irrigation system proof"
      ],
      department: "Department of Agriculture and Farmers Welfare, Government of Tamil Nadu",
      image: "/images/solar.jpg"
    },
    {
      title: "Agriculture Infrastructure Fund",
      description: "A medium-term loan financing facility for investment in crop management projects across India.",
      subsidy: "3% interest subvention per annum (up to Rs.2 crores) for 7 years. Credit guarantee available under CGTMSE for loans up to Rs.2 crores.",
      eligibility: "Loans provided to PACS, marketing cooperatives, FPOs, SHGs, farmers, JLGs, multipurpose cooperative societies, agro-entrepreneurs, and small-scale industries.",
      documents: [
        "Loan application to bank", "Business plan", "FPO registration (if applicable)", "Land ownership proof",
        "Financial statements (if applicable)", "CIBIL Report"
      ],
      department: "Department of Agriculture, Cooperation & Farmers Welfare, Government of India",
      image: "/images/agrifund.jpg"
    },
    {
      title: "Pradhan Mantri Kaushal Vikas Yojana",
      description: "A flagship skill development scheme providing training, a stipend, and job placements.",
      subsidy: "Benefit: Rs.8000/month stipend, Rs.1450/month placement support, Rs.1500 travel allowance.",
      eligibility: "Individuals above 14 years of age. Only school/college dropouts allowed. Not applicable for college students.",
      documents: [
        "Aadhaar Card", "Bank Account Details", "Education Certificates", "Enrollment in Authorized Training Center"
      ],
      department: "Ministry of Skill Development And Entrepreneurship",
      image: "/images/pmscheme.jpg"
    },
    {
      title: "Swamitva Yojana",
      description: "Aims to provide property ownership records in rural areas using drone technology.",
      subsidy: "No direct financial subsidy. Provides official property ownership records.",
      eligibility: "Applicable for rural residents without official land ownership documents.",
      documents: [
        "Aadhaar Card", "Land Ownership Proof", "Village Panchayat Approval", "Survey Records"
      ],
      department: "Ministry of Panchayati Raj, Government of India",
      image: "/images/drone.jpg"
    },
    {
      title: "Kisan Credit Card",
      description: "A government scheme providing loans to farmers at reduced interest rates.",
      subsidy: "Interest rates as low as 2.00%. Collateral-free loans up to Rs.1.60 lakh.",
      eligibility: "Available to individual farmers, tenant farmers, SHGs, and joint liability groups involved in agriculture.",
      documents: [
        "PAN Card", "Aadhaar", "Land ownership proof", "Bank account details"
      ],
      department: "Ministry of Agriculture and Farmers Welfare",
      image: "/images/farmer.jpg"
    },
    {
      title: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
      description: "Provides direct income support of Rs.6000 per year to eligible farmers.",
      subsidy: "Rs.6000 per year in 3 equal installments of Rs.2000 each.",
      eligibility: "All small and marginal farmers. Excludes higher-income farmers, institutional landholders, and professionals.",
      documents: [
        "Aadhaar Card", "Bank Account Details", "Land Ownership Proof"
      ],
      department: "Department of Agriculture and Farmers Welfare, Government of India",
      image: "/images/pmkisan.jpg"
    },
    {
      title: "Agriclinic and Agribusiness Centres Scheme (NABARD)",
      description: "Provides training followed by a loan of up to Rs.100 lakhs for starting a venture via Agriclinics and Agribusiness Centres.",
      subsidy: "Loan up to Rs.100 lakhs available for eligible applicants.",
      eligibility: "Applicants with Ph.D., Masters, Graduation, Diploma, or Postgraduate Diploma in Agriculture & allied disciplines. Intermediate (Plus Two) students with 55% marks in agriculture-related courses are also eligible.",
      documents: [
        "Educational Qualification Certificates", "Aadhaar Card", "Bank Account Details", "Application Form"
      ],
      department: "National Bank for Agriculture and Rural Development (NABARD)",
      image: "/images/tractor.jpg"
    }
  ];
  

  const FarmingSchemes: React.FC = () => {
    const { language } = useLanguage();
    const [translatedSchemes, setTranslatedSchemes] = useState<Scheme[]>(schemes);
    const [translatedTitle, setTranslatedTitle] = useState<string>("Farming Schemes");
  
    useEffect(() => {
      const translateContent = async () => {
        setTranslatedTitle(await translateText("Farming Schemes", language));
  
        const translated = await Promise.all(
          schemes.map(async (scheme): Promise<Scheme> => ({
            title: await translateText(scheme.title, language),
            description: await translateText(scheme.description, language),
            subsidy: await translateText(scheme.subsidy, language),
            eligibility: await translateText(scheme.eligibility, language),
            department: await translateText(scheme.department, language),
            documents: await Promise.all(scheme.documents.map((doc) => translateText(doc, language))),
            image: scheme.image, // ✅ Keep image unchanged
          }))
        );
        setTranslatedSchemes(translated);
      };
  
      translateContent();
    }, [language]);
  
    return (
      <div className="p-6 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">{translatedTitle}</h2>
        
        {/* ✅ Grid Layout for Adaptability */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {translatedSchemes.map((scheme, index) => (
            <SchemeCard key={index} scheme={scheme} />
          ))}
        </div>
      </div>
    );
  };
  
  export default FarmingSchemes;
  