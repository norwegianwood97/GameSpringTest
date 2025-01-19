import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { MainChat } from "./entities/MainChat";
import { DMChat } from "./entities/DMChat";

import "reflect-metadata";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3307,
  username: "gameSpringTest",
  password: "ps1234",
  database: "chat_app",
  synchronize: true,
  logging: false,
  entities: [User, MainChat, DMChat],
});
