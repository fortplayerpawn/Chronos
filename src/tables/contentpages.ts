import { BaseEntity, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Contentpages extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  
}
