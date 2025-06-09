import { Role } from '../../../core/enums/role.enum';
import { User } from '../entities/user.entity';

export class UserDto {
  id?: number;
  email: string;
  fonction: string;
  firstname: string;
  lastname: string;
  picture: string;
  isActive: boolean;
  /** User account verification status (ID, KYC, ...) */
  roles: Role[];
  agenceId?: number;

  get fullName() {
    return `${this.firstname} ${this.lastname}`;
  }

  static fromUser(user: User): UserDto {
    const dto = new UserDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.fonction = user.fonction;
    dto.firstname = user.firstname;
    dto.lastname = user.lastname;
    dto.isActive = user.isActive;
    dto.roles = user.roles;
    dto.agenceId = user.agence ? user.agence.id : undefined;
    return dto;
  }
}
