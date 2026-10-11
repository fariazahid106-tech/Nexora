import { useEffect, useRef, useState } from "react";

export function useTheme() {
  const [dark, setDark] = useState(localStorage.theme === "dark");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.theme = dark ? "dark" : "light";
  }, [dark]);
  return [dark, () => setDark((d) => !d)];
}

export function useToast() {
  const [msg, setMsg] = useState("");
  const show = (t) => { setMsg(t); setTimeout(() => setMsg(""), 2500); };
  return [msg, show];
}

export function useCount(to) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN((v) => (v + Math.ceil(to / 40) >= to ? (clearInterval(id), to) : v + Math.ceil(to / 40))), 30);
    return () => clearInterval(id);
  }, [to]);
  return n;
}

export function useReveal() {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setOn(true), io.disconnect()), { threshold: 0.15 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, on];
}
