import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { live, signup, signin, googleLogin, resetPass, authError } from "../firebase.js";

export default function AuthPage({ mode }) {
  const isSignup = mode === "signup";
  const { user } = useAuth();
  const nav = useNavigate();
  const { state } = useLocation();
  const [f, setF] = useState({ name: "", phone: "", email: "", pw: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState(state?.created ? "Account ban gaya! Ab login karo." : "");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (user && !busy) return <Navigate to="/profile" replace />;

  const guard = async (fn) => {
    setErr(""); setInfo(""); setBusy(true);
    if (!live) { setErr(".env mein Firebase keys nahi hain. README ya chat wale steps follow karo."); return setBusy(false); }
    try { await fn(); } catch (e) { setErr(authError(e)); setBusy(false); }
  };
  const submit = (e) => { e.preventDefault(); guard(async () => {
    if (isSignup) { await signup(f.name.trim(), f.email, f.pw, f.phone.trim()); setBusy(false); nav("/login", { state: { created: true }, replace: true }); }
    else { await signin(f.email, f.pw); setBusy(false); nav("/profile", { replace: true }); }
  }); };
  const google = () => guard(async () => { await googleLogin(); setBusy(false); nav("/profile", { replace: true }); });
  const forgot = () => f.email ? guard(async () => { await resetPass(f.email); setInfo("Reset link email par bhej diya."); setBusy(false); }) : setErr("Pehle email likho.");

  return (
    <main className="min-h-screen grid lg:grid-cols-2 pt-16">
      <aside className="hidden lg:flex flex-col justify-between p-14 bg-gradient-to-br from-brand to-indigo-900 text-white relative overflow-hidden">
        <div className="blob absolute -bottom-20 -right-20 w-96 h-96 rounded-[40%] bg-sun/30 blur-2xl" />
        <p className="font-display font-extrabold text-3xl">Nexora<span className="text-sun">.</span></p>
        <div className="relative">
          <h2 className="font-display font-extrabold text-5xl leading-tight">{isSignup ? "Start building in minutes." : "Good to see you again."}</h2>
          <ul className="mt-8 space-y-3 opacity-90">
            {["Save reviews and project requests", "Free AI website planner", "Your profile, always in sync"].map((t) => <li key={t}>✓ {t}</li>)}
          </ul>
        </div>
        <p className="relative text-sm opacity-70">© 2026 Nexora</p>
      </aside>
      <section className="flex items-center justify-center px-5 py-12">
        <form onSubmit={submit} className="w-full max-w-md">
          <h1 className="font-display font-extrabold text-4xl">{isSignup ? "Create your account" : "Log in"}</h1>
          <p className="mt-2 opacity-70 text-sm">{isSignup ? "Already registered? " : "New here? "}
            <Link className="text-brand font-bold" to={isSignup ? "/login" : "/signup"}>{isSignup ? "Log in" : "Sign up"}</Link></p>

          {info && <p role="status" className="mt-5 p-3 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm">{info}</p>}
          {err && <p role="alert" className="mt-5 p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-sm">{err}</p>}

          <button type="button" onClick={google} disabled={busy} className="btn-ghost w-full mt-6 !rounded-xl"><b className="text-brand">G</b> Continue with Google</button>
          <div className="my-6 flex items-center gap-3 text-xs opacity-60"><hr className="flex-1 border-current/30" />or with email<hr className="flex-1 border-current/30" /></div>

          <div className="space-y-4">
            {isSignup && <div><label className="text-sm font-bold" htmlFor="n">Full name</label><input id="n" required minLength={2} value={f.name} onChange={set("name")} className="input mt-1" placeholder="Ayesha Khan" autoComplete="name" /></div>}
            {isSignup && <div><label className="text-sm font-bold" htmlFor="ph">Phone number</label><input id="ph" required type="tel" pattern="[0-9+ ]{10,15}" value={f.phone} onChange={set("phone")} className="input mt-1" placeholder="03XX XXXXXXX" autoComplete="tel" /></div>}
            <div><label className="text-sm font-bold" htmlFor="e">Email</label><input id="e" required type="email" value={f.email} onChange={set("email")} className="input mt-1" placeholder="you@example.com" autoComplete="email" /></div>
            <div>
              <div className="flex justify-between"><label className="text-sm font-bold" htmlFor="p">Password</label>
                {!isSignup && <button type="button" onClick={forgot} className="text-xs text-brand font-bold">Forgot?</button>}</div>
              <div className="relative"><input id="p" required minLength={6} type={show ? "text" : "password"} value={f.pw} onChange={set("pw")} className="input mt-1 pr-16" placeholder="Min 6 characters" autoComplete={isSignup ? "new-password" : "current-password"} />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold opacity-70">{show ? "Hide" : "Show"}</button></div>
            </div>
          </div>
          <button disabled={busy} className="btn-brand w-full mt-6 !rounded-xl !py-3.5 disabled:opacity-60">{busy ? "Please wait…" : isSignup ? "Create account" : "Log in"}</button>
        </form>
      </section>
    </main>
  );
}
