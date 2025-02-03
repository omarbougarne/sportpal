import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    HttpStatus,
    HttpException,
    Logger,
    Query,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';

@Controller('groups')
export class GroupController {
    private readonly logger = new Logger(GroupController.name)
    constructor(private readonly groupService: GroupService) { }

    //change to query decoretor
    @Post()
    async createGroup(@Body() createGroupDto: CreateGroupDto, @Query('userId') userId: string) {
        try {
            const result = await this.groupService.createGroup(createGroupDto, userId);
            return { status: HttpStatus.CREATED, data: result.data };
        } catch (error) {
            this.logger.error('Error in createGroup controller', error.stack);
            throw new HttpException('Failed to create group', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @Post('join')
    async joinGroup(@Body() joinGroupDto: JoinGroupDto) {
        try {
            const result = await this.groupService.joinGroup(joinGroupDto);
            return { status: HttpStatus.OK, data: result.data };
        } catch (error) {
            this.logger.error('Error in joinGroup controller', error.stack);
            throw new HttpException('Failed to join group', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    async getGroupById(@Param('id') groupId: string) {
        try {
            const group = await this.groupService.getGroupById(groupId)
            return { status: HttpStatus.OK, data: group }
        } catch (error) {
            this.logger.error('Error in getGroupById controller', error.stack);
            throw new HttpException('Failed to fetch group', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    //change later to patch method
    @Patch(':id')
    async updateGroup(@Param('id') groupId: string, @Body() updateGroupDto: CreateGroupDto) {
        try {
            const group = await this.groupService.updateGroup(groupId, updateGroupDto)
            return { status: HttpStatus.OK, data: group }
        } catch (error) {
            this.logger.error('Error in updateGroup controller', error.stack);
            throw new HttpException('Failed to fetch group', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':id')
    async deleteGroup(@Param('id') groupId: string, @Body() updateGroupDto: CreateGroupDto) {
        try {
            const group = await this.groupService.deleteGroup(groupId, updateGroupDto)
            return { status: HttpStatus.OK, data: group }
        } catch (error) {
            this.logger.error('Error in deleteGroup controller', error.stack);
            throw new HttpException('Failed to fetch group', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('')
    async getAllGroups() {
        try {
            const group = await this.groupService.getAllGroups()
            return { status: HttpStatus.OK, data: group }
        } catch (error) {
            this.logger.error('Error in getAllGroups controller', error.stack);
            throw new HttpException('Failed to fetch group', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':groupId/members/:userId')
    async removeMemberFromGroup(
        @Param('groupId') groupId: string,
        @Param('userId') userId: string,
    ) {
        try {
            const result = await this.groupService.removeMemberFromGroup(groupId, userId);
            return { status: HttpStatus.OK, data: result.data };
        } catch (error) {
            this.logger.error('Error in removeMemberFromGroup controller', error.stack);
            throw new HttpException('Failed to remove member from group', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':groupId/members')
    async listGroupMembers(@Param('groupId') groupId: string) {
        try {
            const result = await this.groupService.listGroupMembers(groupId);
            return { status: HttpStatus.OK, members: result.members };
        } catch (error) {
            this.logger.error('Error in listGroupMembers controller', error.stack);
            throw new HttpException('Failed to list group members', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('search')
    async searchGroupsByParam(@Query('name') name: string) {
        try {
            const result = await this.groupService.searchGroupsByParam(name);
            return { status: HttpStatus.OK, data: result.data };
        } catch (error) {
            this.logger.error('Error in searchGroupsByName controller', error.stack);
            throw new HttpException('Failed to search groups', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
