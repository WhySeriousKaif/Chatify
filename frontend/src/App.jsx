import { Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage";
import LogInPage from "./pages/LogInPage";
import SignUpPage from "./pages/SignUpPage";
import { useAuthStore } from "./store/useAuthStore";

function App() {
  const { login, authUser, isLoggedIn } = useAuthStore();
  console.log("authUser", authUser);
  console.log("isLoggedIn", isLoggedIn);

  return (
    <div className="min-h-screen bg-slate-900 relative flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute top-0 -left-4 size-96 bg-violet-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-emerald-500 opacity-20 blur-[100px]" />

      <button onClick={login} className="z-10">Login</button>
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/login" element={<LogInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </div>
  );
}
export default App;
