"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

/** Tarjeta de login simulado compartida por el panel administrativo y el de gestión. */
export function LoginCard({ title, subtitle, onLogin }: { title: string; subtitle: string; onLogin: () => void }) {
  const router = useRouter();
  return (
    <div className="login-wrap">
      <div className="login-card fade-in">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/photos/logo-stacked-ink.png" alt="El Viajero Inquieto" style={{ width: 150, margin: "0 auto 22px", display: "block" }} />
        <h2 style={{ textAlign: "center" }}>{title}</h2>
        <p style={{ textAlign: "center" }}>
          {subtitle} · <span className="badge badge-demo" style={{ verticalAlign: "middle" }}>Demo</span>
        </p>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
          <div className="field"><label>Correo</label><input placeholder="equipo@elviajeroinquieto.co" /></div>
          <div className="field"><label>Contraseña</label><input type="password" placeholder="••••••••" /></div>
          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 6 }}>Ingresar</button>
        </form>
        <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }} onClick={() => router.push(ROUTES.home)}>Volver al sitio</button>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 16, textAlign: "center" }}>
          Cualquier dato ingresa en esta demo — la versión final valida credenciales reales.
        </p>
      </div>
    </div>
  );
}
