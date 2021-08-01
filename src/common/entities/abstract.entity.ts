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
  @Exclude()
  public createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  public updatedAt: Date;

  constructor(createdAt: Date, updatedAt?: Date);
  constructor(createdAt: Date, updatedAt: Date);
  constructor(createdAt?: Date, updatedAt?: Date);
  constructor(createdAt?: Date, updatedAt?: Date) {
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }
}
