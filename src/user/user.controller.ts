import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from 'src/common/decorators/sub.decorator';
import {
  ApiSuccessResponse,
} from '../common/decorators/api-response.decorator';
import { UserResponseDto } from './dto/response.dto';

@ApiBearerAuth('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  @ApiOperation({ summary: 'Get current user' })
  @ApiSuccessResponse(UserResponseDto)
  async getUserByClerkId(@User('sub') userId: string): Promise<UserResponseDto> {
    return this.userService.findUserById(userId);
  }
}