export function StatTile({ label, value, delta }: { label: string; value: string; delta: string }) {
  return <div className="stat-tile"><span>{label}</span><b className="tabular">{value}</b><em>{delta}</em></div>;
}
