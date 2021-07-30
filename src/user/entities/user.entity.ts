import { Column, Entity, OneToOne } from 'typeorm';
import { AuthenticationEntity } from 'src/authentication/entities';
import { AbstractEntity } from 'src/common/entities';

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
}
