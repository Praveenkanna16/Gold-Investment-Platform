"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const auth_service_1 = require("./auth.service");
const user_entity_1 = require("../users/entities/user.entity");
const user_role_enum_1 = require("../common/enums/user-role.enum");
describe('AuthService', () => {
    let service;
    let userRepository;
    let jwtService;
    const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedPassword',
        role: user_role_enum_1.UserRole.USER,
        isActive: true,
    };
    beforeEach(async () => {
        const mockUserRepository = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
        };
        const mockJwtService = {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
        };
        const mockConfigService = {
            get: jest.fn().mockReturnValue(12),
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                { provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User), useValue: mockUserRepository },
                { provide: jwt_1.JwtService, useValue: mockJwtService },
                { provide: config_1.ConfigService, useValue: mockConfigService },
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        userRepository = module.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
        jwtService = module.get(jwt_1.JwtService);
    });
    describe('register', () => {
        it('should register a new user successfully', async () => {
            userRepository.findOne.mockResolvedValue(null);
            userRepository.create.mockReturnValue(mockUser);
            userRepository.save.mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
            const result = await service.register({
                email: 'test@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
            });
            expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
            expect(result).toHaveProperty('user');
            expect(result.user).not.toHaveProperty('password');
        });
        it('should throw ConflictException if user already exists', async () => {
            userRepository.findOne.mockResolvedValue(mockUser);
            await expect(service.register({
                email: 'test@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
            })).rejects.toThrow(common_1.ConflictException);
        });
    });
    describe('login', () => {
        it('should login user successfully', async () => {
            userRepository.findOne.mockResolvedValue(mockUser);
            userRepository.update.mockResolvedValue({});
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
            const result = await service.login({
                email: 'test@example.com',
                password: 'password123',
            });
            expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
            expect(result).toHaveProperty('user');
        });
        it('should throw UnauthorizedException for invalid credentials', async () => {
            userRepository.findOne.mockResolvedValue(null);
            await expect(service.login({
                email: 'test@example.com',
                password: 'password123',
            })).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('should throw UnauthorizedException for inactive user', async () => {
            userRepository.findOne.mockResolvedValue({ ...mockUser, isActive: false });
            await expect(service.login({
                email: 'test@example.com',
                password: 'password123',
            })).rejects.toThrow(common_1.UnauthorizedException);
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map