import { createContext, useContext, useEffect, useState } from "react";
import { watchAuth, currentUser } from "./firebase.js";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => watchAuth((u) => { setUser(u); setLoading(false); }), []);
  return <Ctx.Provider value={{ user, loading, refresh: () => setUser(currentUser()) }}>{children}</Ctx.Provider>;
}
