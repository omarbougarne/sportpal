import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, HttpStatus, HttpException, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { Role } from './enums/role.enum';
import { RolesGuard } from 'src/auth/common/guards/roles.guard';
import { Roles } from 'src/auth/common/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async findAll() {
    try {
      const result = await this.usersService.findAll();
      return result;
    } catch (error) {
      throw new HttpException('Failed to fetch users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // users.controller.ts
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getCurrentUser(@Request() req) {
    try {
      const userId = req.user.userId; // Access "userId" from JWT strategy
      return this.usersService.findById(userId);
    } catch (error) {
      throw new HttpException('Failed to fetch user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await this.usersService.create(createUserDto);
      return result;
    } catch (error) {
      throw new HttpException('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  async update(@Param('id') userId: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const result = await this.usersService.updateUser(userId, updateUserDto);
      return result;
    } catch (error) {
      throw new HttpException('Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const result = await this.usersService.softDeleteUser(id);
      return result;
    } catch (error) {
      throw new HttpException('Failed to delete user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
