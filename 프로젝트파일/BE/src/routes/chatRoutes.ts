import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { MainChat } from "../entities/MainChat";
import { DMChat } from "../entities/DMChat";

const router = Router();

// 메인 채팅방 기록 가져오기
router.get("/mainChatHistory", async (req, res) => {
  try {
    const messages = await AppDataSource.manager.find(MainChat, {
      order: { timestamp: "ASC" },
      take: 50,
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error("error- mainChatHistory -", error);
    res.status(500).send("메인 채팅방 기록 조회 실패");
  }
});

// 특정 DM 채팅 기록 가져오기
router.get(
  "/dmChatHistory/:roomId",
  async (req: Request<{ roomId: string }>, res: Response): Promise<void> => {
    const { roomId } = req.params;
    const [senderId, receiverId] = roomId.split("_").map(Number);

    if (isNaN(senderId) || isNaN(receiverId)) {
      res.status(400).send("dm 기록 조회 실패 - id 불일치");
      console.log("error- dmChatHistory- dm 기록 조회 실패");
      return;
    }

    try {
      const messages = await AppDataSource.manager
        .createQueryBuilder(DMChat, "dm")
        .innerJoinAndSelect("user", "user", "dm.senderId = user.id")
        .where(
          "(dm.senderId = :senderId AND dm.receiverId = :receiverId) OR (dm.senderId = :receiverId AND dm.receiverId = :senderId)",
          { senderId, receiverId }
        )
        .orderBy("dm.timestamp", "ASC")
        .take(100)
        .getRawMany();

      const formattedMessages = messages.map((msg) => ({
        from: msg.user_username,
        message: msg.dm_message,
        timestamp: msg.dm_timestamp,
      }));
      res.status(200).json(formattedMessages);
    } catch (error) {
      console.error("error- dmHistory - ", error);
      res.status(500).send("dm 기록 조회 실패");
    }
  }
);

export default router;
