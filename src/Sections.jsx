import { useEffect, useState } from "react";
import { ai, store } from "./firebase.js";
import { useCount, useReveal } from "./hooks.js";
import { works, plans, seedReviews } from "./data.js";

const field = "w-full px-4 py-3 rounded-xl bg-white dark:bg-white/10 border border-ink/10 dark:border-white/20";

function Reveal({ children, className = "" }) {
  const [ref, on] = useReveal();
  return <div ref={ref} className={`transition duration-700 ${on ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"} ${className}`}>{children}</div>;
}

function Stat({ to, suffix = "", label }) {
  const n = useCount(to);
  return <div><b className="font-display text-4xl">{n}</b>{suffix}<p className="text-sm opacity-70">{label}</p></div>;
}

export function Services() {
  const cards = [
    ["🖥️", "Websites", "Fast, mobile-first sites built with clean code. Every page loads under two seconds.", "bg-brand text-white md:row-span-2"],
    ["🤖", "AI assistants", "Chatbots that answer customers at 3 AM.", "bg-white dark:bg-white/10"],
    ["📱", "Web apps", "Dashboards, bookings and stores with login and a database.", "bg-sun text-ink"],
    ["🎨", "Brand and UI design", "Logo, colors and a design system your team can reuse.", "bg-ink text-white dark:bg-white dark:text-ink md:col-span-2"],
  ];
  return (
    <section id="services" className="max-w-6xl mx-auto px-5 py-20">
      <Reveal><h2 className="font-display font-extrabold text-4xl md:text-5xl max-w-xl">Four things we do well</h2></Reveal>
      <div className="mt-10 grid md:grid-cols-2 gap-5">
        {cards.map(([icon, t, d, c]) => (
          <Reveal key={t} className={`rounded-3xl p-8 ${c}`}><div className="text-4xl">{icon}</div><h3 className="font-display font-bold text-2xl mt-3">{t}</h3><p className="mt-2 opacity-90 max-w-sm">{d}</p></Reveal>
        ))}
      </div>
    </section>
  );
}

export function Work() {
  const cats = ["All", "Food", "App", "Brand"];
  const [cat, setCat] = useState("All");
  return (
    <section id="work" className="bg-ink text-white py-20 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display font-extrabold text-4xl md:text-5xl">Recent work</h2>
          <div className="flex gap-2 text-sm">
            {cats.map((c) => <button key={c} onClick={() => setCat(c)} className={`px-4 py-1.5 rounded-full border ${c === cat ? "bg-sun text-ink border-sun" : "border-white/30"}`}>{c}</button>)}
          </div>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {works.filter((w) => cat === "All" || w[1] === cat).map(([n, c, g]) => (
            <div key={n} className={`h-56 rounded-3xl bg-gradient-to-br ${g} p-6 flex flex-col justify-end hover:-translate-y-1 transition`}>
              <h3 className="font-display font-bold text-2xl">{n}</h3><p className="text-sm opacity-90">{c} project</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Pricing() {
  const [yearly, setYearly] = useState(false);
  return (
    <section id="pricing" className="max-w-6xl mx-auto px-5 py-20">
      <div className="text-center">
        <h2 className="font-display font-extrabold text-4xl md:text-5xl">Simple pricing</h2>
        <div className="inline-flex mt-6 p-1 rounded-full bg-white dark:bg-white/10 text-sm font-bold">
          {[["Monthly", false], ["Yearly −20%", true]].map(([l, v]) => (
            <button key={l} onClick={() => setYearly(v)} className={`px-5 py-2 rounded-full ${yearly === v ? "bg-ink text-white dark:bg-sun dark:text-ink" : ""}`}>{l}</button>
          ))}
        </div>
      </div>
      <div className="mt-10 grid md:grid-cols-3 gap-5">
        {plans.map((p) => (
          <div key={p.name} className={`rounded-3xl p-8 ${p.hot ? "bg-brand text-white md:scale-105 shadow-2xl" : "bg-white dark:bg-white/10"}`}>
            <h3 className="font-display font-bold text-2xl">{p.name}</h3>
            <p className="mt-3"><b className="font-display text-5xl">${Math.round(p.price * (yearly ? 0.8 : 1))}</b> /project</p>
            <ul className="mt-5 space-y-2 text-sm">{p.features.map((f) => <li key={f}>✓ {f}</li>)}</ul>
            <a href="#contact" className={`mt-6 block text-center py-3 rounded-full font-bold ${p.hot ? "bg-white text-ink" : "bg-ink text-white dark:bg-sun dark:text-ink"}`}>Choose {p.name}</a>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Reviews({ user, toast }) {
  const [list, setList] = useState([]);
  const [f, setF] = useState({ name: "", stars: 5, text: "" });
  useEffect(() => store.listen("reviews", setList), []);
  useEffect(() => { if (user) setF((s) => ({ ...s, name: user.displayName })); }, [user]);
  const submit = async (e) => {
    e.preventDefault();
    if (import.meta.env.VITE_FB_API_KEY && !user) return toast("Review ke liye pehle sign in karo");
    try {
      await store.add("reviews", { ...f, stars: +f.stars, uid: user?.uid || null });
      setF({ ...f, text: "" });
      toast("Review posted ✓");
    } catch (er) { toast("Save nahi hua: " + er.message); }
  };
  return (
    <section id="reviews" className="bg-white dark:bg-white/5 py-20 px-5">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-10">
        <div>
          <h2 className="font-display font-extrabold text-4xl">What clients say</h2>
          <p className="mt-3 opacity-70 text-sm">Reviews are saved live in Firebase. Sign in and add yours.</p>
          <form onSubmit={submit} className="mt-6 space-y-3">
            <input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Your name" className={field} />
            <select value={f.stars} onChange={(e) => setF({ ...f, stars: e.target.value })} className={field}><option value="5">★★★★★</option><option value="4">★★★★☆</option><option value="3">★★★☆☆</option></select>
            <textarea required rows="3" value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} placeholder="Your review" className={field} />
            <button className="w-full py-3 rounded-xl bg-brand text-white font-bold">Post review</button>
          </form>
        </div>
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4 content-start">
          {[...list, ...seedReviews].map((r, i) => (
            <figure key={i} className="p-5 rounded-2xl bg-mist dark:bg-ink">
              <div className="text-sun">{"★".repeat(r.stars)}</div>
              <blockquote className="mt-2 text-sm">{r.text}</blockquote>
              <figcaption className="mt-3 font-bold text-sm">{r.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact({ toast }) {
  const [f, setF] = useState({ name: "", email: "", phone: "", message: "" });
  const submit = async (e) => {
    e.preventDefault();
    try {
      await store.add("messages", f);
      setF({ name: "", email: "", phone: "", message: "" });
      toast("Message sent. We reply within a day.");
    } catch (er) { toast("Save nahi hua: " + er.message); }
  };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <section id="contact" className="max-w-3xl mx-auto px-5 py-20">
      <h2 className="font-display font-extrabold text-4xl md:text-5xl text-center">Tell us about your project</h2>
      <form onSubmit={submit} className="mt-10 grid sm:grid-cols-2 gap-4">
        <input required value={f.name} onChange={set("name")} placeholder="Name" className={field} />
        <input required type="email" value={f.email} onChange={set("email")} placeholder="Email" className={field} />
        <input required type="tel" value={f.phone} onChange={set("phone")} placeholder="Phone number" className={`${field} sm:col-span-2`} />
        <textarea required rows="4" value={f.message} onChange={set("message")} placeholder="What do you want to build?" className={`${field} sm:col-span-2`} />
        <button className="sm:col-span-2 py-3 rounded-xl bg-ink text-white dark:bg-sun dark:text-ink font-bold">Send message</button>
      </form>
    </section>
  );
}

export function Footer({ toast }) {
  const [email, setEmail] = useState("");
  const join = async (e) => { e.preventDefault(); try { await store.add("subscribers", { email }); setEmail(""); toast("You are subscribed ✓"); } catch (er) { toast("Save nahi hua: " + er.message); } };
  return (
    <footer className="border-t border-ink/10 dark:border-white/10 py-8 px-5 text-center text-sm opacity-80">
      © 2026 Nexora. Built for a frontend hackathon.
      <form onSubmit={join} className="mt-4 inline-flex gap-2">
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Newsletter email" className="px-4 py-2 rounded-full bg-white dark:bg-white/10 border border-ink/10 dark:border-white/20" />
        <button className="px-4 rounded-full bg-brand text-white font-bold">Join</button>
      </form>
    </footer>
  );
}

export function Chat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ me: false, t: "Hi! Ask me about pricing, timelines or features." }]);
  const [v, setV] = useState("");
  const send = async (e) => {
    e.preventDefault();
    const q = v; setV("");
    setMsgs((m) => [...m, { me: true, t: q }, { me: false, t: "…" }]);
    const a = (await ai(q, "You are Nexora's support bot. Plans: Starter $299, Growth $699, Scale $1499. Launch in about 7 days. Reply in under 40 words, same language as the user.")).text;
    setMsgs((m) => [...m.slice(0, -1), { me: false, t: a }]);
  };
  return (
    <>
      <button onClick={() => setOpen(!open)} aria-label="Open chat" className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-brand text-white text-2xl shadow-xl">💬</button>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm h-[28rem] flex flex-col rounded-3xl bg-white dark:bg-ink border border-ink/10 dark:border-white/20 shadow-2xl overflow-hidden">
          <div className="px-4 py-3 bg-brand text-white font-bold">Nexora Assistant</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
            {msgs.map((m, i) => <div key={i} className={`max-w-[85%] p-3 rounded-2xl ${m.me ? "ml-auto bg-brand text-white" : "bg-mist dark:bg-white/10"}`}>{m.t}</div>)}
          </div>
          <form onSubmit={send} className="p-3 flex gap-2 border-t border-ink/10 dark:border-white/10">
            <input required value={v} onChange={(e) => setV(e.target.value)} placeholder="Ask about pricing, time…" className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-mist dark:bg-white/10" />
            <button className="px-4 rounded-xl bg-ink text-white dark:bg-sun dark:text-ink font-bold">Send</button>
          </form>
        </div>
      )}
    </>
  );
}
