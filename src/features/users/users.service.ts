import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import { Agence } from '../agence/entities/agence.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Agence)
    private agenceRepository: Repository<Agence>,
  ) {}

  persist(user: User) {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(id, updateUserDto);
  }

  async findOneByResetToken(token: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { token: token } });
  }

  async remove(id: number, user: UserDto) {
    if (id !== user.id) {
      throw new ForbiddenException('You cannot delete another user account');
    }
    const userToDelete = await this.userRepository.findOne({ where: { id } });
    if (!userToDelete) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const deletionSuffix = '-deleted-' + Math.floor(Math.random() * 1000);
    await this.userRepository.update(id, {
      email: userToDelete.email + deletionSuffix,
    });
    return this.userRepository.softDelete(id);
  }

  async assignAgence(userId: number, agenceId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const agence = await this.agenceRepository.findOne({ where: { id: agenceId } });
    if (!user || !agence) throw new NotFoundException('User or Agence not found');
    user.agence = agence;
    return this.userRepository.save(user);
  }
}
