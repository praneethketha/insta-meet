import { FC, PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

const SocketContext = createContext<Socket | undefined>(undefined);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider:FC<PropsWithChildren> = ({children}) => {
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    const connection = io(import.meta.env.VITE_BACKEND_URL);
    setSocket(connection);
  }, []);

  socket?.on("connect_error", async (err) => {
    console.log("Error establishing socket", err);
  });

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
