import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // 백엔드 URL

export const socket = io(SOCKET_URL, {
  autoConnect: true, // 앱 실행 시 자동 연결
  reconnection: true, // 재연결 활성화
});

socket.on("connect", () => {
  console.log(`Connected to server: ${socket.id}`);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
