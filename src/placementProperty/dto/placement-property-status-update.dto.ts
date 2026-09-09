import { Expose } from "class-transformer";
import { IsNotEmpty, IsUUID, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum PlacementPropertyStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export class UpdatePlacementPropertyStatusDto {
  @ApiProperty({ type: String, description: "Placement Property Id" })
  @Expose()
  @IsNotEmpty({ message: "Placement Property Id is required" })
  @IsUUID(undefined, { message: "Placement Property Id must be a valid UUID" })
  placementPropertyId: string;

  @ApiProperty({ enum: PlacementPropertyStatus, description: "Status of the placement property" })
  @Expose()
  @IsNotEmpty({ message: "Status is required" })
  @IsEnum(PlacementPropertyStatus, {
    message: "Status must be one of: active, inactive",
  })
  status: PlacementPropertyStatus;

  @Expose()
  updatedBy: string;

  constructor(obj?: Partial<UpdatePlacementPropertyStatusDto>) {
    if (obj) {
      Object.assign(this, obj);
    }
  }
}
