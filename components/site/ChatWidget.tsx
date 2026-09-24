"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { answerChat, type ChatListingResult } from "@/lib/chat-engine";
import { Icon } from "@/lib/icons";
import { ROUTES } from "@/lib/routes";
import { useVisibleListings } from "./SiteContext";

interface ChatMsg { who: "bot" | "user"; text: string; chips?: string[]; listings?: ChatListingResult[] }

const GREETING: ChatMsg = {
  who: "bot",
  text: "¡Hola! Soy el asistente de El Viajero Inquieto. Pregúntame por fincas, parques o tours — por ejemplo:",
  chips: ["Fincas cerca a Manizales", "Parques para niños", "Tours de un día", "Lo más barato"],
};

function markSeen() { try { localStorage.setItem("vi_chat_seen", "1"); } catch { /* sin storage */ } }

function ChatBubble({ msg, onAsk, onGo }: { msg: ChatMsg; onAsk: (q: string) => void; onGo: (id: string) => void }) {
  if (msg.who === "user") return <div className="chat-msg user">{msg.text}</div>;
  return (
    <div className="chat-msg bot">
      {msg.text}
      {msg.listings && msg.listings.length > 0 && (
        <div className="chat-results">
          {msg.listings.map((r) => (
            <button key={r.id} type="button" className="chat-result" onClick={() => onGo(r.id)}>
              <span><b>{r.name}</b><span>{r.town}, {r.dept} · ★ {r.rating.toFixed(1)}</span></span>
              <strong>{r.price}</strong>
            </button>
          ))}
        </div>
      )}
      {msg.chips && msg.chips.length > 0 && (
        <div className="chat-suggestions">
          {msg.chips.map((c) => <button key={c} type="button" className="chat-chip" onClick={() => onAsk(c)}>{c}</button>)}
        </div>
      )}
    </div>
  );
}

/** Asistente flotante del sitio público (responde leyendo el catálogo). */
export function ChatWidget() {
  const router = useRouter();
  const listings = useVisibleListings();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openRef = useRef(open);
  const interactedRef = useRef(hasInteracted);
  useEffect(() => { openRef.current = open; interactedRef.current = hasInteracted; }, [open, hasInteracted]);

  // Aviso a los 2.2 s (si nunca se abrió el chat); se oculta solo a los 9 s
  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem("vi_chat_seen") === "1"; } catch { /* sin storage */ }
    if (seen) return;
    let hide: ReturnType<typeof setTimeout> | undefined;
    const show = setTimeout(() => {
      if (openRef.current || interactedRef.current) return;
      setShowTooltip(true);
      hide = setTimeout(() => { if (!openRef.current) setTooltipDismissed(true); }, 9000);
    }, 2200);
    return () => { clearTimeout(show); if (hide) clearTimeout(hide); };
  }, []);

  // Mantiene el scroll al final
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, open]);

  function openChat() {
    setOpen(true); setHasInteracted(true); setTooltipDismissed(true);
    markSeen();
    setTimeout(() => inputRef.current?.focus(), 30);
  }

  function send(text?: string) {
    const q = (text !== undefined ? text : input).trim();
    if (!q) return;
    const a = answerChat(q, listings);
    setMessages((m) => [...m, { who: "user", text: q }, { who: "bot", text: a.text, chips: a.chips, listings: a.listings }]);
    setInput("");
  }

  return (
    <div className="chat-root">
      {!open && !tooltipDismissed && showTooltip && (
        <div className="chat-tooltip" id="chatTooltip" onClick={openChat}>
          <button type="button" id="chatTooltipClose" aria-label="Cerrar" onClick={(e) => { e.stopPropagation(); setTooltipDismissed(true); markSeen(); }}>
            <Icon name="close" />
          </button>
          <p>¿Buscando algo especial? Pregúntame por fincas, parques o tours disponibles 👋</p>
        </div>
      )}
      <div className={"chat-panel" + (open ? " open" : "")} id="chatPanel">
        <div className="chat-head">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/photos/logo-mark-white.png" alt="" />
          <div><b>Asistente El Viajero Inquieto</b><span>Responde leyendo el catálogo en vivo</span></div>
        </div>
        <div className="chat-body" id="chatBody" ref={bodyRef}>
          {messages.map((m, i) => <ChatBubble key={i} msg={m} onAsk={send} onGo={(id) => router.push(ROUTES.listing(id))} />)}
        </div>
        <div className="chat-input-row">
          <input
            id="chatInput" ref={inputRef} type="text" autoComplete="off"
            placeholder="Ej. ¿qué finca hay cerca a Manizales?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
          />
          <button type="button" id="chatSend" onClick={() => send()}><Icon name="send" /></button>
        </div>
      </div>
      <button type="button" className={"chat-fab chat-fab-lg" + (open ? " open" : "")} id="chatFab" aria-label="Abrir chat de ayuda" onClick={() => (open ? setOpen(false) : openChat())}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <span className="icon-chat"><img className="chat-fab-logo" src="/photos/logo-mark-white.png" alt="" /></span>
        <span className="icon-close"><Icon name="close" /></span>
        {!open && !tooltipDismissed && !hasInteracted && <span className="chat-dot"></span>}
      </button>
    </div>
  );
}
