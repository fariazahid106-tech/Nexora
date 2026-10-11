import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, setDoc, getDoc } from "firebase/firestore";

const env = import.meta.env;
const cfg = { apiKey: env.VITE_FB_API_KEY, authDomain: env.VITE_FB_AUTH_DOMAIN, projectId: env.VITE_FB_PROJECT_ID, appId: env.VITE_FB_APP_ID };

// If .env is empty the app runs in demo mode (localStorage) so it never breaks.
export const live = Boolean(cfg.apiKey);
const app = live ? initializeApp(cfg) : null;
const auth = live ? getAuth(app) : null;
const db = live ? getFirestore(app) : null;

// users/{uid} document: name, email, phone, ... (saved in Firestore, not only in Auth)
export const saveProfile = (uid, data) => setDoc(doc(db, "users", uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
export const getProfile = async (uid) => { const s = await getDoc(doc(db, "users", uid)); return s.exists() ? s.data() : null; };
export async function googleLogin() {
  const c = await signInWithPopup(auth, new GoogleAuthProvider());
  if (!(await getProfile(c.user.uid))) await saveProfile(c.user.uid, { name: c.user.displayName || "", email: c.user.email, phone: "", provider: "google", createdAt: serverTimestamp() });
}
export const logout = () => signOut(auth);
export const signin = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
export const resetPass = (email) => sendPasswordResetEmail(auth, email);
export const renameUser = (name) => updateProfile(auth.currentUser, { displayName: name });
// Sign up, save the name, then sign out so the user lands on the Login page.
export async function signup(name, email, pw, phone = "") {
  const c = await createUserWithEmailAndPassword(auth, email, pw);
  await updateProfile(c.user, { displayName: name });
  await saveProfile(c.user.uid, { name, email, phone, provider: "password", createdAt: serverTimestamp() }); // while signed in
  await signOut(auth);
}
export const pickUser = (u) => u && { uid: u.uid, displayName: u.displayName, email: u.email, photoURL: u.photoURL, created: u.metadata?.creationTime, provider: u.providerData?.[0]?.providerId };
export const currentUser = () => pickUser(auth?.currentUser);
export const watchAuth = (cb) => (live ? onAuthStateChanged(auth, (u) => cb(pickUser(u))) : (cb(null), () => {}));

const ERR = {
  "auth/invalid-credential": "Email ya password galat hai.",
  "auth/user-not-found": "Is email ka account nahi mila. Pehle sign up karo.",
  "auth/wrong-password": "Password galat hai.",
  "auth/email-already-in-use": "Ye email pehle se registered hai. Login karo.",
  "auth/weak-password": "Password kam az kam 6 characters ka rakho.",
  "auth/invalid-email": "Email sahi format mein likho.",
  "auth/operation-not-allowed": "Ye sign-in method Firebase Console > Authentication > Sign-in method mein enable nahi hai.",
  "auth/popup-closed-by-user": "Google popup band ho gaya. Dobara try karo.",
  "auth/unauthorized-domain": "Is domain ko Firebase > Authentication > Settings > Authorized domains mein add karo.",
  "auth/network-request-failed": "Internet check karo.",
  "auth/too-many-requests": "Bohat attempts ho gaye. Thori der baad try karo.",
  "auth/invalid-api-key": ".env mein VITE_FB_API_KEY galat hai.",
};
export const authError = (e) => ERR[e.code] || `${e.code || e.message}`;

export const store = {
  async add(col, data) {
    if (live) {
      try { return await addDoc(collection(db, col), { ...data, createdAt: serverTimestamp() }); }
      catch (e) { console.error("Firestore save failed:", e); throw new Error(e.code === "permission-denied" ? "Firestore rules ne block kiya (rules publish karo)" : e.code || e.message); }
    }
    const list = JSON.parse(localStorage.getItem(col) || "[]");
    localStorage.setItem(col, JSON.stringify([data, ...list]));
    window.dispatchEvent(new Event("st-" + col));
  },
  listen(col, cb) {
    if (live) return onSnapshot(query(collection(db, col), orderBy("createdAt", "desc")), (s) => cb(s.docs.map((d) => d.data())));
    const f = () => cb(JSON.parse(localStorage.getItem(col) || "[]"));
    window.addEventListener("st-" + col, f);
    f();
    return () => window.removeEventListener("st-" + col, f);
  },
};

// AI: Gemini if key works, otherwise offline fallback. Returns { text, live, err } so the UI can show why.
export async function ai(prompt, system, mode = "chat") {
  const key = env.VITE_GEMINI_KEY;
  let err = key ? "" : "VITE_GEMINI_KEY .env mein nahi mili";
  if (key) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: "user", parts: [{ text: prompt }] }] }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.message || r.status);
      return { text: j.candidates[0].content.parts.map((p) => p.text).join(""), live: true, err: "" };
    } catch (e) { err = String(e.message).slice(0, 140); }
  }
  const p = prompt.toLowerCase();
  let text;
  if (mode === "plan") text = `Plan for "${prompt}"\n\n1. Home: big photo + one clear Order/Book button\n2. Products or services with prices\n3. Reviews + WhatsApp button\n4. Contact form saved in Firebase\n\nSuggested package: Growth ($699), ready in about 7 days.`;
  else if (/price|cost|kitn|rate/.test(p)) text = "Starter is $299, Growth $699 and Scale $1499. Yearly billing saves 20%.";
  else if (/time|day|kab|long/.test(p)) text = "Most sites launch in 7 days. Bigger apps take 3 to 4 weeks.";
  else if (/firebase|login|database/.test(p)) text = "Yes, Growth and Scale include Firebase login and a Firestore database.";
  else text = "I can help with pricing, timelines and features. Or leave your email in the contact form.";
  return { text, live: false, err };
}
