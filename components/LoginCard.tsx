"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { ROUTES } from "@/lib/routes";
import { GESTION_ONLY } from "@/lib/release";

/**
 * Tarjeta de login compartida por el panel administrativo y el de gestión.
 * Una sola sesión abre ambos paneles; si ya hay sesión, pasa directo a `next`.
 */
export function LoginCard({ title, subtitle, next }: { title: string; subtitle: string; next: string }) {
  const { authStatus, login } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (authStatus === "authed") router.replace(next);
  }, [authStatus, next, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const err = await login(email, password);
    setBusy(false);
    if (err) setError(err);
  };

  return (
    <div className="login-wrap">
      <div className="login-card fade-in">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/photos/logo-stacked-ink.png" alt="El Viajero Inquieto" style={{ width: 150, margin: "0 auto 22px", display: "block" }} />
        <h2 style={{ textAlign: "center" }}>{title}</h2>
        <p style={{ textAlign: "center" }}>{subtitle}</p>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="login-email">Correo</label>
            <input id="login-email" type="email" autoComplete="username" required value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="equipo@elviajeroinquieto.co" />
          </div>
          <div className="field">
            <label htmlFor="login-password">Contraseña</label>
            <input id="login-password" type="password" autoComplete="current-password" required value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <p role="alert" style={{ color: "#B3261E", fontSize: 13.5, margin: "0 0 10px" }}>{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 6 }}
            disabled={busy || authStatus === "checking"}>
            {busy ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
        {!GESTION_ONLY && <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }} onClick={() => router.push(ROUTES.home)}>Volver al sitio</button>}
      </div>
    </div>
  );
}
