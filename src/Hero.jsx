import { useState } from "react";
import { Link } from "react-router-dom";
import { ai } from "./firebase.js";
import { useCount } from "./hooks.js";
import { useAuth } from "./auth.jsx";

const Stat = ({ to, suffix = "", label }) => { const n = useCount(to); return <div className="card p-5 text-center"><b className="font-display text-4xl">{n}</b><span className="text-2xl font-bold">{suffix}</span><p className="text-sm opacity-70 mt-1">{label}</p></div>; };

export default function Hero({ toast }) {
  const { user } = useAuth();
  const [biz, setBiz] = useState("");
  const [out, setOut] = useState({ text: "Your plan will appear here.", live: null, err: "" });
  const [busy, setBusy] = useState(false);
  const run = async (v = biz) => {
    if (!v.trim()) return toast("Pehle business likho");
    setBiz(v); setBusy(true);
    setOut(await ai(v, "You are a web strategist. Give a short numbered website plan (max 6 lines) and a package suggestion for this business.", "plan"));
    setBusy(false);
  };
  return (
    <section className="relative overflow-hidden pt-32 pb-16 px-5">
      <div className="blob absolute -top-16 -right-24 w-[28rem] h-[28rem] rounded-[40%] bg-brand/20 blur-2xl" />
      <div className="blob absolute bottom-0 -left-24 w-80 h-80 rounded-[45%] bg-sun/30 blur-2xl" style={{ animationDelay: "-4s" }} />
      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sun text-ink text-sm font-bold mb-5">
            <span className="w-2 h-2 rounded-full bg-ink animate-pulse" />
            {user ? `Welcome back, ${(user.displayName || "friend").split(" ")[0]}` : "Booking projects for November"}
          </p>
          <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-[1.02] tracking-tight">We build sites your customers actually finish reading.</h1>
          <p className="mt-6 text-lg max-w-lg opacity-80">Design, development and AI tools for small businesses. Tell us what you sell and get a free plan in 10 seconds.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#contact" className="btn-brand !px-7 !py-3.5">Start a project</a>
            {user ? <Link to="/profile" className="btn-ghost !px-7 !py-3.5">My profile</Link> : <Link to="/signup" className="btn-ghost !px-7 !py-3.5">Create free account</Link>}
          </div>
          <div className="mt-8 flex items-center gap-3 text-sm">
            <div className="flex -space-x-2">{["A", "H", "Z", "S"].map((c, i) => <span key={c} className={`w-8 h-8 rounded-full border-2 border-mist dark:border-ink grid place-items-center text-xs font-bold text-white ${["bg-brand", "bg-orange-500", "bg-emerald-500", "bg-pink-500"][i]}`}>{c}</span>)}</div>
            <p className="opacity-80"><b>4.9/5</b> from 48 happy brands</p>
          </div>
        </div>
        <div className="card p-6 shadow-2xl shadow-brand/10">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl">Free AI website plan</h2>
            <span title={out.err} className={`text-xs font-bold px-2.5 py-1 rounded-full ${out.live ? "bg-emerald-500/15 text-emerald-600" : out.live === false ? "bg-amber-500/15 text-amber-600" : "bg-ink/10 dark:bg-white/10"}`}>
              {out.live ? "● Gemini live" : out.live === false ? "● Offline mode" : "● AI ready"}
            </span>
          </div>
          <p className="text-sm opacity-70 mb-4">Describe your business in one line.</p>
          <div className="flex gap-2">
            <input value={biz} onChange={(e) => setBiz(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()} className="input flex-1 min-w-0" placeholder="e.g. Home bakery in Karachi" />
            <button onClick={() => run()} disabled={busy} className="btn-dark !rounded-xl disabled:opacity-60">{busy ? "…" : "Plan it"}</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">{["Home bakery", "Gym & fitness", "Clothing brand"].map((c) => <button key={c} onClick={() => run(c)} className="text-xs px-3 py-1 rounded-full border border-ink/15 dark:border-white/20 hover:border-brand hover:text-brand">{c}</button>)}</div>
          <pre className="mt-4 whitespace-pre-wrap font-sans text-sm min-h-[130px] p-4 rounded-2xl bg-mist dark:bg-ink/60 border border-ink/5 dark:border-white/10">{out.text}</pre>
          {out.live === false && out.err && <p className="mt-2 text-xs text-amber-600 break-words">AI error: {out.err}</p>}
        </div>
      </div>
      <div className="relative max-w-6xl mx-auto mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat to={120} suffix="+" label="Projects shipped" /><Stat to={48} label="Happy brands" /><Stat to={97} suffix="%" label="Lighthouse score" /><Stat to={7} suffix=" days" label="Average launch" />
      </div>
    </section>
  );
}
