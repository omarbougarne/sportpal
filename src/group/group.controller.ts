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
    UseGuards,
    Request,
    NotFoundException,
    BadRequestException

} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';
import { RolesGuard } from '../auth/common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/common/guards/jwt-auth.guard';

@Controller('groups')
@UseGuards(RolesGuard)
export class GroupController {
    private readonly logger = new Logger(GroupController.name)
    constructor(private readonly groupService: GroupService) { }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    async createGroup(
        @Body() createGroupDto: CreateGroupDto,
        @Request() req
    ) {
        try {
            const userId = req.user.sub;

            if (!userId) {
                throw new BadRequestException('User ID not found in authentication token');
            }
            console.log('Auth user ID:', userId);
            return await this.groupService.createGroup(createGroupDto, userId);
        } catch (error) {
            this.logger.error('Error in createGroup controller', error.stack);
            throw error;
        }
    }
    @Get('search')
    async searchGroupsByParam(@Query('name') name: string) {
        try {
            const groups = await this.groupService.searchGroupsByParam(name);
            return groups;
        } catch (error) {
            this.logger.error('Error in searchGroupsByName controller', error.stack);
            throw new HttpException('Failed to search groups', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('member/:userId')
    async getGroupsByMemberId(@Param('userId') userId: string) {
        try {
            return await this.groupService.getGroupsByMemberId(userId);
        } catch (error) {
            this.logger.error('Error fetching member groups', error.stack);

            // Re-throw NestJS exceptions as-is
            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException(
                'Failed to fetch member groups',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    @Get('joined')
    @UseGuards(JwtAuthGuard)
    async getJoinedGroups(@Request() req) {
        try {
            const userId = req.user.sub;
            if (!userId) {
                throw new BadRequestException('User ID not found in authentication token');
            }
            return await this.groupService.getJoinedGroups(userId);
        } catch (error) {
            this.logger.error('Error in getJoinedGroups controller', error.stack);
            throw new HttpException('Failed to fetch joined groups', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @Post(':id/leave')
    @UseGuards(JwtAuthGuard)
    async leaveGroup(@Param('id') groupId: string, @Request() req) {
        try {
            return await this.groupService.leaveGroup(groupId, req.user.userId);
        } catch (error) {
            this.logger.error(`Error leaving group: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Post(':groupName/join')
    @UseGuards(JwtAuthGuard)
    async joinGroupByName(
        @Param('groupName') groupName: string,
        @Body() joinGroupDto: JoinGroupDto,
        @Request() req
    ) {
        try {
            console.log('Auth user object:', req.user);
            if (!req.user || !req.user.sub) {
                throw new BadRequestException('Authentication error: User ID not found');
            }
            console.log(`Attempting to join group: ${groupName}`);
            console.log(`User ID: ${req.user.sub}`);

            const group = await this.groupService.findGroupByName(groupName);
            if (!group) {
                throw new NotFoundException(`Group "${groupName}" not found`);
            }
            console.log(`Found group: ${group.name} with ID: ${(group as any)._id}`);
            const result = await this.groupService.joinGroup(
                (group as any)._id.toString(),
                req.user.sub
            );

            console.log(`Join operation completed, member count: ${result.members.length}`);
            return result;
        } catch (error) {
            this.logger.error(`Error in joinGroupByName: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Get(':id')
    async getGroupById(@Param('id') groupId: string) {
        try {
            const group = await this.groupService.getGroupById(groupId);
            return group;
        } catch (error) {
            this.logger.error('Error in getGroupById controller', error.stack);
            throw new HttpException('Failed to fetch group', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch(':id')
    async updateGroup(@Param('id') groupId: string, @Body() updateGroupDto: CreateGroupDto) {
        try {
            const group = await this.groupService.updateGroup(groupId, updateGroupDto);
            return group;
        } catch (error) {
            this.logger.error('Error in updateGroup controller', error.stack);
            throw new HttpException('Failed to update group', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':id')
    async deleteGroup(@Param('id') groupId: string, @Body() updateGroupDto: CreateGroupDto) {
        try {
            const group = await this.groupService.deleteGroup(groupId, updateGroupDto);
            return group;
        } catch (error) {
            this.logger.error('Error in deleteGroup controller', error.stack);
            throw new HttpException('Failed to delete group', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('')
    async getAllGroups() {
        try {
            const groups = await this.groupService.getAllGroups();
            return groups;
        } catch (error) {
            this.logger.error('Error in getAllGroups controller', error.stack);
            throw new HttpException('Failed to fetch groups', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':groupId/members/:userId')
    async removeMemberFromGroup(
        @Param('groupId') groupId: string,
        @Param('userId') userId: string,
    ) {
        try {
            const result = await this.groupService.removeMemberFromGroup(groupId, userId);
            return result;
        } catch (error) {
            this.logger.error('Error in removeMemberFromGroup controller', error.stack);
            throw new HttpException('Failed to remove member from group', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':groupId/members')
    async listGroupMembers(@Param('groupId') groupId: string) {
        try {
            const members = await this.groupService.getGroupMembers(groupId);
            return members;
        } catch (error) {
            this.logger.error('Error in listGroupMembers controller', error.stack);
            throw new HttpException('Failed to list group members', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // Add to group.controller.ts
    @Delete(':groupId/members')
    @UseGuards(JwtAuthGuard)
    async removeMembers(
        @Param('groupId') groupId: string,
        @Body() body: { memberIds: string[] },
        @Request() req
    ) {
        try {
            // Validate input
            if (!body.memberIds || !Array.isArray(body.memberIds) || body.memberIds.length === 0) {
                throw new BadRequestException('Please provide an array of member IDs to remove');
            }

            return await this.groupService.removeMultipleMembers(
                groupId,
                body.memberIds,
                req.user.userId
            );
        } catch (error) {
            this.logger.error(`Error in removeMembers controller: ${error.message}`, error.stack);

            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException(
                'Failed to remove members from group',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
