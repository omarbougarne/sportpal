import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Group, GroupDocument } from './schema/group.schema';
import { Model, Types } from 'mongoose';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/users/enums/role.enum';

@Injectable()
export class GroupService {
    private readonly logger = new Logger(GroupService.name)
    constructor(@InjectModel(Group.name) private groupModel: Model<GroupDocument>,
        private usersService: UsersService
    ) { }

    async createGroup(createGroupDto: CreateGroupDto, userId: string): Promise<{ data: Group }> {
        try {
            // Create the group
            const createGroup = new this.groupModel(createGroupDto);
            const savedGroup: GroupDocument = await createGroup.save();

            await this.usersService.updateUserGroups(userId, savedGroup._id as Types.ObjectId, Role.Organizer);

            return { data: savedGroup };
        } catch (error) {
            this.logger.error('Error creating group', error.stack);
            throw new HttpException('Error creating group', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    async joinGroup(joinGroupDto: JoinGroupDto): Promise<{ data: Group }> {
        try {
            const group = await this.groupModel.findById(joinGroupDto.groupId).exec();
            if (!group) {
                throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
            }

            if (!group.members.includes(new Types.ObjectId(joinGroupDto.userId))) {
                group.members.push(new Types.ObjectId(joinGroupDto.userId));
                await group.save();
            }
            return { data: group }
        } catch (error) {
            this.logger.error('Error joining group', error.stack)
            throw new HttpException('Error creating group', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
