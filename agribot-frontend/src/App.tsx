import AppRoutes from './AppRoute';
import './App.css';
import ChatBot from "./components/ChatBot";
import { useUser } from "@clerk/clerk-react";

export default function App() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return <div>Loading...</div>; // Wait until Clerk loads

  return (
    <>
      <AppRoutes />
      {isSignedIn && <ChatBot />}
    </>
  );
}
