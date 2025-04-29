import { useEffect, useRef, useState } from "react";
import { Bot, X, Mic, Languages, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Speech Recognition Type Definitions
// Extend the Window interface to include SpeechRecognition
interface ExtendedWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

const SpeechRecognition =
  (window as ExtendedWindow).SpeechRecognition ||
  (window as ExtendedWindow).webkitSpeechRecognition;

export default function ChatBot() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<"en-IN" | "ta-IN">("en-IN");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const langLabel = language === "en-IN" ? "English" : "தமிழ்";

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Focus input field when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const startListening = () => {
    // Check if speech recognition is supported
    if (!SpeechRecognition) {
      toast({
        variant: "destructive",
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
      });
      return;
    }

    try {
      // Stop any existing recognition instance
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      // Create new recognition instance
      const recognition = new SpeechRecognition();
      recognition.lang = language;
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        toast({
          title: "Listening",
          description: `Speak in ${langLabel}...`,
          duration: 2000,
        });
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        
        // Auto-send when we receive speech input
        if (transcript.trim()) {
          handleSend(transcript, true);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        toast({
          variant: "destructive",
          title: "Speech Recognition Error",
          description: event.error === "no-speech" 
            ? "No speech detected. Please try again." 
            : `Error: ${event.error}`,
        });
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
      recognitionRef.current = recognition;

    } catch (error) {
      console.error("Speech recognition error:", error);
      toast({
        variant: "destructive",
        title: "Speech Recognition Error",
        description: "Failed to start speech recognition",
      });
      setIsListening(false);
    }
  };

  const speak = (text: string) => {
    try {
      speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Speech synthesis error:", error);
    }
  };

  const handleSend = async (msg?: string, fromVoice: boolean = false) => {
    const userInput = msg || input;
    if (!userInput.trim()) return;

    // Add user message
    const userMessage = { role: "user" as const, text: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput, lang: language }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }

      const data = await res.json();
      const replyText = data.reply?.trim() || "Sorry, I couldn't process that request.";
      
      // Add bot message
      const botMessage = { role: "bot" as const, text: replyText };
      setMessages((prev) => [...prev, botMessage]);

      // Read response aloud if input was from voice
      if (fromVoice) {
        speak(replyText);
      }
    } catch (error) {
      console.error("API error:", error);
      toast({
        variant: "destructive",
        title: "Server Error",
        description: "Failed to get response from server. Please try again.",
      });
      
      // Add error message from bot
      setMessages((prev) => [...prev, { 
        role: "bot", 
        text: "Sorry, I'm having trouble connecting to the server right now." 
      }]);
    } finally {
      setIsLoading(false);
      // Focus back on input field
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleClear = () => {
    setMessages([]);
    toast({
      title: "Chat Cleared",
      description: "All messages have been cleared.",
    });
  };

  const toggleLanguage = () => {
    // Stop listening if active when changing language
    if (isListening) {
      stopListening();
    }
    
    const newLanguage = language === "en-IN" ? "ta-IN" : "en-IN";
    setLanguage(newLanguage);
    
    toast({
      title: "Language Changed",
      description: `Language set to ${newLanguage === "en-IN" ? "English" : "Tamil"}`,
    });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-5 right-5 z-50 p-4 rounded-full shadow-lg cursor-pointer transition-all duration-300",
          "bg-gradient-to-r from-blue-600 to-blue-500 text-white",
          "hover:from-blue-500 hover:to-blue-600 hover:shadow-xl",
          "active:scale-95",
          isOpen && "rotate-90"
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-20 right-5 z-40 w-80 sm:w-96 h-[30rem] rounded-xl shadow-2xl flex flex-col overflow-hidden",
          "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
          "transform transition-all duration-300 ease-in-out",
          isOpen 
            ? "translate-y-0 opacity-100 scale-100" 
            : "translate-y-10 opacity-0 scale-95 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500">
          <div className="flex items-center">
            <Bot size={18} className="text-white mr-2" />
            <span className="text-sm font-semibold text-white">AgriBot</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
              onClick={handleClear}
              aria-label="Clear chat"
            >
              <Trash2 size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
              onClick={toggleLanguage}
              aria-label={`Switch to ${language === "en-IN" ? "Tamil" : "English"}`}
            >
              <Languages size={16} />
              <span className="sr-only">Switch Language</span>
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 dark:bg-gray-900">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
              <Bot size={40} className="mb-3 text-blue-500" />
              <p>Welcome to AgriBot!</p>
              <p className="text-sm">Ask me anything about agriculture in {langLabel}</p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] p-3 rounded-lg break-words",
                "transition-all duration-200 ease-in-out",
                "animate-[fadeIn_0.3s_ease-in-out]",
                msg.role === "user"
                  ? "ml-auto bg-blue-500 text-white rounded-br-none"
                  : "bg-white dark:bg-gray-800 shadow-sm rounded-bl-none dark:text-gray-100"
              )}
            >
              {msg.text}
            </div>
          ))}
          
          {isLoading && (
            <div className="bg-white dark:bg-gray-800 shadow-sm p-3 rounded-lg rounded-bl-none max-w-[85%] flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={`Type in ${langLabel}...`}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              size="icon"
              variant={isListening ? "destructive" : "secondary"}
              onClick={toggleListening}
              disabled={isLoading}
              className={cn(
                "shrink-0 transition-all duration-300",
                isListening && "animate-pulse"
              )}
              aria-label={isListening ? "Stop listening" : "Start voice input"}
            >
              <Mic size={16} />
            </Button>
            <Button 
              size="icon" 
              onClick={() => handleSend()} 
              disabled={!input.trim() || isLoading}
              className="shrink-0"
              aria-label="Send message"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}