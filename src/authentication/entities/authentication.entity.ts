import { Exclude } from 'class-transformer';
import { AbstractEntity } from 'src/common/entities';
import { UserEntity } from 'src/user/entities';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity({ name: 'authentications' })
export class AuthenticationEntity extends AbstractEntity {
  @Column({ unique: true })
  public emailAddress: string;

  @Column()
  @Exclude()
  public password: string;

  @Column({ default: false })
  @Exclude()
  public active: boolean;

  @Column({ nullable: true })
  @Exclude()
  public currentHashedRefreshToken?: string;

  @OneToOne(() => UserEntity, (user: UserEntity) => user.authentication, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  public user: UserEntity;
}
