const STATUS: Record<string, [string, string]> = {
  confirmada: ["chip-ok", "Confirmada"], pendiente: ["chip-warn", "Pendiente"], cancelada: ["chip-bad", "Cancelada"],
};
const PAY: Record<string, [string, string]> = {
  pagado: ["chip-ok", "Pagado"], pendiente: ["chip-warn", "Pendiente"], reembolsado: ["chip-bad", "Reembolsado"],
};

export function StatusChip({ status }: { status: string }) {
  const m = STATUS[status] || ["chip-warn", status];
  return <span className={"chip " + m[0]}>{m[1]}</span>;
}

export function PayChip({ pay }: { pay: string }) {
  const m = PAY[pay] || ["chip-warn", pay];
  return <span className={"chip " + m[0]}>{m[1]}</span>;
}
