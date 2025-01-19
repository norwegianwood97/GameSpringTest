// src/pages/DMPage.tsx
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import Navigation from "../components/Navigation.tsx";

interface Message {
  from: string; // 송신자 이름
  message: string; // 메시지 내용
}

let dmSocket: Socket | null = null;

const DMPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const currentUserId = sessionStorage.getItem("userId");
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [receiverUsername, setReceiverUsername] = useState<string>("");
  const [activeMenu, setActiveMenu] = useState("DM");
  const [roomId, setRoomId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null); // 채팅 메시지 컨테이너 참조

  // 메시지가 추가될 때 스크롤을 제일 하단으로 조정
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!currentUserId || !userId) {
      console.error("User ID or Receiver ID is missing.");
      return;
    }

    if (!dmSocket) {
      dmSocket = io("http://localhost:5000");
    }

    dmSocket.emit("registerUser", {
      userId: currentUserId,
      username: sessionStorage.getItem("username"),
    });

    const fetchReceiverUsername = async () => {
      try {
        // username 조회
        const response = await fetch(
          `http://localhost:5000/api/users/${userId}`
        );

        const data = await response.json();

        setReceiverUsername(data.username);

        // DM 소켓 이벤트 등록 (receiverUsername이 설정된 후)
        if (dmSocket) {
          dmSocket.emit(
            "joinDM",
            { senderId: currentUserId, receiverId: userId },
            async (response: { roomId: string }) => {
              setRoomId(response.roomId); // 서버에서 받은 roomId 저장
              await fetchDMHistory(response.roomId); // 과거 DM 기록 가져오기
            }
          );

          const handleIncomingMessage = (msg: Message) => {
            setMessages((prev) => [...prev, msg]);
          };

          dmSocket.on("dmMessage", handleIncomingMessage);
        } else {
          console.error(
            "dmSocket is null. Socket connection might be missing."
          );
        }
      } catch (error) {
        console.error("Failed to fetch receiver's username:", error);
        setReceiverUsername("Unknown");
      }
    };

    fetchReceiverUsername();

    return () => {
      if (dmSocket) {
        dmSocket.emit("leaveDM", {
          senderId: currentUserId,
          receiverId: userId,
        });
        dmSocket.disconnect();
        dmSocket = null;
      }
    };
  }, [userId, currentUserId]);

  // DM 기록을 가져오는 함수
  const fetchDMHistory = async (roomId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/chat/dmChatHistory/${roomId}`
      );
      const data = await response.json();

      // DM 기록을 상태로 설정
      setMessages(
        data.map((msg: any) => ({
          from: msg.from,
          message: msg.message,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch DM history:", error);
    }
  };

  const sendMessage = () => {
    if (!roomId) {
      console.error("Room ID is not set");
      return;
    }

    if (dmSocket && currentUserId && message.trim()) {
      dmSocket.emit("sendDM", {
        roomId,
        senderId: currentUserId,
        receiverId: userId,
        message,
      });
      setMessage(""); // 입력창 초기화
    }
  };

  return (
    <div>
      <Navigation activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <h2>Direct Message with {receiverUsername || "Loading..."}</h2>
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
            <strong>{msg.from}: </strong> {msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message"
      />
      <button
        onClick={() => {
          console.log("Send button clicked");
          sendMessage();
        }}
      >
        Send
      </button>
    </div>
  );
};

export default DMPage;
