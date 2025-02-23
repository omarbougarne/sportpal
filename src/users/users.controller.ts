import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, HttpStatus, HttpException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { Role } from './enums/role.enum';
import { RolesGuard } from 'src/auth/common/guards/roles.guard';
import { Roles } from 'src/auth/common/decorators/roles.decorator';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @Roles(Role.Admin)
  async findAll() {
    try {
      const result = await this.usersService.findAll();
      return { status: HttpStatus.OK, data: result.data };
    } catch (error) {
      throw new HttpException('Failed to fetch users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @Roles(Role.User)
  async findOne(@Param('id') id: string) {
    try {
      const result = await this.usersService.findOne(id);
      return { status: HttpStatus.OK, data: result.data };
    } catch (error) {
      throw new HttpException('Failed to fetch user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @Roles(Role.Admin)
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await this.usersService.create(createUserDto);
      return { status: HttpStatus.CREATED, data: result.data };
    } catch (error) {
      throw new HttpException('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  @Roles(Role.Admin)
  async update(@Param('id') userId: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const result = await this.usersService.updateUser(userId, updateUserDto);
      return { status: HttpStatus.OK, data: result.data };
    } catch (error) {
      throw new HttpException('Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @Roles(Role.Admin)
  async remove(@Param('id') id: string) {
    try {
      const result = await this.usersService.sofDeleteUsers(id);
      return { status: HttpStatus.OK, data: result.data };
    } catch (error) {
      throw new HttpException('Failed to delete user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
