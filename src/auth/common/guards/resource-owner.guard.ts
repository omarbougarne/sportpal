import { Injectable, CanActivate, ExecutionContext, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleRef } from '@nestjs/core';

/**
 * Resource type metadata key
 */
export const RESOURCE_TYPE = 'resourceType';

/**
 * Supported resource types
 */
export enum ResourceType {
    WORKOUT = 'workout',
    GROUP = 'group',
    TRAINER = 'trainer'
}

/**
 * Decorator to specify resource type for ownership check
 */
export const CheckResourceOwnership = (resourceType: ResourceType) =>
    Reflect.metadata(RESOURCE_TYPE, resourceType);

@Injectable()
export class ResourceOwnerGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private moduleRef: ModuleRef
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.userId;

        // If no user ID in request, deny access
        if (!userId) {
            return false;
        }

        // Get resource ID from request parameters
        const resourceId = request.params.id;
        if (!resourceId) {
            return false;
        }

        // Get resource type from metadata
        const resourceType = this.reflector.get<ResourceType>(
            RESOURCE_TYPE,
            context.getHandler()
        );

        if (!resourceType) {
            return false;
        }

        try {
            // Check ownership based on resource type
            switch (resourceType) {
                case ResourceType.WORKOUT:
                    return await this.checkWorkoutOwnership(resourceId, userId);

                case ResourceType.GROUP:
                    return await this.checkGroupOwnership(resourceId, userId);

                case ResourceType.TRAINER:
                    return await this.checkTrainerOwnership(resourceId, userId);

                default:
                    return false;
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new ForbiddenException('You do not have permission to access this resource');
        }
    }

    private async checkWorkoutOwnership(workoutId: string, userId: string): Promise<boolean> {
        // Dynamically load the service only when needed
        try {
            const workoutService = await this.moduleRef.resolve('WorkoutService');
            const workout = await workoutService.findOne(workoutId);
            return workout.creator.toString() === userId;
        } catch (error) {
            console.error('Error checking workout ownership:', error);
            return false;
        }
    }

    private async checkGroupOwnership(groupId: string, userId: string): Promise<boolean> {
        try {
            const groupService = await this.moduleRef.resolve('GroupService');
            const group = await groupService.findOne(groupId);
            return group.organizer.toString() === userId;
        } catch (error) {
            console.error('Error checking group ownership:', error);
            return false;
        }
    }

    private async checkTrainerOwnership(trainerId: string, userId: string): Promise<boolean> {
        try {
            const trainerService = await this.moduleRef.resolve('TrainerService');
            const trainer = await trainerService.findOne(trainerId);
            return trainer.userId.toString() === userId;
        } catch (error) {
            console.error('Error checking trainer ownership:', error);
            return false;
        }
    }
}