import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersService {
    private readonly usersRepo;
    constructor(usersRepo: Repository<User>);
    findById(id: string): Promise<User>;
    getMe(id: string): Promise<User>;
    updateProfile(id: string, dto: UpdateProfileDto): Promise<User>;
    listAll(): Promise<User[]>;
    incrementGoldBalance(id: string, deltaGrams: number): Promise<User>;
}
