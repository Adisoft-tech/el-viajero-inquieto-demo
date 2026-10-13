"use client";

import { useRouter } from "next/navigation";
import { cop } from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import { useAdminBookings, type AdminStats } from "./adminData";
import { ReservasTable } from "./ReservasTable";
import { StatTile } from "./StatTile";

function WeeklyChart({ weeks }: { weeks: AdminStats["weeks"] }) {
  const max = Math.max(5, ...weeks.map((w) => w.count));
  const top = Math.ceil(max / 5) * 5;
  const grid = [0, top / 5, (top * 2) / 5, (top * 3) / 5, (top * 4) / 5, top].filter((g, i, a) => a.indexOf(g) === i && Number.isInteger(g));
  return (
    <svg viewBox="0 0 320 140" width="100%" height="140" role="img" aria-label="Llegadas por semana">
      {grid.map((g) => {
        const y = 120 - (g / top) * 100;
        return (
          <g key={"g" + g}>
            <line x1="28" y1={y} x2="312" y2={y} stroke="var(--border)" strokeWidth="1" />
            <text x="0" y={y + 4} fontSize="9" fill="var(--text-muted)">{g}</text>
          </g>
        );
      })}
      {weeks.map((w, i) => {
        const bw = 32, gap = 16, x = 34 + i * (bw + gap);
        const h = (w.count / top) * 100;
        const y = 120 - h;
        return (
          <g key={w.label + i}>
            <rect x={x} y={y} width={bw} height={Math.max(h, 0)} rx="4" fill="var(--accent)" />
            <text x={x + bw / 2} y={y - 6} fontSize="10" textAnchor="middle" fill="var(--text)" fontWeight="700">{w.count}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function AdminResumen() {
  const { rows, stats, status } = useAdminBookings();
  const router = useRouter();
  const mes = new Date().toLocaleDateString("es-CO", { month: "long" });
  return (
    <div className="fade-in">
      <div className="admin-head">
        <div><h1>Resumen</h1><p>Vista general de la operación, con las reservas del panel de gestión y del sitio web.</p></div>
      </div>
      {status === "error" && <p className="empty-note">No se pudieron cargar las reservas del panel de gestión; las cifras están incompletas.</p>}
      <div className="stat-grid">
        <StatTile label={"Reservas en " + mes} value={String(stats.monthCount)} delta={rows.length + " en total"} />
        <StatTile label={"Valor reservado en " + mes} value={cop(stats.monthRevenue)} delta={"Abonos " + cop(stats.monthAdvance) + " · Saldo " + cop(stats.monthBalance)} />
        <StatTile label="Ocupación del mes" value={stats.occupancy + "%"} delta="Noches ocupadas sobre fincas activas" />
        <StatTile label="Próximo check-in" value={stats.next ? stats.next.when : "—"} delta={stats.next ? stats.next.who : "Sin llegadas programadas"} />
      </div>
      <div className="panel">
        <div className="panel-head"><h3>Llegadas por semana</h3></div>
        <WeeklyChart weeks={stats.weeks} />
        <div className="bar-chart-labels" style={{ paddingLeft: 28 }}>
          {stats.weeks.map((w, i) => <span key={w.label + i}>{w.label}</span>)}
        </div>
      </div>
      <div className="panel">
        <div className="panel-head">
          <h3>Reservas recientes</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push(ROUTES.adminTab("reservas"))}>Ver todas</button>
        </div>
        <ReservasTable rows={rows.slice(0, 5)} />
      </div>
    </div>
  );
}
