import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Question extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column()
  body: string;
  @Column()
  correctAnswers: string;
  @Column({ default: false })
  published: boolean;
  @Column()
  createdAt: Date;
  @Column({ nullable: true })
  updatedAt: Date;
}
