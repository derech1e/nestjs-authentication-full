import { UserEntity } from 'src/user/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'authentications' })
export class AuthenticationEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  @Generated('uuid')
  public uuid: string;

  @Column({ unique: true })
  public emailAddress: string;

  @Column()
  public password: string;

  @OneToOne(() => UserEntity, (user: UserEntity) => user.authentication)
  @JoinColumn()
  public user: UserEntity;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
