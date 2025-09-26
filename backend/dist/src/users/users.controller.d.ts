import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(user: any): Promise<import("./entities/user.entity").User>;
    update(user: any, dto: UpdateProfileDto): Promise<import("./entities/user.entity").User>;
}
