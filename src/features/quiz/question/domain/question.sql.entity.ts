import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Question extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column()
  body: string;
  @Column({ type: "json" })
  correctAnswers: string;
  @Column({ default: false })
  published: boolean;
  @Column({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;
  @Column({
    type: "timestamptz",
    nullable: true,
  })
  updatedAt: Date;
}
