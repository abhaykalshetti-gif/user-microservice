import { Expose, Type } from "class-transformer";
import {
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PlacementPropertyStatus } from "./placement-property-status-update.dto";

export class SearchPlacementPropertyDto {
  @ApiPropertyOptional({ type: String, description: "State Id" })
  @Expose()
  @IsOptional()
  @IsUUID(undefined, { message: "State Id must be a valid UUID" })
  stateId?: string;

  @ApiPropertyOptional({ type: String, description: "District Id" })
  @Expose()
  @IsOptional()
  @IsUUID(undefined, { message: "District Id must be a valid UUID" })
  districtId?: string;

  @ApiPropertyOptional({ type: String, description: "Pincode" })
  @Expose()
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiPropertyOptional({ type: String, description: "Industry" })
  @Expose()
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ type: String, description: "Domain" })
  @Expose()
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional({ type: String, description: "Property name (partial match)" })
  @Expose()
  @IsOptional()
  @IsString()
  propertyName?: string;

  @ApiPropertyOptional({ enum: PlacementPropertyStatus, description: "Status" })
  @Expose()
  @IsOptional()
  @IsEnum(PlacementPropertyStatus, {
    message: "Status must be one of: active, inactive",
  })
  status?: PlacementPropertyStatus;

  @ApiPropertyOptional({ type: Number, description: "Page number", default: 1 })
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ type: Number, description: "Page size", default: 20 })
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
