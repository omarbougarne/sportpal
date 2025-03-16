// src/training-contract/dto/update-contract-status.dto.ts
import { IsEnum } from '@nestjs/class-validator';
import { ContractStatus } from '../enums/contract-status.enum';

export class UpdateContractStatusDto {
    @IsEnum(ContractStatus)
    status: ContractStatus;
}