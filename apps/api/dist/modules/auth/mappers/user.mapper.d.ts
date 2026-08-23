import type { User } from '@prisma/client';
import type { AuthUserDto } from '@bitemate/shared';
export declare function mapUserToAuthDto(user: User): AuthUserDto;
