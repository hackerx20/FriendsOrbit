import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./HomePage.jsx";
import SignUpPage from "./SignUpPage.jsx";
import LoginPage from "./LoginPage.jsx";
import NotificationPage from "./NotificationPage.jsx";
import ProfilePage from "./ProfilePage.jsx";
import Sidebar from "./Sidebar.jsx";
import RightPanel from "./RightPanel.jsx";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
function App() {
  const LoadingSpinner = ({ size = "md" }) => {
    const sizeClass = `loading-${size}`;
    return <span className={`loading loading-spinner ${sizeClass}`} />;
  };
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.error) return null;
        if (!res.ok) {
          throw new Error(data.error || "Something went Wrong");
        }
        console.log("authUser is here:", data);
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false,
  });
  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  return (
    <div className="flex max-w-6xl mx-auto">
      {authUser && <Sidebar />}
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to='/login' />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
        <Route path="/notifications" element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
        <Route path="/profile/:username" element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
      </Routes>
      {authUser && <RightPanel />}
      <Toaster />
    </div>
  )
}

export default App;
