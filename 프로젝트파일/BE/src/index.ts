/// <reference path="./types/express-session.d.ts" />

import "reflect-metadata";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import session from "express-session";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";
import { socketHandler } from "./sockets/chatSocket";
import { AppDataSource } from "./data-source";

const app = express();
const PORT = 5000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
  },
});

// DB연결
AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

socketHandler(io);

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
