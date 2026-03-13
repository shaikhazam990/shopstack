import { useState, useRef, useEffect } from "react";
import useSocket from "../../../shared/hooks/useSocket";
import styles from "./AssistantChat.module.css";

const QUICK_QUESTIONS = ["What's in the box?", "Compatible with Mac?", "Return policy?"];

const AssistantChat = ({ productId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef(null);

  const socket = useSocket({
    "assistant:start": () => {
      setStreaming(true);
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    },
    "assistant:chunk": ({ chunk }) => {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: updated[updated.length - 1].content + chunk,
        };
        return updated;
      });
    },
    "assistant:done": () => setStreaming(false),
    "assistant:error": () => setStreaming(false),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text) => {
    if (!text.trim() || streaming) return;
    const userMsg = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    socket.emit("assistant:message", {
      productId,
      messages: updated.map((m) => ({ role: m.role, content: m.content })),
    });
  };

  return (
    <div className={styles.chat}>
      {messages.length > 0 && (
        <div className={styles.messages}>
          {messages.map((m, i) => (
            <div key={i} className={`${styles.msg} ${m.role === "user" ? styles.user : styles.assistant}`}>
              {m.content}
              {streaming && i === messages.length - 1 && m.role === "assistant" && (
                <span className={styles.cursor} />
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      <div className={styles.inputRow}>
        <input
          type="text"
          placeholder="Compare with Series Y?..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          disabled={streaming}
        />
        <button onClick={() => send(input)} disabled={!input.trim() || streaming} className={styles.sendBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>

      {messages.length === 0 && (
        <div className={styles.quickBtns}>
          {QUICK_QUESTIONS.map((q) => (
            <button key={q} className={styles.quickBtn} onClick={() => send(q)}>"{q}"</button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssistantChat;
