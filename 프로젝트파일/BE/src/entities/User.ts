import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number = 0; // 유저 ID

  @Column({ unique: true })
  username: string = ""; // 유저 이름

  @Column()
  password: string = ""; // 유저 비밀번호

  @CreateDateColumn()
  createdAt: Date = new Date(); // 계정 생성일자
}
