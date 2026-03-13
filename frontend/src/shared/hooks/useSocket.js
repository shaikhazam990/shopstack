import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      withCredentials: true,
      autoConnect: false,
    });
  }
  return socketInstance;
};

const useSocket = (events = {}) => {
  const socket = getSocket();
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handlers = Object.entries(eventsRef.current);
    handlers.forEach(([event, handler]) => socket.on(event, handler));

    return () => {
      handlers.forEach(([event, handler]) => socket.off(event, handler));
    };
  }, [socket]);

  return socket;
};

export default useSocket;
