const STATUS: Record<string, [string, string]> = {
  confirmada: ["chip-ok", "Confirmada"], "en curso": ["chip-ok", "En curso"], completada: ["chip-ok", "Completada"],
  pendiente: ["chip-warn", "Pendiente"], "solicitud por whatsapp": ["chip-warn", "Solicitud por WhatsApp"],
  cancelada: ["chip-bad", "Cancelada"],
};
const PAY: Record<string, [string, string]> = {
  pagado: ["chip-ok", "Pagado"], abono: ["chip-warn", "Abono"], pendiente: ["chip-warn", "Pendiente"], reembolsado: ["chip-bad", "Reembolsado"],
};

export function StatusChip({ status }: { status: string }) {
  const m = STATUS[status.toLowerCase()] || ["chip-warn", status];
  return <span className={"chip " + m[0]}>{m[1]}</span>;
}

export function PayChip({ pay }: { pay: string }) {
  const m = PAY[pay.toLowerCase()] || ["chip-warn", pay];
  return <span className={"chip " + m[0]}>{m[1]}</span>;
}
