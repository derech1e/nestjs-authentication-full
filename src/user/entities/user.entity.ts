import { AuthenticationEntity } from '../../authentication/entities';
import { AbstractEntity } from 'src/common/entities';
import { Column, Entity, OneToOne } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity extends AbstractEntity {
  @Column()
  public firstName: string;

  @OneToOne(
    () => AuthenticationEntity,
    (authentication: AuthenticationEntity) => authentication.user,
    { eager: true, onDelete: 'CASCADE' },
  )
  public authentication: AuthenticationEntity;

  constructor(firstName: string, authentication?: AuthenticationEntity);
  constructor(firstName?: string, authentication?: AuthenticationEntity);
  constructor(firstName?: string, authentication?: AuthenticationEntity) {
    super();
    this.firstName = firstName || '';
    this.authentication = authentication || undefined;
  }
}
