import { Module } from '@nestjs/common';
import { ResourceOwnerGuard } from '../common/guards/resource-owner.guard';
import { WorkoutModule } from '../workout/workout.module';
import { GroupModule } from '../group/group.module';
import { TrainerModule } from '../trainer/trainer.module';

@Module({
    imports: [
        // Import modules containing the services you need
        WorkoutModule,
        GroupModule,
        TrainerModule
    ],
    providers: [ResourceOwnerGuard],
    exports: [ResourceOwnerGuard]
})
export class ResourceGuardModule { }