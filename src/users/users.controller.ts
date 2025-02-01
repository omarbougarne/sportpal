import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { Role } from './enums/role.enum';
import { RolesGuard } from 'src/auth/common/guards/roles.guard';
import { Roles } from 'src/auth/common/decorators/roles.decorator';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.Admin)
  findAll() {
    
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    
  }

  @Post()
  create() {
    
    
  }

  @Patch(':id')
  update(@Param('id') userId: string, @Body() updateUserDto: UpdateUserDto) {
    
    return this.usersService.updateUser(userId, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    
    return this.usersService.sofDeleteUsers(id);
  }
}
