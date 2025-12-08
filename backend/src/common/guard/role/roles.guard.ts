import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './role.enum';
import { UserRepository } from '../../../common/repository/user/user.repository';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    
    const userDetails = await UserRepository.getUserDetails(user.userId);
    
    if (!userDetails) {
      throw new HttpException('User not found', HttpStatus.FORBIDDEN);
    }

    // Check if user type matches any of the required roles
    // Using toLowerCase() for case-insensitive comparison
    const userType = userDetails.type?.toLowerCase() || '';
    const hasRequiredRole = requiredRoles.some((role) => 
      userType === role.toLowerCase() || userType.includes(role.toLowerCase())
    );

    if (hasRequiredRole) {
      return true;
    } else {
      throw new HttpException(
        {
          message: 'You do not have permission to access this resource',
          error: 'Forbidden',
          statusCode: HttpStatus.FORBIDDEN,
          requiredRole: requiredRoles,
          userType: userDetails.type,
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
