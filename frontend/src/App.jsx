import { Navigate, Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage";
import LogInPage from "./pages/LogInPage";
import SignUpPage from "./pages/SignUpPage";
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
    <div className="h-screen w-screen bg-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute top-0 -left-4 size-96 bg-violet-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-emerald-500 opacity-20 blur-[100px]" />

      <Routes>
        <Route path="/" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
        <Route path="/login" element={authUser ? <Navigate to="/" /> : <LogInPage />} />
        <Route path="/signup" element={authUser ? <Navigate to="/" /> : <SignUpPage />} />
      </Routes>
      <Toaster />
    </div>
  );
}
export default App;
