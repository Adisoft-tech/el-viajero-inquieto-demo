"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Ventana modal de los paneles. Se dibuja directamente en <body>: dentro del contenido de la página, la animación
 * fade-in deja un transform activo y haría que el fondo "fixed" se recorte al área del contenido.
 */
export function Modal({ label, width = 680, locked, onClose, children }: {
  label: string; width?: number; locked?: boolean; onClose: () => void; children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !locked) onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [locked, onClose]);

  if (!mounted) return null;
  return createPortal(
    <div className="admin-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget && !locked) onClose(); }}>
      <div className="admin-modal" style={{ maxWidth: width }} role="dialog" aria-modal="true" aria-label={label}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
