import { Navigate, Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage";
import LandingPage from "./pages/LandingPage";
import LogInPage from "./pages/LogInPage";
import SignUpPage from "./pages/SignUpPage";
import VideoCallPage from "./pages/VideoCallPage";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import PageLoader from "./components/PageLoader";
import { Toaster } from "react-hot-toast";

function App() {
  const { checkAuth, authUser, isCheckingAuth } = useAuthStore();
  useEffect(() => {
    // Call once on mount to avoid dependency re-renders
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (isCheckingAuth) return <PageLoader />
  return (
    <div className="min-h-screen w-screen wa-app wa-wallpaper relative">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
        <Route path="/video-call" element={authUser ? <VideoCallPage /> : <Navigate to="/login" />} />
        <Route path="/login" element={authUser ? <Navigate to="/chat" /> : <LogInPage />} />
        <Route path="/signup" element={authUser ? <Navigate to="/chat" /> : <SignUpPage />} />
      </Routes>
      <Toaster />
    </div>
  );
}
export default App;
