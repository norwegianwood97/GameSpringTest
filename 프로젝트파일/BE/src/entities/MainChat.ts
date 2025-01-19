import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity()
export class MainChat {
  @PrimaryGeneratedColumn()
  id!: number; // 고유 메시지 ID

  @Column()
  userId!: number; // 작성자 ID

  @Column()
  username!: string; // 작성자 이름

  @Column("text")
  message!: string; // 메시지 내용

  @CreateDateColumn()
  timestamp!: Date; // 메시지 작성 시간
}
