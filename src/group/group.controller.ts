import { Controller, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';

@Controller('groups')
export class GroupController {
    constructor(private readonly groupService: GroupService) { }

    //change to query decoretor
    @Post('create/:userId')
    async createGroup(@Param('userId') userId: string, @Body() createGroupDto: CreateGroupDto) {
        return this.groupService.createGroup(createGroupDto, userId);
    }

    @Post('join')
    async joinGroup(@Body() joinGroupDto: JoinGroupDto) {
        return this.groupService.joinGroup(joinGroupDto);
    }
}
