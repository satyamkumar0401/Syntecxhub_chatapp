import { useState } from "react";
import { io } from "socket.io-client";
import Join from "./Join.jsx";
import Chat from "./Chat.jsx";

const socket = io(import.meta.env.DEV ? "http://localhost:5000" : undefined);

export default function App() {
  const [user, setUser] = useState(null);

  const leave = () => {
    socket.disconnect();
    socket.connect();
    setUser(null);
  };

  return (
    <div className="page">
      {user ? (
        <Chat socket={socket} username={user.username} room={user.room} onLeave={leave} />
      ) : (
        <Join onJoin={setUser} />
      )}
    </div>
  );
}
