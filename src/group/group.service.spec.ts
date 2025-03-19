import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpException, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { GroupService } from './group.service';
import { Group, GroupDocument } from './schema/group.schema';
import { UsersService } from '../users/users.service';
import { CreateGroupDto } from './dto/create-group.dto';

describe('GroupService', () => {
  let groupService: GroupService;
  let groupModel: Model<GroupDocument>;
  let usersService: UsersService;

  // Fix: Use 24 character hex strings for ObjectIds
  const mockUserId = '6123456789abcdef12345678';
  const mockGroupId = '6023456789abcdef12345678';
  const mockLocationId = '6523456789abcdef12345678';
  const mockOrganizerId = '7023456789abcdef12345678';
  const mockMessageId = '9923456789abcdef12345678';

  const mockUser = {
    _id: mockUserId,
    name: 'Test User',
    email: 'test@example.com',
    profileImageUrl: 'test-image.jpg',
  };

  const mockGroupDto: CreateGroupDto = {
    name: 'Test Group',
    sport: 'Running',
    activity: 'Trail',
    location: mockLocationId,
  };

  // Create a proper mock group with methods
  const mockGroup = {
    _id: mockGroupId,
    name: 'Test Group',
    sport: 'Running',
    activity: 'Trail',
    location: mockLocationId,
    organizer: {
      userId: new Types.ObjectId(mockUserId),
      name: 'Test User',
      profileImageUrl: 'test-image.jpg',
    },
    members: [
      {
        userId: new Types.ObjectId(mockUserId),
        name: 'Test User',
        profileImageUrl: 'test-image.jpg',
      },
    ],
    messages: [],
    save: jest.fn().mockResolvedValue({
      _id: mockGroupId,
      name: 'Test Group',
      members: [{ userId: new Types.ObjectId(mockUserId), name: 'Test User' }]
    }),
    equals: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        {
          provide: getModelToken(Group.name),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            exec: jest.fn(),
            create: jest.fn(),
            constructor: jest.fn().mockImplementation(() => mockGroup),
            new: jest.fn().mockImplementation(() => mockGroup)
          },
        },
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    groupService = module.get<GroupService>(GroupService);
    groupModel = module.get<Model<GroupDocument>>(getModelToken(Group.name));
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Existing tests...

  describe('getGroupById', () => {
    it('should return a group when found', async () => {
      // Arrange
      const mockFindByIdExec = {
        exec: jest.fn().mockResolvedValue(mockGroup),
      };
      jest.spyOn(groupModel, 'findById').mockReturnValue(mockFindByIdExec as any);

      // Act
      const result = await groupService.getGroupById(mockGroupId);

      // Assert
      expect(groupModel.findById).toHaveBeenCalledWith(mockGroupId);
      expect(result).toEqual(mockGroup);
    });

    it('should throw HttpException if group is not found', async () => {
      // Arrange
      const mockFindByIdExec = {
        exec: jest.fn().mockResolvedValue(null),
      };
      jest.spyOn(groupModel, 'findById').mockReturnValue(mockFindByIdExec as any);

      // Act & Assert
      await expect(groupService.getGroupById(mockGroupId))
        .rejects.toThrow(new HttpException('Error fetching group by Id', HttpStatus.INTERNAL_SERVER_ERROR));
    });
  });

  describe('updateGroup', () => {
    it('should update a group successfully', async () => {
      // Arrange
      const updatedGroup = { ...mockGroup, name: 'Updated Group Name' };
      jest.spyOn(groupModel, 'findByIdAndUpdate').mockResolvedValue(updatedGroup as any);

      // Act
      const result = await groupService.updateGroup(mockGroupId, {
        ...mockGroupDto,
        name: 'Updated Group Name'
      });

      // Assert
      expect(groupModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockGroupId,
        { ...mockGroupDto, name: 'Updated Group Name' },
        { new: true }
      );
      expect(result.name).toBe('Updated Group Name');
    });

    it('should throw HttpException if group is not found', async () => {
      // Arrange
      jest.spyOn(groupModel, 'findByIdAndUpdate').mockResolvedValue(null);

      // Act & Assert
      await expect(groupService.updateGroup(mockGroupId, mockGroupDto))
        .rejects.toThrow(new HttpException('Error updating group', HttpStatus.INTERNAL_SERVER_ERROR));
    });
  });

  describe('deleteGroup', () => {
    it('should delete a group successfully', async () => {
      // Arrange
      jest.spyOn(groupModel, 'findByIdAndDelete').mockResolvedValue(mockGroup as any);

      // Act
      const result = await groupService.deleteGroup(mockGroupId, mockGroupDto);

      // Assert
      expect(groupModel.findByIdAndDelete).toHaveBeenCalledWith(mockGroupId, mockGroupDto);
      expect(result).toEqual(mockGroup);
    });

    it('should throw HttpException if group is not found', async () => {
      // Arrange
      jest.spyOn(groupModel, 'findByIdAndDelete').mockResolvedValue(null);

      // Act & Assert
      await expect(groupService.deleteGroup(mockGroupId, mockGroupDto))
        .rejects.toThrow(new HttpException('Error deleting group', HttpStatus.INTERNAL_SERVER_ERROR));
    });
  });

  describe('getAllGroups', () => {
    it('should return all groups', async () => {
      // Arrange
      const mockGroups = [mockGroup, { ...mockGroup, _id: 'another-id' }];
      const mockFindExec = {
        exec: jest.fn().mockResolvedValue(mockGroups),
      };
      jest.spyOn(groupModel, 'find').mockReturnValue(mockFindExec as any);

      // Act
      const result = await groupService.getAllGroups();

      // Assert
      expect(groupModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockGroups);
      expect(result.length).toBe(2);
    });

    it('should handle errors properly', async () => {
      // Arrange
      const mockFindExec = {
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      jest.spyOn(groupModel, 'find').mockReturnValue(mockFindExec as any);

      // Act & Assert
      await expect(groupService.getAllGroups())
        .rejects.toThrow(new HttpException('Error fetching all groups', HttpStatus.INTERNAL_SERVER_ERROR));
    });
  });

  describe('removeMemberFromGroup', () => {
    it('should remove a member from a group', async () => {
      // Arrange
      const mockGroupWithMultipleMembers = {
        ...mockGroup,
        members: [
          {
            userId: new Types.ObjectId(mockUserId),
            name: 'Test User',
            profileImageUrl: 'test-image.jpg',
            equals: jest.fn().mockImplementation((id) => id.toString() === mockUserId),
          },
          {
            userId: new Types.ObjectId(mockOrganizerId),
            name: 'Organizer User',
            profileImageUrl: 'organizer-image.jpg',
            equals: jest.fn().mockImplementation((id) => id.toString() === mockOrganizerId),
          },
        ],
        save: jest.fn().mockResolvedValue({
          ...mockGroup,
          members: [
            {
              userId: new Types.ObjectId(mockOrganizerId),
              name: 'Organizer User',
              profileImageUrl: 'organizer-image.jpg',
            },
          ],
        }),
      };

      jest.spyOn(groupModel, 'findById').mockResolvedValue(mockGroupWithMultipleMembers as any);

      // Act
      const result = await groupService.removeMemberFromGroup(mockGroupId, mockUserId);

      // Assert
      expect(groupModel.findById).toHaveBeenCalledWith(mockGroupId);
      expect(mockGroupWithMultipleMembers.save).toHaveBeenCalled();
      expect(result.members.length).toBe(1);
    });

    it('should throw HttpException if group is not found', async () => {
      // Arrange
      jest.spyOn(groupModel, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(groupService.removeMemberFromGroup(mockGroupId, mockUserId))
        .rejects.toThrow(new HttpException('Error removing member from group', HttpStatus.INTERNAL_SERVER_ERROR));
    });
  });

  describe('getGroupMembers', () => {
    it('should return group members', async () => {
      // Arrange
      jest.spyOn(groupModel, 'findById').mockResolvedValue(mockGroup as any);

      // Act
      const result = await groupService.getGroupMembers(mockGroupId);

      // Assert
      expect(groupModel.findById).toHaveBeenCalledWith(mockGroupId);
      expect(result.length).toBe(1);
      expect(result[0].toString()).toBe(mockGroup.members[0].userId.toString());
    });

    it('should throw NotFoundException if group is not found', async () => {
      // Arrange
      jest.spyOn(groupModel, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(groupService.getGroupMembers(mockGroupId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('searchGroupsByParam', () => {
    it('should search groups by parameter', async () => {
      // Arrange
      const mockGroups = [mockGroup];
      const mockFindExec = {
        exec: jest.fn().mockResolvedValue(mockGroups),
      };
      jest.spyOn(groupModel, 'find').mockReturnValue(mockFindExec as any);
      const searchTerm = 'Run';

      // Act
      const result = await groupService.searchGroupsByParam(searchTerm);

      // Assert
      expect(groupModel.find).toHaveBeenCalledWith({
        $or: [
          { name: RegExp(searchTerm, 'i') },
          { sport: RegExp(searchTerm, 'i') },
          { activity: RegExp(searchTerm, 'i') }
        ]
      });
      expect(result).toEqual(mockGroups);
    });
  });

  describe('addMessageToGroup', () => {
    it('should add a message to a group', async () => {
      // Arrange
      const messageObjId = new Types.ObjectId(mockMessageId);
      jest.spyOn(groupModel, 'findByIdAndUpdate').mockResolvedValue(mockGroup as any);

      // Act
      await groupService.addMessageToGroup(mockGroupId, messageObjId);

      // Assert
      expect(groupModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockGroupId,
        { $push: { messages: messageObjId } },
        { new: true }
      );
    });
  });

  describe('getGroupsByMemberId', () => {
    it('should get groups by member ID', async () => {
      // Arrange
      const mockGroups = [mockGroup];
      const mockFindExec = {
        exec: jest.fn().mockResolvedValue(mockGroups),
      };
      jest.spyOn(groupModel, 'find').mockReturnValue(mockFindExec as any);

      // Act
      const result = await groupService.getGroupsByMemberId(mockUserId);

      // Assert
      expect(groupModel.find).toHaveBeenCalledWith({
        members: { $in: [new Types.ObjectId(mockUserId)] }
      });
      expect(result).toEqual(mockGroups);
    });

    it('should handle errors properly', async () => {
      // Arrange
      const mockFindExec = {
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      jest.spyOn(groupModel, 'find').mockReturnValue(mockFindExec as any);

      // Act & Assert
      await expect(groupService.getGroupsByMemberId(mockUserId))
        .rejects.toThrow(new HttpException('Error fetching user groups', HttpStatus.INTERNAL_SERVER_ERROR));
    });
  });

  describe('leaveGroup', () => {
    it('should remove a user from group members', async () => {
      // Arrange
      const mockGroupWithMultipleMembers = {
        ...mockGroup,
        organizer: {
          userId: new Types.ObjectId(mockOrganizerId),
          name: 'Organizer User',
        },
        members: [
          {
            userId: new Types.ObjectId(mockUserId),
            name: 'Test User',
            profileImageUrl: 'test-image.jpg',
            equals: jest.fn().mockImplementation((id) => id.toString() === mockUserId),
          },
          {
            userId: new Types.ObjectId(mockOrganizerId),
            name: 'Organizer User',
            profileImageUrl: 'organizer-image.jpg',
            equals: jest.fn().mockImplementation((id) => id.toString() === mockOrganizerId),
          },
        ],
        save: jest.fn().mockResolvedValue({
          ...mockGroup,
          members: [
            {
              userId: new Types.ObjectId(mockOrganizerId),
              name: 'Organizer User',
              profileImageUrl: 'organizer-image.jpg',
            },
          ],
        }),
      };

      // Mock equals method for organizer userId
      mockGroupWithMultipleMembers.organizer.userId.equals = jest.fn()
        .mockImplementation((id) => id.toString() === mockOrganizerId);

      jest.spyOn(groupModel, 'findById').mockResolvedValue(mockGroupWithMultipleMembers as any);

      // Act
      const result = await groupService.leaveGroup(mockGroupId, mockUserId);

      // Assert
      expect(groupModel.findById).toHaveBeenCalledWith(mockGroupId);
      expect(mockGroupWithMultipleMembers.save).toHaveBeenCalled();
      expect(result.members.length).toBe(1);
    });
  });
});