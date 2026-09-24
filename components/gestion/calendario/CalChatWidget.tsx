"use client";

import { useEffect, useRef, useState } from "react";
import { DEMO_TODAY } from "@/lib/data";
import { Icon } from "@/lib/icons";
import { useApp } from "@/lib/store";
import { CAL_CHAT_CHIPS, answerCalendarChat } from "@/lib/calendar";

interface ChatMsg { who: "bot" | "user"; text: string; chips?: string[] }

const GREETING: ChatMsg = {
  who: "bot",
  text: "Hola, soy el asistente de disponibilidad. Pregúntame por una finca, una fecha, o ambas — por ejemplo:",
  chips: CAL_CHAT_CHIPS,
};

/** Equivalente a renderCalChatWidget() + bindCalChatWidget(). */
export function CalChatWidget({ onGotoDate }: { onGotoDate: (iso: string) => void }) {
  const { listings, fincaBookings } = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([GREETING]);
  const [input, setInput] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  function send(text?: string) {
    const q = (text !== undefined ? text : input).trim();
    if (!q) return;
    const a = answerCalendarChat(q, listings, fincaBookings, DEMO_TODAY);
    setMessages((prev) => [...prev, { who: "user", text: q }, { who: "bot", text: a.text, chips: a.chips }]);
    setInput("");
    if (a.gotoDate) onGotoDate(a.gotoDate);
    inputRef.current?.focus();
  }

  return (
    <div className="chat-root">
      <div className={"chat-panel" + (open ? " open" : "")} id="calChatPanel">
        <div className="chat-head">
          <span className="cal-chat-head-icon"><Icon name="calendar" /></span>
          <div><b>Asistente de disponibilidad</b><span>Lee las reservas guardadas — sin IA</span></div>
        </div>
        <div className="chat-body" id="calChatBody" ref={bodyRef}>
          {messages.map((msg, i) => msg.who === "user"
            ? <div key={i} className="chat-msg user">{msg.text}</div>
            : (
              <div key={i} className="chat-msg bot">
                {msg.text}
                {msg.chips && msg.chips.length ? (
                  <div className="chat-suggestions">
                    {msg.chips.map((c) => (
                      <button key={c} type="button" className="chat-chip" data-chatask={c} onClick={() => send(c)}>{c}</button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
        </div>
        <div className="chat-input-row">
          <input id="calChatInput" ref={inputRef} type="text" placeholder="Ej. ¿qué finca está libre el 20/12?" autoComplete="off"
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } }} />
          <button type="button" id="calChatSend" onClick={() => send()}><Icon name="send" /></button>
        </div>
      </div>
      <button type="button" className={"chat-fab" + (open ? " open" : "")} id="calChatFab" aria-label="Abrir asistente de disponibilidad" onClick={() => setOpen((o) => !o)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <span className="icon-chat"><img className="chat-fab-logo" src="/photos/logo-mark-white.png" alt="" /></span>
        <span className="icon-close"><Icon name="close" /></span>
      </button>
    </div>
  );
}
