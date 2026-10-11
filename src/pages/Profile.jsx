import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { Avatar } from "../Navbar.jsx";
import { logout, renameUser, store, authError, saveProfile, getProfile } from "../firebase.js";

export default function Profile({ toast }) {
  const { user, loading, refresh } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [mine, setMine] = useState([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (user) { setName(user.displayName || ""); getProfile(user.uid).then((p) => setPhone(p?.phone || "")).catch(() => {}); } }, [user]);
  useEffect(() => store.listen("reviews", (all) => setMine(all.filter((r) => r.uid && r.uid === user?.uid))), [user]);

  if (loading) return <div className="min-h-screen grid place-items-center"><span className="w-10 h-10 rounded-full border-4 border-brand border-t-transparent animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await renameUser(name.trim()); await saveProfile(user.uid, { name: name.trim(), email: user.email, phone: phone.trim() }); refresh(); toast("Profile updated ✓"); } catch (er) { toast(authError(er)); }
    setBusy(false);
  };
  const since = user.created ? new Date(user.created).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "—";
  const stat = [["Reviews posted", mine.length], ["Sign-in method", user.provider === "google.com" ? "Google" : "Email"], ["Member since", since]];

  return (
    <main className="min-h-screen pt-28 pb-16 px-5">
      <div className="max-w-4xl mx-auto">
        <div className="card p-8 flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-brand/10 to-sun/10">
          <Avatar user={user} size="w-24 h-24 text-4xl" />
          <div className="text-center sm:text-left flex-1">
            <h1 className="font-display font-extrabold text-3xl">{user.displayName || "Your profile"}</h1>
            <p className="opacity-70">{user.email}</p>
          </div>
          <button onClick={async () => { await logout(); nav("/"); }} className="btn-dark">Log out</button>
        </div>

        <div className="mt-5 grid sm:grid-cols-3 gap-4">
          {stat.map(([l, v]) => <div key={l} className="card p-5"><p className="text-sm opacity-70">{l}</p><p className="font-display font-bold text-xl mt-1">{v}</p></div>)}
        </div>

        <div className="mt-5 grid md:grid-cols-2 gap-5">
          <form onSubmit={save} className="card p-6 space-y-4">
            <h2 className="font-display font-bold text-xl">Edit profile</h2>
            <div><label htmlFor="pn" className="text-sm font-bold">Display name</label><input id="pn" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} className="input mt-1" /></div>
            <div><label htmlFor="pph" className="text-sm font-bold">Phone number</label><input id="pph" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input mt-1" placeholder="03XX XXXXXXX" /></div>
            <div><label className="text-sm font-bold">Email</label><input disabled value={user.email || ""} className="input mt-1 opacity-60" /></div>
            <button disabled={busy} className="btn-brand !rounded-xl w-full disabled:opacity-60">{busy ? "Saving…" : "Save changes"}</button>
          </form>
          <div className="card p-6">
            <h2 className="font-display font-bold text-xl">Your reviews</h2>
            {mine.length ? <ul className="mt-4 space-y-3">{mine.slice(0, 4).map((r, i) => <li key={i} className="p-3 rounded-xl bg-mist dark:bg-ink/60 text-sm"><span className="text-sun">{"★".repeat(r.stars)}</span><p className="mt-1">{r.text}</p></li>)}</ul>
              : <div className="mt-4 text-sm opacity-80"><p>Abhi tak koi review nahi.</p><Link to="/#reviews" onClick={() => setTimeout(() => (location.href = "/#reviews"))} className="btn-ghost mt-4">Write a review</Link></div>}
          </div>
        </div>
      </div>
    </main>
  );
}
