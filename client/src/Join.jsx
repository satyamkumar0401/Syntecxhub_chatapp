import { useState } from "react";

export default function Join({ onJoin }) {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!username.trim() || !room.trim()) return;
    onJoin({ username: username.trim(), room: room.trim().toLowerCase() });
  };

  return (
    <form className="card join" onSubmit={submit}>
      <h1>Chatroom</h1>
      <p className="sub">Pick a name and a room. Friends who enter the same room name will chat with you live.</p>
      <label>
        Your name
        <input value={username} onChange={(e) => setUsername(e.target.value)} maxLength={20} placeholder="e.g. Aditya" autoFocus />
      </label>
      <label>
        Room name
        <input value={room} onChange={(e) => setRoom(e.target.value)} maxLength={30} placeholder="e.g. coding-club" />
      </label>
      <button type="submit">Join room</button>
    </form>
  );
}
