import { Router } from "express";
import bcrypt from "bcrypt";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

const router = Router();

// 회원가입
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User();
    user.username = username;
    user.password = hashedPassword;
    await AppDataSource.manager.save(user);
    res.status(201).send("회원가입 성공");
  } catch (err) {
    res.status(500).send("회원가입 실패");
    console.error(`error - signup - ${err}`);
  }
});

// 로그인
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await AppDataSource.manager.findOneBy(User, { username });
    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.user = { id: user.id, username: user.username };
      console.log(`${user.username} 로그인`);

      res.status(200).json({ userId: user.id, username: user.username });
    } else {
      res.status(401).send("인증 실패");
      console.error(`error - login - id|pw 오류`);
    }
  } catch (err) {
    res.status(500).send("서버 오류");
    console.error(`error - login - ${err}`);
  }
});

// 로그아웃
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("서버 오류");
    }
    res.send("로그아웃 성공");
  });
});

// 모든 유저 정보 조회
router.get("/", async (req, res) => {
  try {
    const users = await AppDataSource.manager.find(User, {
      select: ["id", "username", "createdAt"],
    });
    console.log("모든 유저 정보 조회 성공");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).send("유저 정보 조회 실패");
    console.log(`error - 유저 정보 조회 - ${err}`);
  }
});

// 특정 유저 정보 조회
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await AppDataSource.manager.findOneBy(User, {
      id: parseInt(userId, 10),
    });

    if (user) {
      res.status(200).json({ username: user.username });
    } else {
      res.status(404).json({ error: "해당 유저 조회 실패" });
    }
  } catch (error) {
    console.error("error- 특정 유저 조회 :", error);
    res.status(500).json({ error: "서버 오류" });
  }
});

export default router;
