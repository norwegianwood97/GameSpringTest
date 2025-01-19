import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity()
export class DMChat {
  @PrimaryGeneratedColumn()
  id!: number; // 고유 메시지 ID

  @Column()
  senderId!: number; // 발신자 ID

  @Column()
  receiverId!: number; // 수신자 ID

  @Column("text")
  message!: string; // 메시지 내용

  @CreateDateColumn()
  timestamp!: Date; // 메시지 작성 시간
}
