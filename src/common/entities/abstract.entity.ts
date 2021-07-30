import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Generated,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn()
  @Exclude()
  public id: number;

  @Column()
  @Generated('uuid')
  public uuid: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
