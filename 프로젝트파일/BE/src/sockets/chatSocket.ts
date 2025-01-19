import { Server } from "socket.io";
import { AppDataSource } from "../data-source";
import { MainChat } from "../entities/MainChat";
import { DMChat } from "../entities/DMChat";
import { User } from "../entities/User";

export const socketHandler = (io: Server) => {
  const userSocketMap = new Map<string, { userId: string; username: string }>(); // socket.id -> { userId, username }

  io.on("connection", (socket) => {
    console.log("Socket connected with ID:", socket.id);

    // 1. 소켓 연결 시 사용자 정보 등록
    socket.on("registerUser", ({ userId, username }) => {
      if (!userId || !username) {
        console.error(
          "error - registerUser - User ID | username 이 존재하지 않습니다."
        );
        return;
      }
      userSocketMap.set(socket.id, { userId, username });
      console.log(`소켓 연결 성공 (${username} - socket ID: ${socket.id})`);
    });

    // 2. 전체 채팅방 입장
    socket.on("joinChat", ({ userId, username }) => {
      if (!userId || !username) {
        console.error(
          "error - joinChat - User ID | username 이 존재하지 않습니다."
        );
        return;
      }

      // 기존 연결 정리
      const existingSocket = Array.from(userSocketMap.entries()).find(
        ([, user]) => user.userId === userId
      );
      if (existingSocket) {
        const [existingSocketId] = existingSocket;
        if (existingSocketId !== socket.id) {
          userSocketMap.delete(existingSocketId);
          io.sockets.sockets.get(existingSocketId)?.disconnect();
          console.log(`${username}의 이전 연결을 삭제합니다.`);
        }
      }

      // 새로운 연결 등록
      userSocketMap.set(socket.id, { userId, username });
      socket.join("mainChat");
      console.log(`${username} (ID: ${userId})이 메인 채팅방에 참여했습니다.`);

      io.to("mainChat").emit("message", {
        from: "System",
        message: `${username}님이 입장`,
      });

      // 유저 목록 업데이트
      const userList = Array.from(userSocketMap.values()).map(
        (user) => user.username
      );
      io.to("mainChat").emit("updateUserList", userList);
    });

    // 3. 메인 채팅방 나가기
    socket.on("leaveChat", ({ userId, username }) => {
      if (!userSocketMap.has(socket.id)) {
        console.warn(
          `error - leaveChat - ${username}가 이미 채팅방에 존재하지 않습니다.`
        );
        return;
      }
      console.log(`${username}가 메인 채팅방을 나갔습니다.`);
      userSocketMap.delete(socket.id);

      // 유저 목록 업데이트
      const userList = Array.from(userSocketMap.values()).map(
        (user) => user.username
      );
      io.to("mainChat").emit("updateUserList", userList);

      // 채팅창에 떠난 유저 알림
      io.to("mainChat").emit("message", {
        from: "System",
        message: `${username}님이 채팅방을 떠났습니다.`,
      });
    });

    // 4. 메인 채팅방 메시지 입출력
    socket.on("sendMessage", async (message) => {
      const user = userSocketMap.get(socket.id);
      if (!user) {
        console.error(
          `error - sendMessage - sender이 존재하지 않습니다. socket ID: ${socket.id}`
        );
        return;
      }
      const { userId, username } = user;
      console.log(`메인 채팅방 채팅 로그 발생- ${username}: ${message}`);

      // db에 메시지 저장
      const newMessage = AppDataSource.manager.create(MainChat, {
        userId: parseInt(userId, 10),
        username,
        message,
      });
      await AppDataSource.manager.save(newMessage);

      // 메시지를 클라이언트에 전송
      io.to("mainChat").emit("message", { from: username, message });
    });

    // 5. DM 채팅방 입장
    const dmRoomMap = new Map<string, string>();
    socket.on("joinDM", async ({ senderId, receiverId }, callback) => {
      if (!senderId || !receiverId) {
        console.error("error - joinDM - Sender | Receiver ID가 없습니다.");
        return;
      }

      // 송신자 존재 확인
      const sender = userSocketMap.get(socket.id);
      if (!sender) {
        console.error(
          `error - joinDM - 채팅방에 존재하지 않는 sender ID: ${senderId}`
        );
        return;
      }

      try {
        // DB에서 receiverId가 유효한지 확인
        const receiver = await AppDataSource.manager.findOne(User, {
          where: { id: receiverId },
        });

        if (!receiver) {
          console.error(
            `error - joinDM - db에 존재하지 않는 receiver ID: ${receiverId}`
          );
          return;
        }

        // 서버에서 소켓 Room ID 생성
        const roomKey = [String(senderId), String(receiverId)].sort().join("_");
        const roomId = roomKey;
        dmRoomMap.set(roomKey, roomId);
        socket.join(roomId);
        console.log(`${senderId}유저가 DM room ${roomId}번에 참여.`);

        if (callback) {
          callback({ roomId });
        }
      } catch (error) {
        console.error(
          "error - joinDM - receiver ID 조회중 오류 발생. error: ",
          error
        );
      }
    });

    // 6. DM방 나갈 경우 소켓 연결 해제
    socket.on("leaveDM", ({ senderId, receiverId }) => {
      if (!senderId || !receiverId) {
        console.error("error - leaveDM - Sender | Receiver ID가 없습니다.");
        return;
      }

      const roomKey = [String(senderId), String(receiverId)].sort().join("_");
      const roomId = dmRoomMap.get(roomKey);
      if (!roomId) {
        console.error(
          `error - leaveDM - Room ID가 존재하지 않습니다. sender: ${senderId}, receiver: ${receiverId}`
        );
        return;
      }

      console.log(`${senderId}가 ${receiverId}와의 DM방을 떠났습니다.`);
      socket.leave(roomId);
      dmRoomMap.delete(roomKey);
    });

    // 7. DM 전송
    socket.on("sendDM", async ({ roomId, senderId, receiverId, message }) => {
      if (!roomId || !senderId || !receiverId || !message.trim()) {
        console.error("error - sendDM - 수신 정보 오류");
        return;
      }

      try {
        // 메시지 저장
        const newMessage = AppDataSource.manager.create(DMChat, {
          senderId,
          receiverId,
          message,
        });
        await AppDataSource.manager.save(newMessage);

        const sender = userSocketMap.get(socket.id);
        const username = sender ? sender.username : `User ${senderId}`;

        console.log(
          `DM 발생. ${senderId}번 유저 -> ${receiverId}번 유저: ${message}`
        );

        // 클라이언트로 username 포함하여 메시지 전송
        io.to(roomId).emit("dmMessage", { from: username, message });
      } catch (error) {
        console.error("error - sendDM - dm 저장 실패 :", error);
      }
    });

    // 8. 로그아웃
    socket.on("logout", (userId) => {
      const user = Array.from(userSocketMap.entries()).find(
        ([, value]) => value.userId === userId
      );
      if (user) {
        const [socketId, { username }] = user;
        console.log(`${username} 로그아웃`);

        // 퇴장 메시지 전송
        io.to("mainChat").emit("message", `${username}님이 퇴장`);

        // 소켓 연결 종료
        io.sockets.sockets.get(socketId)?.disconnect();
      }
    });

    // 9. 소켓 연결 종료
    socket.on("disconnect", () => {
      const user = userSocketMap.get(socket.id);
      console.log(`${user} 소켓 연결 종료`);

      if (user) {
        const { username, userId } = user;

        // 유저 목록 업데이트
        userSocketMap.delete(socket.id);
        const userList = Array.from(userSocketMap.values()).map(
          (user) => user.username
        );

        io.to("mainChat").emit("updateUserList", userList);
        io.to("mainChat").emit("message", {
          from: "System",
          message: `${username}님이 채팅방을 떠났습니다.`,
        });
      }
    });
  });
};
