import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { encryptedStorage } from "../utils/encryptedStorage";

const API_SOCKET_BASE_URL = import.meta.env.VITE_API_SOCKET_BASE_URL;

export const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [userId, setUserId] = useState(
    encryptedStorage.getItem("user")?.id || null
  );
  const [token, setToken] = useState(encryptedStorage.getItem("token") || null);

  const [socket, setSocket] = useState(null);
  console.log("userId", userId, API_SOCKET_BASE_URL);

  const updateFcmToken = (token) => {
    encryptedStorage.setItem("token", token);
    setToken(token);
  };

  useEffect(() => {
    if (userId && token) {
      const newSocket = io(API_SOCKET_BASE_URL, {
        path: "/api/v2/socket/",
        query: {
          userId: userId && userId,
          token: token && token,
        },
        autoConnect: true,
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        pingInterval: 10000,
        pingTimeout: 10000,
      });
      setSocket(newSocket);
      newSocket.on("connect", () => {
        console.log("Connected to server via websocket");
      });
      newSocket.on("connect_error", (err) => {
        console.error("Socket Connection Error:", err.message);
      });
      return () => {
        newSocket.close();
      };
    }
  }, [userId, token]);

  return (
    <SocketContext.Provider value={{ socket, updateFcmToken, setUserId }}>
      {children}
    </SocketContext.Provider>
  );
};
