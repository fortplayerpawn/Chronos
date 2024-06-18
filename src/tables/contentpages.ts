import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Contentpages extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  stage!: string;

  @Column()
  key!: string; /// type Keys = "lobby" | "vault"
}
