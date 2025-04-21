import { Link } from "react-router-dom";
import { Sun, Moon, LogOut, LogIn, UserPlus, Globe2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../LanguageContext";
import { translateText } from "../utils/translateText";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [translatedTitle, setTranslatedTitle] = useState("Agribot");
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const fetchTranslation = async () => {
      const translated = await translateText("Agribot", language);
      setTranslatedTitle(translated);
    };
    fetchTranslation();
  }, [language]);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
        isScrolled && "shadow-md"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2 group"
        >
          <span className="relative font-bold text-2xl bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent transition-transform duration-300 group-hover:scale-105">
            {translatedTitle}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-full" />
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          {/* Language Selection */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <Globe2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem 
                onClick={() => setLanguage("en")}
                className={cn("cursor-pointer", language === "en" && "bg-green-50 dark:bg-green-900/20")}
              >
                English
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLanguage("ta")}
                className={cn("cursor-pointer", language === "ta" && "bg-green-50 dark:bg-green-900/20")}
              >
                தமிழ் (Tamil)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle Switch */}
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-yellow-500" />
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              className="data-[state=checked]:bg-green-600"
            />
            <Moon className="h-4 w-4 text-gray-500" />
          </div>

          {/* User Profile */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full hover:ring-2 hover:ring-green-400 transition-all duration-300"
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="p-4 text-center">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="h-16 w-16 rounded-full mx-auto object-cover ring-2 ring-green-400"
                    />
                  ) : (
                    <div className="h-16 w-16 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                      {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                  )}
                  <p className="mt-2 font-semibold text-gray-900 dark:text-gray-100">{user.name || "User"}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={logout} 
                  className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 focus:text-red-700 dark:focus:text-red-400"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                asChild 
                className="hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <Link to="/login" className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  Login
                </Link>
              </Button>
              <Button
                variant="default"
                size="sm"
                asChild
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Link to="/signup" className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Signup
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;