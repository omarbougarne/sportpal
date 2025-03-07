import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Group, GroupDocument } from './schema/group.schema';
import { Model, Types } from 'mongoose';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GroupService {
    private readonly logger = new Logger(GroupService.name)
    constructor(@InjectModel(Group.name) private groupModel: Model<GroupDocument>,
        private usersService: UsersService
    ) { }

    async createGroup(createGroupDto: CreateGroupDto, userId: string): Promise<Group> {
        try {
            // Create the group with the organizer field
            const createGroup = new this.groupModel({ ...createGroupDto, organizer: new Types.ObjectId(userId) });
            const savedGroup: GroupDocument = await createGroup.save();

            return savedGroup;
        } catch (error) {
            this.logger.error('Error creating group', error.stack);
            throw new HttpException('Error creating group', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async joinGroupByName(groupName: string, joinGroupDto: JoinGroupDto): Promise<Group> {
        try {
            const group = await this.groupModel.findOne({ name: groupName }).exec();
            if (!group) {
                throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
            }

            const userId = new Types.ObjectId(joinGroupDto.userId);
            if (!group.members.includes(userId)) {
                group.members.push(userId);
                await group.save();
            }
            return group;
        } catch (error) {
            this.logger.error('Error joining group', error.stack);
            throw new HttpException('Error joining group', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getGroupById(groupId: string): Promise<Group> {
        try {
            const group = await this.groupModel.findById(groupId).exec();
            if (!group) {
                throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
            }
            return group;
        } catch (error) {
            this.logger.error('Error fetching group by ID', error.stack)
            throw new HttpException('Error fetching group by Id', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async updateGroup(groupId: string, updateGroupDto: CreateGroupDto): Promise<Group> {
        try {
            const updateGroup = await this.groupModel.findByIdAndUpdate(groupId, updateGroupDto, { new: true })
            if (!updateGroup) {
                throw new HttpException('Group not found', HttpStatus.NOT_FOUND)
            }
            return updateGroup;
        } catch (error) {
            this.logger.error('Error updating group', error.stack)
            throw new HttpException('Error updating group', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteGroup(groupId: string, updateGroup: CreateGroupDto): Promise<Group> {
        try {
            const deleteGroup = await this.groupModel.findByIdAndDelete(groupId, updateGroup)
            if (!deleteGroup) {
                throw new HttpException('Group not found', HttpStatus.NOT_FOUND)
            }
            return deleteGroup;
        } catch (error) {
            this.logger.error('Error deleting group', error.stack)
            throw new HttpException('Error deleting group', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllGroups(): Promise<Group[]> {
        try {
            const groups = await this.groupModel.find().exec();
            return groups;
        } catch (error) {
            this.logger.error('Error fetching all groups', error.stack);
            throw new HttpException('Error fetching all groups', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async removeMemberFromGroup(groupId: string, userId: string): Promise<Group> {
        try {
            const group = await this.groupModel.findById(groupId);
            if (!group) {
                throw new HttpException('Group not found', HttpStatus.NOT_FOUND)
            }

            const memberId = new Types.ObjectId(userId);
            group.members = group.members.filter(member => !member.equals(memberId));
            await group.save();

            return group;
        } catch (error) {
            this.logger.error('Error removing member from group', error.stack);
            throw new HttpException('Error removing member from group', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async listGroupMembers(groupId: string): Promise<Types.ObjectId[]> {
        try {
            const group = await this.groupModel.findById(groupId);
            if (!group) {
                throw new HttpException('Group not found', HttpStatus.NOT_FOUND)
            }

            return group.members;
        } catch (error) {
            this.logger.error('Error listing group members', error.stack);
            throw new HttpException('Error listing group members', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async searchGroupsByParam(searchTerm: string): Promise<Group[]> {
        try {
            const groups = await this.groupModel.find({
                $or: [
                    { name: RegExp(searchTerm, 'i') },
                    { sport: RegExp(searchTerm, 'i') },
                    { activity: RegExp(searchTerm, 'i') }
                ]
            }
            ).exec();
            return groups;
        } catch (error) {
            this.logger.error('Error searching groups by name', error.stack);
            throw new HttpException('Error searching groups by name', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addMessageToGroup(groupId: string, messageId: Types.ObjectId): Promise<void> {
        await this.groupModel.findByIdAndUpdate(
            groupId,
            { $push: { messages: messageId } },
            { new: true }
        );
    }

    async getGroupsByMemberId(userId: string): Promise<Group[]> {
        try {
            const userObjectId = new Types.ObjectId(userId);
            const groups = await this.groupModel.find({
                members: { $in: [userObjectId] }
            }).exec();

            return groups;
        } catch (error) {
            this.logger.error(`Error fetching groups for member ${userId}`, error.stack);
            throw new HttpException('Error fetching user groups', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
