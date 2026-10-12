import { useEffect, useRef, useState } from "react";

const hue = (name) => [...name].reduce((a, c) => a + c.charCodeAt(0), 0) * 37 % 360;
const time = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function Chat({ socket, username, room, onLeave }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottom = useRef(null);

  useEffect(() => {
    const join = () => socket.emit("join", { username, room });
    const onHistory = (h) => setMessages(h.map((m) => ({ ...m, type: "msg" })));
    const onMessage = (m) => setMessages((p) => [...p, { ...m, type: "msg" }]);
    const onSystem = (t) => setMessages((p) => [...p, { type: "system", text: t, _id: Date.now() + t }]);

    socket.on("connect", join);
    socket.on("history", onHistory);
    socket.on("message", onMessage);
    socket.on("system", onSystem);
    if (socket.connected) join();

    return () => {
      socket.off("connect", join);
      socket.off("history", onHistory);
      socket.off("message", onMessage);
      socket.off("system", onSystem);
    };
  }, [socket, username, room]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    socket.emit("message", text);
    setText("");
  };

  return (
    <div className="card chat">
      <header>
        <div>
          <h2># {room}</h2>
          <span className="sub">Chatting as {username}</span>
        </div>
        <button className="ghost" onClick={onLeave}>Leave</button>
      </header>

      <div className="messages">
        {messages.length === 0 && <p className="empty">No messages yet. Say hi to start the room.</p>}
        {messages.map((m) =>
          m.type === "system" ? (
            <div key={m._id} className="system">{m.text}</div>
          ) : (
            <div key={m._id} className={"row " + (m.username === username ? "mine" : "")}>
              {m.username !== username && (
                <div className="avatar" style={{ background: `hsl(${hue(m.username)} 55% 45%)` }}>
                  {m.username[0].toUpperCase()}
                </div>
              )}
              <div className="bubble">
                {m.username !== username && <b className="name">{m.username}</b>}
                <span>{m.text}</span>
                <small>{time(m.createdAt)}</small>
              </div>
            </div>
          )
        )}
        <div ref={bottom} />
      </div>

      <form className="composer" onSubmit={send}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" maxLength={1000} autoFocus />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
