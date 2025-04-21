import { useEffect, useRef, useState } from "react";
import { Bot, X, Mic, Languages, Trash2 } from "lucide-react";

// Define the SpeechRecognition type
type SpeechRecognition = {
  new (): {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    maxAlternatives: number;
    start: () => void;
    stop: () => void;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
  };
};

interface Window extends globalThis.Window {
  SpeechRecognition?: SpeechRecognition;
  webkitSpeechRecognition?: SpeechRecognition;
}

declare var window: Window;

const SpeechRecognitionClass: typeof window.SpeechRecognition | undefined =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<"en-IN" | "ta-IN">("en-IN");
  const [isVoiceInput, setIsVoiceInput] = useState(false);

  const recognitionRef = useRef<any>(null);
  const languageRef = useRef(language);

  // Update languageRef whenever language changes
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  const startListening = () => {
    if (!SpeechRecognitionClass) return alert("Speech Recognition not supported in this browser.");
    const recognition = new SpeechRecognitionClass();
    recognition.lang = languageRef.current;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e: any) => {
      const speechResult = e.results[0][0].transcript;
      setInput(speechResult);
      setIsVoiceInput(true);
      handleSend(speechResult, true);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
    recognitionRef.current = recognition;
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageRef.current;
    speechSynthesis.speak(utterance);
  };

  const handleSend = async (msg?: string, fromVoice: boolean = false) => {
    const userInput = msg || input;
    if (!userInput.trim()) return;

    const userMessage: { role: "user" | "bot"; text: string } = { role: "user", text: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsVoiceInput(false);

    const res = await fetch("http://localhost:5000/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userInput, lang: languageRef.current }),
    });

    const data = await res.json();

    let replyText = data.reply?.trim() || "Sorry, no response.";
    const botMessage: { role: "user" | "bot"; text: string } = { role: "bot", text: replyText };
    setMessages((prev) => [...prev, botMessage]);

    if (fromVoice) {
      speak(replyText);
    }
  };

  const handleClear = () => setMessages([]);

  return (
    <>
      {/* Floating Button */}
      <div
        className="fixed bottom-5 right-5 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Bot />}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-50 bg-white dark:bg-gray-800 w-80 h-[28rem] rounded-xl shadow-xl flex flex-col overflow-hidden border dark:border-gray-700">
          <div className="flex justify-between items-center px-3 py-2 bg-gray-100 dark:bg-gray-700">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">AgriBot</span>
            <div className="flex items-center space-x-2">
              <button onClick={handleClear} className="text-gray-600 dark:text-gray-300">
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setLanguage(language === "en-IN" ? "ta-IN" : "en-IN")}
                className="text-gray-600 dark:text-gray-300"
                title={`Switch to ${language === "en-IN" ? "Tamil" : "English"}`}
              >
                <Languages size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-white dark:bg-gray-900 text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-md whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-100 text-right ml-10 dark:bg-blue-900 dark:text-white"
                    : "bg-gray-100 mr-10 dark:bg-gray-700 dark:text-gray-200"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="p-2 border-t dark:border-gray-700 flex items-center">
            <input
              className="flex-1 border rounded-l-md px-2 py-1 text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={`Speak or type in ${language === "en-IN" ? "English" : "தமிழ்"}...`}
            />
            <button
              onClick={startListening}
              className={`bg-${isListening ? "red" : "green"}-500 text-white px-2`}
              title="Voice Input"
            >
              <Mic size={16} />
            </button>
            <button
              className="bg-blue-500 text-white px-3 rounded-r-md text-sm"
              onClick={() => handleSend()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
