import { HttpException, HttpStatus, Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Group, GroupDocument } from './schema/group.schema';
import { Model, Types } from 'mongoose';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';
import { UsersService } from 'src/users/users.service';
import { LocationService } from 'src/location/location.service';

@Injectable()
export class GroupService {
    private readonly logger = new Logger(GroupService.name)
    constructor(@InjectModel(Group.name) private groupModel: Model<GroupDocument>,
        private usersService: UsersService,
        private locationService: LocationService
    ) { }

    async createGroup(createGroupDto: CreateGroupDto, userId: string): Promise<Group> {
        try {
            this.logger.log(`Creating group "${createGroupDto.name}" for user ${userId}`);

            // Get user info
            const user = await this.usersService.findById(userId);
            if (!user) {
                throw new NotFoundException(`User with ID ${userId} not found`);
            }

            // Validate location if needed
            if (createGroupDto.location) {
                // Check if it's an ObjectId string (reference to existing location)
                if (Types.ObjectId.isValid(createGroupDto.location)) {
                    // Verify the location exists in database
                    const locationExists = await this.locationService.getLocationById(createGroupDto.location);
                    if (!locationExists) {
                        throw new NotFoundException(`Location with ID ${createGroupDto.location} not found`);
                    }
                }
                // Otherwise, it should be an embedded location object (handled by schema validation)
            }

            // Create the group with user as organizer and first member
            const group = new this.groupModel({
                ...createGroupDto,
                organizer: {
                    userId: new Types.ObjectId(userId),
                    name: user.name,
                    profileImageUrl: user.profileImageUrl || ''
                },
                members: [{
                    userId: new Types.ObjectId(userId),
                    name: user.name,
                    profileImageUrl: user.profileImageUrl || ''
                }]
            });

            // Save and return the new group
            const savedGroup = await group.save();
            this.logger.log(`Group "${savedGroup.name}" created with ID: ${savedGroup._id}`);
            return savedGroup;
        } catch (error) {
            this.logger.error(`Error creating group: ${error.message}`, error.stack);

            // Better error handling based on error type
            if (error instanceof NotFoundException) {
                throw error;
            }
            if (error.name === 'ValidationError') {
                throw new BadRequestException(`Validation error: ${error.message}`);
            }
            if (error.name === 'MongoServerError' && error.code === 11000) {
                throw new HttpException('A group with this name already exists', HttpStatus.CONFLICT);
            }

            throw new HttpException('Error creating group', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findGroupByName(name: string): Promise<Group> {
        try {
            const group = await this.groupModel.findOne({ name });
            return group;
        } catch (error) {
            this.logger.error('Error finding group by name', error.stack);
            throw new HttpException('Error finding group', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update your group.service.ts joinGroup method
    async joinGroup(groupId: string, userId: string): Promise<Group> {
        try {
            console.log(`Joining group: ${groupId} with user: ${userId}`); // Debug log

            const group = await this.groupModel.findById(groupId);
            if (!group) {
                throw new NotFoundException(`Group with ID ${groupId} not found`);
            }

            // Check if user is already a member - using toString() for safer comparison
            const userObjectId = new Types.ObjectId(userId);
            const isMember = group.members.some(member =>
                member.userId.toString() === userObjectId.toString()
            );

            if (isMember) {
                console.log('User is already a member'); // Debug log
                throw new BadRequestException('User is already a member of this group');
            }

            // Get user info
            const user = await this.usersService.findById(userId);
            if (!user) {
                throw new NotFoundException(`User with ID ${userId} not found`);
            }

            // Add user to members
            console.log('Adding member to group'); // Debug log
            group.members.push({
                userId: userObjectId,
                name: user.name,
                profileImageUrl: user.profileImageUrl || ''
            });

            // Save with await - CRITICAL!
            console.log('Saving group with new member'); // Debug log
            const savedGroup = await group.save();
            console.log(`Group saved with ${savedGroup.members.length} members`); // Confirm save

            return savedGroup;
        } catch (error) {
            console.error('Error in joinGroup:', error); // Log full error
            throw error;
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



            group.members = group.members.filter(member => !member.userId.equals(memberId));

            await group.save();
            return group;
        } catch (error) {
            this.logger.error('Error removing member from group', error.stack);
            throw new HttpException('Error removing member from group', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getGroupMembers(groupId: string): Promise<Types.ObjectId[]> {
        const group = await this.groupModel.findById(groupId);
        if (!group) {
            throw new NotFoundException(`Group with ID ${groupId} not found`);
        }
        return group.members.map(member => member.userId);
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




    async findNearbyGroups(longitude: number, latitude: number, maxDistance: number = 5000): Promise<Group[]> {
        try {

            const nearbyLocations = await this.locationService.findNearby(latitude, longitude, maxDistance);
            const locationIds = nearbyLocations.map(loc => (loc as any)._id);


            return this.groupModel.find({
                location: { $in: locationIds }
            }).populate('organizer', 'name email profileImageUrl')
                .exec();
        } catch (error) {
            throw new HttpException('Error finding nearby groups', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async findGroupsNearUser(userId: string, maxDistance: number = 5000): Promise<Group[]> {
        try {
            const user = await this.usersService.findOne(userId);
            if (!user || !user.location) {
                throw new HttpException('User not found or has no location', HttpStatus.BAD_REQUEST);
            }

            const [longitude, latitude] = user.location.coordinates;
            return this.findNearbyGroups(longitude, latitude, maxDistance);
        } catch (error) {
            throw new HttpException('Error finding groups near user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async leaveGroup(groupId: string, userId: string): Promise<Group> {
        try {
            const group = await this.groupModel.findById(groupId);
            if (!group) {
                throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
            }

            const userObjectId = new Types.ObjectId(userId);


            const isMember = group.members.some(member => member.userId.equals(userObjectId));
            if (!isMember) {
                throw new HttpException('User is not a member of this group', HttpStatus.BAD_REQUEST);
            }


            if (group.organizer.userId.equals(userObjectId)) {
                throw new HttpException(
                    'Organizers cannot leave their own group. Transfer ownership or delete the group instead.',
                    HttpStatus.BAD_REQUEST
                );
            }


            group.members = group.members.filter(member => !member.userId.equals(userObjectId));
            await group.save();

            return group;
        } catch (error) {
            this.logger.error('Error leaving group', error.stack);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Error leaving group', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
