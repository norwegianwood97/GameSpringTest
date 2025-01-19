import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

const useSocket = (
  url: string,
  onMessage: (message: string) => void,
  autoConnect: boolean = true
) => {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // 소켓 초기화
  const initializeSocket = useCallback(() => {
    if (!socketRef.current) {
      const socketInstance = io(url, { autoConnect: false });
      socketRef.current = socketInstance;
      setSocket(socketInstance);

      // 기존 핸들러 제거 후 새로 등록
      socketInstance
        .off("connect")
        .on("connect", () => console.log("Socket connected."));
      socketInstance
        .off("disconnect")
        .on("disconnect", () => console.log("Socket disconnected."));
      socketInstance.off("message").on("message", onMessage);

      console.log("Socket initialized.");
    }

    // 연결
    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect();
    }
  }, [url, onMessage]);

  // 소켓 해제
  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off("message", onMessage); // 핸들러 제거
      socketRef.current.disconnect();
      console.log("Socket manually disconnected.");
      socketRef.current = null;
      setSocket(null);
    }
  }, [onMessage]);

  useEffect(() => {
    if (autoConnect) {
      initializeSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, []);

  const sendMessage = (message: string) => {
    if (socketRef.current) {
      socketRef.current.emit("sendMessage", message);
    } else {
      console.error("Socket is not connected.");
    }
  };

  return { socket, initializeSocket, disconnectSocket, sendMessage };
};

export default useSocket;
