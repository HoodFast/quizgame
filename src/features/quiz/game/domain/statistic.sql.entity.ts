import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Users } from "../../../users/domain/user.sql.entity";

@Entity()
export class Statistic extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column()
  sumScore: number;
  @Column("float", { default: 0 })
  avgScores: number;
  @Column()
  gamesCount: number;
  @Column()
  winsCount: number;
  @Column()
  lossesCount: number;
  @Column()
  drawsCount: number;
  @Column({ nullable: true })
  userId: string;
  @JoinColumn({ name: "userId" })
  @OneToOne(() => Users, { nullable: true, onDelete: "CASCADE", cascade: true })
  user: Users;
}
