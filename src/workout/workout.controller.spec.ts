import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutService } from './workout.service';
import { getModelToken } from '@nestjs/mongoose';
import { Workout } from './schema/workout.schema';
import { Model } from 'mongoose';

describe('WorkoutService', () => {
  let service: WorkoutService;
  let workoutModel: Model<Workout>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutService,
        // Add mock for WorkoutModel
        {
          provide: getModelToken(Workout.name),
          useValue: {
            new: jest.fn(),
            constructor: jest.fn(),
            find: jest.fn().mockReturnThis(),
            findOne: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
            exec: jest.fn(),
            // Add any other methods used by your service
            save: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            populate: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
          },
        },
      ],
    }).compile();

    service = module.get<WorkoutService>(WorkoutService);
    workoutModel = module.get<Model<Workout>>(getModelToken(Workout.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add your specific tests for WorkoutService methods
  describe('findAll', () => {
    it('should return all workouts', async () => {
      // Create a mock filter object that matches what your service expects
      const mockFilter = {
        // Add required properties, for example:
        userId: 'some-user-id',
        // Add other filter properties as needed
      };

      const mockWorkouts = [{ name: 'Test Workout' }];

      jest.spyOn(workoutModel, 'find').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockWorkouts),
      } as any);

      // Pass the required filter parameter
      expect(await service.findAll(mockFilter as any)).toBe(mockWorkouts);
    });
  });

  // Additional test examples
  describe('create', () => {
    it('should create a new workout', async () => {
      const createWorkoutDto = { name: 'New Workout', type: 'cardio' };
      const mockWorkout = { id: 'mock-id', ...createWorkoutDto };

      jest.spyOn(workoutModel, 'create').mockResolvedValueOnce(mockWorkout as any);

      expect(await service.create(createWorkoutDto as any)).toBe(mockWorkout);
    });
  });
});