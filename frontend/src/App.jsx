import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

// Pages
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import ProfilePage from "./pages/profile/ProfilePage";
import MessagesPage from "./pages/messages/MessagesPage";
import AIChatPage from "./pages/ai-chat/AIChatPage";

// Components
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Context
import { SocketProvider } from "./context/SocketContext";

function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.error) return null;
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center bg-base-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex max-w-7xl mx-auto min-h-screen bg-base-100">
      {authUser ? (
        <SocketProvider>
          <Sidebar />
          <div className="flex-1 flex">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/messages/:userId" element={<MessagesPage />} />
              <Route path="/ai-chat" element={<AIChatPage />} />
              <Route path="/ai-chat/:sessionId" element={<AIChatPage />} />
              <Route path="/login" element={<Navigate to="/" />} />
              <Route path="/signup" element={<Navigate to="/" />} />
            </Routes>
            <RightPanel />
          </div>
        </SocketProvider>
      ) : (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--fallback-b1,oklch(var(--b1)/1))',
            color: 'var(--fallback-bc,oklch(var(--bc)/1))',
            border: '1px solid var(--fallback-b3,oklch(var(--b3)/1))'
          }
        }}
      />
    </div>
  );
}

export default App;