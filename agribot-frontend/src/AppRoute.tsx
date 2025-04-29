import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './pages/Home';
import SoilClassification from "./pages/SoilClassification";
import CropDiseaseDetection from "./pages/CropDiseaseDetection";
import FarmingSchemes from "./pages/FarmingSchemes";
import CropRecommendation from './pages/CropRecommendation';
import MarketAnalysis from './pages/MarketAnalysis';
import SeasonalCalendar from './pages/SeasonalCalendar';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


const queryClient = new QueryClient();

const PrivateRoute = () => {
  const { user } = useAuth();
  console.log("Checking user authentication:", user);
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />

          {/* Private Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<><Navbar /><Home /></>} />
            <Route path="/soil-classification" element={<><Navbar /><SoilClassification /></>} />
            <Route path="/crop-disease-detection" element={<><Navbar /><CropDiseaseDetection /></>} />
            <Route path="/farming-schemes" element={<><Navbar /><FarmingSchemes /></>} />
            <Route path="/crop-recommendation" element={<><Navbar /><CropRecommendation /></>} />
            <Route path="/market-analysis" element={<><Navbar /><MarketAnalysis /></>} />
            <Route path="/seasonal-calendar" element={<><Navbar /><SeasonalCalendar /></>} />
          </Route>

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default AppRoutes;
