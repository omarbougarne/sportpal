import { Body, Controller, Param, Post } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';

@Controller('group')
export class GroupController {
    constructor(private groupService: GroupService) { }

    @Post('create')
    async createGroup(@Param() userId: string, @Body() createGroupDto: CreateGroupDto) {
        return this.groupService.createGroup(createGroupDto, userId);
    }

    @Post('join')
    async joinGroup(@Body() joinGroupDto: JoinGroupDto) {
        return this.groupService.joinGroup(joinGroupDto);
    }
}
