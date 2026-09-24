"use client";

import { useRouter } from "next/navigation";
import { WEEKLY } from "@/lib/data";
import { cop } from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import { useApp } from "@/lib/store";
import { ReservasTable } from "./ReservasTable";
import { StatTile } from "./StatTile";

function WeeklyChart() {
  return (
    <svg viewBox="0 0 320 140" width="100%" height="140" role="img" aria-label="Reservas por semana">
      {[0, 5, 10, 15].map((g) => {
        const y = 120 - (g / 15) * 100;
        return (
          <g key={"g" + g}>
            <line x1="28" y1={y} x2="312" y2={y} stroke="var(--border)" strokeWidth="1" />
            <text x="0" y={y + 4} fontSize="9" fill="var(--text-muted)">{g}</text>
          </g>
        );
      })}
      {WEEKLY.map((w, i) => {
        const bw = 32, gap = 16, x = 34 + i * (bw + gap);
        const h = (w[1] / 15) * 100;
        const y = 120 - h;
        return (
          <g key={w[0]}>
            <rect x={x} y={y} width={bw} height={h} rx="4" fill="var(--accent)" />
            <text x={x + bw / 2} y={y - 6} fontSize="10" textAnchor="middle" fill="var(--text)" fontWeight="700">{w[1]}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function AdminResumen() {
  const { bookings } = useApp();
  const router = useRouter();
  return (
    <div className="fade-in">
      <div className="admin-head">
        <div><h1>Resumen</h1><p>Vista general de la operación de El Viajero Inquieto.</p></div>
        <span className="badge badge-demo">Datos de demostración</span>
      </div>
      <div className="stat-grid">
        <StatTile label="Reservas este mes" value="34" delta="+12% vs. mes anterior" />
        <StatTile label="Ingresos este mes" value={cop(18240000)} delta="+9% vs. mes anterior" />
        <StatTile label="Tasa de ocupación" value="68%" delta="+5 pts vs. mes anterior" />
        <StatTile label="Próximo check-in" value="Mañana" delta="Familia Gómez · Finca La Serrana" />
      </div>
      <div className="panel">
        <div className="panel-head"><h3>Reservas por semana</h3></div>
        <WeeklyChart />
        <div className="bar-chart-labels" style={{ paddingLeft: 28 }}>
          {WEEKLY.map((w) => <span key={w[0]}>{w[0]}</span>)}
        </div>
      </div>
      <div className="panel">
        <div className="panel-head">
          <h3>Reservas recientes</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push(ROUTES.adminTab("reservas"))}>Ver todas</button>
        </div>
        <ReservasTable rows={bookings.slice(0, 5)} withActions={false} />
      </div>
    </div>
  );
}
