import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export type TokenTypes = "accesstoken" | "refreshtoken" | "clientoken";

@Entity()
export class Tokens extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 256, nullable: false, unique: true })
  accountId!: string;

  @Column()
  type!: string;

  @Column()
  token!: string;
}
