import { Exclude } from 'class-transformer';
import { AbstractEntity } from 'src/common/entities';
import { UserEntity } from 'src/user/entities';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { RoleType } from '../constants';

@Entity({ name: 'authentications' })
export class AuthenticationEntity extends AbstractEntity {
  @Column({ type: 'enum', enum: RoleType, default: RoleType.USER })
  public role: RoleType;

  @Column({ unique: true })
  public emailAddress: string;

  @Column()
  @Exclude()
  public password: string;

  @Column({ default: false })
  @Exclude()
  public isEmailConfirmed: boolean;

  @Column({ nullable: true })
  @Exclude()
  public currentHashedRefreshToken?: string;

  @OneToOne(() => UserEntity, (user: UserEntity) => user.authentication, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  public user: UserEntity;

  constructor(
    role: RoleType,
    emailAddress?: string,
    password?: string,
    isEmailConfirmed?: boolean,
    currentHashedRefreshToken?: string,
    user?: UserEntity,
  );
  constructor(
    role: RoleType,
    emailAddress: string,
    password: string,
    isEmailConfirmed?: boolean,
    currentHashedRefreshToken?: string,
    user?: UserEntity,
  );
  constructor(
    role: RoleType,
    emailAddress: string,
    password: string,
    isEmailConfirmed: boolean,
    currentHashedRefreshToken?: string,
    user?: UserEntity,
  );
  constructor(
    role: RoleType,
    emailAddress: string,
    password: string,
    isEmailConfirmed: boolean,
    currentHashedRefreshToken: string,
    user?: UserEntity,
  );
  constructor(
    role: RoleType,
    emailAddress: string,
    password: string,
    isEmailConfirmed: boolean,
    currentHashedRefreshToken: string,
    user: UserEntity,
  );
  constructor(
    role?: RoleType,
    emailAddress?: string,
    password?: string,
    isEmailConfirmed?: boolean,
    currentHashedRefreshToken?: string,
    user?: UserEntity,
  );
  constructor(
    role?: RoleType,
    emailAddress?: string,
    password?: string,
    isEmailConfirmed?: boolean,
    currentHashedRefreshToken?: string,
    user?: UserEntity,
  ) {
    super();
    this.role = role || RoleType.USER;
    this.emailAddress = emailAddress || '';
    this.password = password || '';
    this.isEmailConfirmed = isEmailConfirmed || false;
    this.currentHashedRefreshToken = currentHashedRefreshToken || '';
    this.user = user || undefined;
  }
}
