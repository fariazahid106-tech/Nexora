import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import { logout } from "./firebase.js";

export const Avatar = ({ user, size = "w-9 h-9" }) =>
  user.photoURL ? <img src={user.photoURL} alt="" className={`${size} rounded-full object-cover`} referrerPolicy="no-referrer" />
  : <span className={`${size} rounded-full bg-brand text-white grid place-items-center font-bold`}>{(user.displayName || user.email || "?")[0].toUpperCase()}</span>;

export default function Navbar({ dark, toggleTheme }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const links = ["Services", "Work", "Pricing", "Reviews", "Contact"];
  const out = async () => { await logout(); setOpen(false); nav("/"); };
  return (
    <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-xl bg-mist/80 dark:bg-ink/80 border-b border-ink/10 dark:border-white/10">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-5 h-16">
        <Link to="/" className="font-display font-extrabold text-2xl">Nexora<span className="text-brand">.</span></Link>
        <div className="hidden md:flex gap-8 text-sm font-medium">
          {links.map((l) => <a key={l} href={`/#${l.toLowerCase()}`} className="opacity-75 hover:opacity-100 hover:text-brand transition">{l}</a>)}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} aria-label="Toggle dark mode" className="w-10 h-10 rounded-full border border-ink/15 dark:border-white/20">{dark ? "☀️" : "🌙"}</button>
          {user ? (
            <>
              <Link to="/profile" className="hidden sm:flex items-center gap-2 pl-1 pr-4 h-10 rounded-full border border-ink/15 dark:border-white/20 hover:border-brand">
                <Avatar user={user} size="w-8 h-8" /><span className="text-sm font-bold">Profile</span>
              </Link>
              <button onClick={out} className="hidden sm:inline-flex btn-dark !py-2">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-flex btn-ghost !py-2">Log in</Link>
              <Link to="/signup" className="hidden sm:inline-flex btn-brand !py-2">Sign up</Link>
            </>
          )}
          <button onClick={() => setOpen(!open)} aria-label="Menu" className="md:hidden w-10 h-10 text-xl">{open ? "✕" : "☰"}</button>
        </div>
      </nav>
      {open && (
        <div className="md:hidden flex flex-col gap-1 px-5 pb-5 text-sm font-medium border-t border-ink/10 dark:border-white/10" onClick={() => setOpen(false)}>
          {links.map((l) => <a key={l} href={`/#${l.toLowerCase()}`} className="py-2">{l}</a>)}
          {user ? (<><Link to="/profile" className="py-2 font-bold text-brand">My profile</Link><button onClick={out} className="py-2 text-left">Log out</button></>)
            : (<div className="flex gap-2 pt-2"><Link to="/login" className="btn-ghost flex-1">Log in</Link><Link to="/signup" className="btn-brand flex-1">Sign up</Link></div>)}
        </div>
      )}
    </header>
  );
}
