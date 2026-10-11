import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTheme, useToast } from "./hooks.js";
import { AuthProvider } from "./auth.jsx";
import Navbar from "./Navbar.jsx";
import Hero from "./Hero.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import Profile from "./pages/Profile.jsx";
import { Services, Work, Pricing, Reviews, Contact, Footer, Chat } from "./Sections.jsx";
import { useAuth } from "./auth.jsx";
import { live } from "./firebase.js";

function Home({ toast }) {
  const { user } = useAuth();
  return (<main><Hero toast={toast} /><Services /><Work /><Pricing /><Reviews user={user} toast={toast} /><Contact toast={toast} /></main>);
}

function Shell() {
  const [dark, toggleTheme] = useTheme();
  const [msg, toast] = useToast();
  return (
    <>
      <Navbar dark={dark} toggleTheme={toggleTheme} />
      {!live && <p className="fixed bottom-3 left-3 z-40 text-xs px-3 py-1.5 rounded-full bg-sun text-ink font-bold">Demo mode: Firebase keys missing, data sirf is browser mein save ho raha hai</p>}
      <Routes>
        <Route path="/" element={<Home toast={toast} />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/profile" element={<Profile toast={toast} />} />
        <Route path="*" element={<Home toast={toast} />} />
      </Routes>
      <Footer toast={toast} />
      <Chat />
      <div role="status" className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-ink text-white dark:bg-white dark:text-ink font-bold shadow-xl transition pointer-events-none ${msg ? "opacity-100" : "opacity-0"}`}>{msg}</div>
    </>
  );
}

export default function App() {
  return (<BrowserRouter><AuthProvider><Shell /></AuthProvider></BrowserRouter>);
}
