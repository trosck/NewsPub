import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Socket } from "socket.io-client";

import type { SocketStatus } from "../types.ts";
import { createSocket } from "../services/socket.ts";
import { useAuth } from "./AuthContext.tsx";

interface SocketContextValue {
  socket: Socket | null;
  status: SocketStatus;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<SocketStatus>("disconnected");

  useEffect(() => {
    if (!user) {
      setStatus("disconnected");
      return;
    }

    const instance = createSocket();
    setSocket(instance);
    setStatus("connecting");

    instance.on("connect", () => setStatus("connected"));
    instance.on("disconnect", () => setStatus("disconnected"));
    instance.on("connect_error", () => setStatus("error"));
    instance.connect();

    return () => {
      instance.removeAllListeners();
      instance.disconnect();
      setSocket(null);
    };
  }, [user]);

  const value = useMemo<SocketContextValue>(
    () => ({ socket, status }),
    [socket, status],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within a SocketProvider");
  return ctx;
}
