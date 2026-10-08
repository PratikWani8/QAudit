import React, { createContext, useContext, useEffect, useState } from "react";

export interface RealtimeEvent {
  id: string;
  type: string;
  data: any;
  timestamp: string;
}

interface WebSocketContextType {
  isConnected: boolean;
  events: RealtimeEvent[];
  latestAlert: RealtimeEvent | null;
  clearAlerts: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [latestAlert, setLatestAlert] = useState<RealtimeEvent | null>(null);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://127.0.0.1:8000/ws";
    let socket: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      try {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          setIsConnected(true);
        };

        socket.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            const newEv: RealtimeEvent = {
              id: `${Date.now()}-${Math.random()}`,
              type: parsed.event || "UNKNOWN",
              data: parsed.data || {},
              timestamp: new Date().toLocaleTimeString(),
            };

            setEvents((prev) => [newEv, ...prev.slice(0, 49)]);

            if (
              newEv.type === "security_alert" ||
              newEv.type === "tampering_detected" ||
              newEv.type === "consensus_breach"
            ) {
              setLatestAlert(newEv);
            }
          } catch (e) {
            console.error("WS Parse error", e);
          }
        };

        socket.onclose = () => {
          setIsConnected(false);
          reconnectTimeout = setTimeout(connect, 3000);
        };

        socket.onerror = () => {
          setIsConnected(false);
        };
      } catch (err) {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (socket) socket.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  const clearAlerts = () => {
    setLatestAlert(null);
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, events, latestAlert, clearAlerts }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
