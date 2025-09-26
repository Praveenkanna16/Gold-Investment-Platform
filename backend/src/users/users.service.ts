import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getMe(id: string): Promise<User> {
    return this.findById(id);
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User> {
    await this.usersRepo.update(id, {
      ...dto,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
    });
    return this.findById(id);
  }

  async listAll(): Promise<User[]> {
    return this.usersRepo.find({ order: { createdAt: 'DESC' } });
  }

  async incrementGoldBalance(id: string, deltaGrams: number): Promise<User> {
    await this.usersRepo.increment({ id }, 'goldBalance', deltaGrams);
    return this.findById(id);
  }
}
