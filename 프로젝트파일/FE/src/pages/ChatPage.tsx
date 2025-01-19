import React, { useEffect, useState, useRef } from "react";
import { socket } from "../socket.ts";

interface Message {
  from: string; // 송신자 이름
  message: string; // 메시지 내용
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<string[]>([]); // 현재 접속 중인 유저 목록
  const [isConnected, setIsConnected] = useState(socket.connected); // 소켓 연결 상태 초기화
  const chatContainerRef = useRef<HTMLDivElement>(null); // 채팅 메시지 컨테이너 참조

  // 메시지가 추가될 때 스크롤을 제일 하단으로 조정
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    console.log("useEffect called in ChatPage");
    const username = sessionStorage.getItem("username");
    const userId = sessionStorage.getItem("userId");

    if (username && userId) {
      // 소켓이 이미 연결되어 있지 않으면 연결
      if (!socket.connected) {
        socket.connect();
      }

      // 채팅방 입장 이벤트
      socket.emit("joinChat", { userId, username });
    }

    // 메인 채팅 이벤트 핸들러 등록
    const handleIncomingMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleUpdateUserList = (userList: string[]) => {
      // 중복 제거
      const uniqueUsers = Array.from(new Set(userList));
      setUsers(uniqueUsers);
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected!");
      setIsConnected(false);
    };

    // 소켓 이벤트 등록
    socket.on("message", handleIncomingMessage);
    socket.on("updateUserList", handleUpdateUserList);
    socket.on("disconnect", handleDisconnect);

    // 서버에서 채팅 기록 가져오기
    const fetchChatHistory = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/chat/mainChatHistory"
        );
        const data = await response.json();
        setMessages(
          data.map((msg: any) => ({
            from: msg.username,
            message: msg.message,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch main chat history:", error);
      }
    };

    fetchChatHistory();

    return () => {
      if (socket.connected && username && userId) {
        socket.emit("leaveChat", { userId, username }); // Leave 요청
      }
      socket.off("message", handleIncomingMessage);
      socket.off("updateUserList", handleUpdateUserList);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  const sendMessage = () => {
    if (socket.connected && message.trim()) {
      socket.emit("sendMessage", message);
      setMessage(""); // 입력창 초기화
    } else {
      console.error("Socket is not connected. Cannot send message.");
    }
  };

  return (
    <div style={{ display: "flex" }}>
      {/* 채팅 메시지 창 */}
      <div style={{ flex: 3, marginRight: "10px" }}>
        <h1>Chat Page</h1>
        <div
          ref={chatContainerRef} // 메시지 컨테이너에 참조 연결
          style={{
            border: "1px solid black",
            padding: "10px",
            height: "300px",
            overflowY: "scroll",
          }}
        >
          {messages.map((msg, idx) => (
            <div key={idx}>
              <strong>{msg.from}: </strong>
              {msg.message}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      {/* 접속 중인 유저 목록 */}
      <div style={{ flex: 1, border: "1px solid black", padding: "10px" }}>
        <h2>현재: {users.length}명</h2>
        <ul>
          {users.map((user, idx) => (
            <li key={idx}>{user}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatPage;
